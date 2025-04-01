
import { Stem } from "../components/StemPlayer";

// URL base da API do Replicate
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const API_TOKEN = "r8_GxZsGZFhIQnBMesowYrVXtar9dWEc0F0yz8yQ"; // Token da API Replicate

// Função principal para processar a separação de stems
export const processStemSeparation = async (
  file: File,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> => {
  try {
    // Preparar o arquivo para envio
    const formData = new FormData();
    formData.append('audio', file);
    
    // Determinar o modelo com base no tipo de separação
    const model = separationType === '2stem' 
      ? 'facebookresearch/demucs:v3.0.0' 
      : 'facebookresearch/demucs:v3.0.0'; // Mesmo modelo, mas configuraremos para 4 stems
    
    // Simular o início do upload
    onProgress(10);
    
    // Converter o arquivo em uma URL base64
    const base64Audio = await fileToBase64(file);
    onProgress(20);
    
    // Configurar parâmetros para a API do Replicate
    const payload = {
      version: model,
      input: {
        audio: base64Audio,
        // Definir parâmetros específicos para 2stem ou 4stem
        ...(separationType === '2stem' ? { stems: "vocals" } : {})
      }
    };
    
    // Iniciar a predição no Replicate
    console.log("Enviando arquivo para processamento no Replicate API");
    const predictionResponse = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Token ${API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    if (!predictionResponse.ok) {
      const errorData = await predictionResponse.json();
      throw new Error(`Erro na API Replicate: ${JSON.stringify(errorData)}`);
    }
    
    const prediction = await predictionResponse.json();
    onProgress(30);
    
    // Verificar status da predição periodicamente
    const predictionId = prediction.id;
    const result = await pollPredictionStatus(predictionId, onProgress);
    
    // Obter URLs dos stems resultantes
    onProgress(90);
    
    // Processar os resultados em Stems para nossa interface
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    let stems: Stem[] = [];
    
    if (separationType === '2stem') {
      stems = [
        {
          id: '1',
          name: `${baseName} - Vocals`,
          url: result.vocals,
          type: 'vocals'
        },
        {
          id: '2',
          name: `${baseName} - Accompaniment`,
          url: result.accompaniment || result.other,
          type: 'accompaniment'
        }
      ];
    } else {
      // 4-stem format
      stems = [
        {
          id: '1',
          name: `${baseName} - Vocals`,
          url: result.vocals,
          type: 'vocals'
        },
        {
          id: '2',
          name: `${baseName} - Drums`,
          url: result.drums,
          type: 'drums'
        },
        {
          id: '3',
          name: `${baseName} - Bass`,
          url: result.bass,
          type: 'bass'
        },
        {
          id: '4',
          name: `${baseName} - Other`,
          url: result.other,
          type: 'other'
        }
      ];
    }
    
    onProgress(100);
    return stems;
    
  } catch (error) {
    console.error("Erro ao processar stems:", error);
    throw error instanceof Error ? error : new Error("Falha no processamento do áudio");
  }
};

// Função auxiliar para converter arquivo em base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remover o prefixo 'data:audio/xxx;base64,' para ter apenas os dados codificados
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Função para verificar o status da predição periodicamente
const pollPredictionStatus = async (
  predictionId: string, 
  onProgress: (progress: number) => void
): Promise<Record<string, string>> => {
  const maxAttempts = 60; // 5 minutos no total com intervalo de 5 segundos
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
      headers: {
        "Authorization": `Token ${API_TOKEN}`,
      }
    });
    
    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      throw new Error(`Erro ao verificar status: ${JSON.stringify(errorData)}`);
    }
    
    const statusData = await statusResponse.json();
    
    // Verificar o status
    if (statusData.status === "succeeded") {
      console.log("Processamento concluído com sucesso!");
      return statusData.output;
    } else if (statusData.status === "failed") {
      throw new Error(`Falha no processamento: ${statusData.error || "Erro desconhecido"}`);
    } else if (statusData.status === "processing") {
      // Calcular progresso entre 30% e 90% com base no número de tentativas
      const progressPercentage = 30 + Math.min(60, (attempts / 30) * 60);
      onProgress(Math.round(progressPercentage));
    }
    
    // Aguardar antes de verificar novamente
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
    attempts++;
  }
  
  throw new Error("Tempo limite excedido para o processamento");
};

// Função mock para testes locais
export const mockStemSeparation = async (
  file: File,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> => {
  // Reliable sample audio URLs
  const SAMPLE_AUDIO_URLS = {
    vocals: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3",
    accompaniment: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
    drums: "https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-132.mp3",
    bass: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3",
    other: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3"
  };
  
  // Simular o processamento
  const totalSteps = 10;
  const stepTime = 500; // 0.5 segundo por passo
  
  // Obter o nome do arquivo sem extensão
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  
  // Simular processamento da API
  for (let step = 1; step <= totalSteps; step++) {
    await new Promise(resolve => setTimeout(resolve, stepTime));
    onProgress(Math.round((step / totalSteps) * 100));
  }
  
  console.log("Criando stems com URLs de áudio de amostra (modo mockup)");
  
  // Criar URLs de stems fictícios usando fontes confiáveis
  if (separationType === '2stem') {
    return [
      {
        id: '1',
        name: `${baseName} - Vocals`,
        url: SAMPLE_AUDIO_URLS.vocals,
        type: 'vocals'
      },
      {
        id: '2',
        name: `${baseName} - Accompaniment`,
        url: SAMPLE_AUDIO_URLS.accompaniment,
        type: 'accompaniment'
      }
    ];
  } else {
    return [
      {
        id: '1',
        name: `${baseName} - Vocals`,
        url: SAMPLE_AUDIO_URLS.vocals,
        type: 'vocals'
      },
      {
        id: '2',
        name: `${baseName} - Drums`,
        url: SAMPLE_AUDIO_URLS.drums,
        type: 'drums'
      },
      {
        id: '3',
        name: `${baseName} - Bass`,
        url: SAMPLE_AUDIO_URLS.bass,
        type: 'bass'
      },
      {
        id: '4',
        name: `${baseName} - Other`,
        url: SAMPLE_AUDIO_URLS.other,
        type: 'other'
      }
    ];
  }
};

// Defina a função que será usada (real ou mock)
// Para testes sem conectar com a API externa, use USE_MOCK_API = true
const USE_MOCK_API = false;

// Exportar a função principal que usa a API real ou o mockup
export { mockStemSeparation as _processStemSeparation };
