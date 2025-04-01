
import { Stem } from "../components/StemPlayer";

// Função mock para testes locais que agora será usada como principal
export const processStemSeparation = async (
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
  
  console.log("Criando stems com URLs de áudio de amostra (modo demo)");
  
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

// Exportamos a função original para compatibilidade com código existente
export { processStemSeparation as _processStemSeparation };
