
import { Stem } from "../components/StemPlayer";

// Sample MP3 URLs that are known to work reliably (from sample-mp3s.com)
const SAMPLE_AUDIO_URLS = {
  vocals: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3",
  accompaniment: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  drums: "https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-132.mp3",
  bass: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3",
  other: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3"
};

// Main function to handle stem separation (fully mocked, no API calls)
export const processStemSeparation = async (
  file: File,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> => {
  return await mockStemSeparation(file, separationType, onProgress);
};

// Mock function to simulate stem separation
async function mockStemSeparation(
  file: File,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> {
  // Simulate the processing time
  const totalSteps = 10;
  const stepTime = 500; // 0.5 second per step
  
  // Get the file name without extension
  const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  
  // Simulate API processing
  for (let step = 1; step <= totalSteps; step++) {
    await new Promise(resolve => setTimeout(resolve, stepTime));
    onProgress(Math.round((step / totalSteps) * 100));
  }
  
  console.log("Creating stems with sample audio URLs");
  
  // Create mock stem URLs using reliable sources
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
}
