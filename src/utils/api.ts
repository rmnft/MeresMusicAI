
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
    formData.append('separationType', separationType);
    
    // Simular o início do upload
    onProgress(10);
    
    // Enviar o arquivo para o nosso backend proxy
    const backendUrl = 'https://demucs-api.onrender.com/api/process'; // URL do nosso backend proxy
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro no servidor: ${response.status} - ${errorText}`);
    }
    
    onProgress(30);
    
    // Iniciar o polling para checar o status do processamento
    const data = await response.json();
    const jobId = data.jobId;
    
    // Polling do backend para checar status
    const result = await pollJobStatus(jobId, onProgress);
    
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

// Função para verificar o status de um job
const pollJobStatus = async (
  jobId: string, 
  onProgress: (progress: number) => void
): Promise<Record<string, string>> => {
  const backendUrl = `https://demucs-api.onrender.com/api/status/${jobId}`;
  const maxAttempts = 60; // 5 minutos no total com intervalo de 5 segundos
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const statusResponse = await fetch(backendUrl);
    
    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      throw new Error(`Erro ao verificar status: ${JSON.stringify(errorData)}`);
    }
    
    const statusData = await statusResponse.json();
    
    // Verificar o status
    if (statusData.status === "completed") {
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
// USE_MOCK_API = true para usar dados fictícios
export const USE_MOCK_API = false; 

// Exportar a função principal
export { USE_MOCK_API ? mockStemSeparation : processStemSeparation as _processStemSeparation };
