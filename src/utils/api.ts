import { Stem } from "../components/StemPlayer";

const REPLICATE_API_KEY = "r8_T9DAwbjrrcQ2XapDyktGl9mKaT4EknQ1Se7qE";
const DEMUCS_MODEL = "cjwbw/demucs:e5a2cb62bcf4649c83f0c2f38810d5404d1be5f22cafc5df90abb0e343c7b1b9";

// Flag to use mock data (for development when API calls fail)
const USE_MOCK_DATA = true;

// Sample MP3 URLs that are known to work reliably (from sample-mp3s.com)
const SAMPLE_AUDIO_URLS = {
  vocals: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3",
  accompaniment: "https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3",
  drums: "https://assets.mixkit.co/music/preview/mixkit-hazy-after-hours-132.mp3",
  bass: "https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3",
  other: "https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3"
};

// Main function to handle stem separation using Replicate
export const processStemSeparation = async (
  file: File,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> => {
  try {
    // If mock data is enabled, use that instead of actual API
    if (USE_MOCK_DATA) {
      console.log("Using mock data instead of actual API call");
      return await mockStemSeparation(file, separationType, onProgress);
    }
    
    // Start the progress with file uploading stage
    onProgress(10);
    
    // Convert the file to base64
    const base64Data = await fileToBase64(file);
    
    // Determine model parameters based on separation type
    const modelVersion = DEMUCS_MODEL;
    const twoStemMode = separationType === '2stem';
    
    console.log("Starting stem separation with Replicate API");
    
    // Send prediction request to Replicate
    const prediction = await startReplicatePrediction(
      modelVersion, 
      base64Data, 
      twoStemMode
    );
    
    if (!prediction.id) {
      throw new Error("Falha ao iniciar a predição");
    }
    
    console.log("Prediction started with ID:", prediction.id);
    
    // Poll for prediction results
    const results = await pollPredictionResults(prediction.id, onProgress);
    
    // Process and return the stem URLs
    return processStemResults(results, file.name, separationType);
  } catch (error) {
    console.error("Error in stem separation:", error);
    throw error;
  }
};

// Mock function to simulate stem separation for development
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
  
  console.log("Mock data: Creating stems with reliable audio URLs");
  
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

// Convert File to base64 string for API upload
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the prefix (e.g., "data:audio/mp3;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
}

// Start a new prediction on Replicate
async function startReplicatePrediction(
  modelVersion: string, 
  base64Audio: string,
  twoStemMode: boolean
) {
  try {
    console.log("Sending request to Replicate API");
    
    // For browser environments, due to CORS, you might need a proxy server
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          audio: `data:audio/mp3;base64,${base64Audio}`,
          two_stems: twoStemMode ? "vocals" : "no" // "vocals" for 2-stem, "no" for 4-stem
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Replicate API error:", errorText);
      throw new Error(`Falha ao iniciar predição: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error starting prediction:", error);
    throw new Error(`Falha ao conectar com a API Replicate: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Poll for prediction results
async function pollPredictionResults(
  predictionId: string, 
  onProgress: (progress: number) => void
): Promise<any> {
  let status = "starting";
  let attempts = 0;
  const maxAttempts = 100; // About 5 minutes of polling
  
  while (status !== "succeeded" && status !== "failed" && attempts < maxAttempts) {
    // Wait 3 seconds between polling attempts
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      console.log(`Polling prediction status (attempt ${attempts + 1})`);
      
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            "Authorization": `Token ${REPLICATE_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to check prediction status: ${response.status} ${errorText}`);
      }
      
      const prediction = await response.json();
      status = prediction.status;
      console.log("Current status:", status);
      
      // Update progress based on status
      switch (status) {
        case "starting":
          onProgress(20);
          break;
        case "processing":
          // Gradually increase progress from 20 to 90 as processing continues
          onProgress(20 + Math.min(70, attempts * 2)); 
          break;
        case "succeeded":
          onProgress(100);
          console.log("Processing succeeded:", prediction.output);
          return prediction.output;
        case "failed":
          console.error("Prediction failed:", prediction.error);
          throw new Error("Prediction failed: " + (prediction.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error polling prediction status:", error);
      throw error;
    }
    
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    throw new Error("Prediction timed out");
  }
  
  throw new Error("Unexpected error in prediction polling");
}

// Process results and create stem objects
function processStemResults(
  results: any, 
  fileName: string, 
  separationType: '2stem' | '4stem'
): Stem[] {
  console.log("Processing results:", results);
  
  // Get the file name without extension
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  
  if (separationType === '2stem') {
    // In 2-stem mode, we expect vocals and accompaniment
    const vocalsUrl = results.find((url: string) => url.includes("vocals"));
    const otherUrl = results.find((url: string) => url.includes("no_vocals") || url.includes("other"));
    
    if (!vocalsUrl || !otherUrl) {
      throw new Error("Missing expected output files from Replicate");
    }
    
    return [
      {
        id: '1',
        name: `${baseName} - Vocals`,
        url: vocalsUrl,
        type: 'vocals'
      },
      {
        id: '2',
        name: `${baseName} - Accompaniment`,
        url: otherUrl,
        type: 'accompaniment'
      }
    ];
  } else {
    // In 4-stem mode, expect vocals, drums, bass, and other
    const stems: { type: 'vocals' | 'drums' | 'bass' | 'other', label: string }[] = [
      { type: 'vocals', label: 'vocals' },
      { type: 'drums', label: 'drums' },
      { type: 'bass', label: 'bass' },
      { type: 'other', label: 'other' }
    ];
    
    return stems.map((stem, index) => {
      const stemUrl = results.find((url: string) => url.includes(stem.label));
      if (!stemUrl) {
        throw new Error(`Missing ${stem.label} output file from Replicate`);
      }
      
      return {
        id: String(index + 1),
        name: `${baseName} - ${stem.label.charAt(0).toUpperCase() + stem.label.slice(1)}`,
        url: stemUrl,
        type: stem.type
      };
    });
  }
}
