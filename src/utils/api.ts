
import { Stem } from "../components/StemPlayer";

const REPLICATE_API_KEY = "r8_T9DAwbjrrcQ2XapDyktGl9mKaT4EknQ1Se7qE";
const DEMUCS_MODEL = "cjwbw/demucs:e5a2cb62bcf4649c83f0c2f38810d5404d1be5f22cafc5df90abb0e343c7b1b9";

// Main function to handle stem separation using Replicate
export const processStemSeparation = async (
  file: File,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> => {
  try {
    // Start the progress with file uploading stage
    onProgress(10);
    
    // Convert the file to base64
    const base64Data = await fileToBase64(file);
    
    // Determine model parameters based on separation type
    const modelVersion = DEMUCS_MODEL;
    const twoStemMode = separationType === '2stem';
    
    // Create a mock response for development/testing - we'll remove this when the API works
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock data for development");
      return await mockSeparation(file.name, separationType, onProgress);
    }
    
    // Send prediction request to Replicate via a proxy if needed
    const prediction = await startReplicatePrediction(
      modelVersion, 
      base64Data, 
      twoStemMode
    );
    
    if (!prediction.id) {
      throw new Error("Failed to start prediction");
    }
    
    // Poll for prediction results
    const results = await pollPredictionResults(prediction.id, onProgress);
    
    // Process and return the stem URLs
    return processStemResults(results, file.name, separationType);
  } catch (error) {
    console.error("Error in stem separation:", error);
    throw error;
  }
};

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
    // For browser environments, due to CORS, you might need a proxy server
    // Here we're trying with direct request first and if that fails, you might need a server proxy
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
      throw new Error(`Failed to start prediction: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error starting prediction:", error);
    // Fall back to mock data if the real API call fails
    console.log("Falling back to mock data due to API error");
    throw error;
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
        throw new Error(`Failed to check prediction status: ${errorText}`);
      }
      
      const prediction = await response.json();
      status = prediction.status;
      
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
          return prediction.output;
        case "failed":
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

// Create mock stems for development/testing
async function mockSeparation(
  fileName: string,
  separationType: '2stem' | '4stem',
  onProgress: (progress: number) => void
): Promise<Stem[]> {
  // Simulate API delays
  for (let i = 10; i <= 90; i += 10) {
    onProgress(i);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  onProgress(100);
  
  // Get the file name without extension
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  
  // Create mock data based on separation type
  if (separationType === '2stem') {
    return [
      {
        id: '1',
        name: `${baseName} - Vocals`,
        // Use placeholder URLs or test audio files
        url: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3',
        type: 'vocals'
      },
      {
        id: '2',
        name: `${baseName} - Accompaniment`,
        url: 'https://assets.codepen.io/4358584/Moonlight-Reprise.mp3',
        type: 'accompaniment'
      }
    ];
  } else {
    // 4-stem mode
    return [
      {
        id: '1',
        name: `${baseName} - Vocals`,
        url: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3',
        type: 'vocals'
      },
      {
        id: '2',
        name: `${baseName} - Drums`,
        url: 'https://assets.codepen.io/4358584/Moonlight-Reprise.mp3',
        type: 'drums'
      },
      {
        id: '3',
        name: `${baseName} - Bass`,
        url: 'https://assets.codepen.io/4358584/Anitek_-_Komorebi.mp3',
        type: 'bass'
      },
      {
        id: '4',
        name: `${baseName} - Other`,
        url: 'https://assets.codepen.io/4358584/Moonlight-Reprise.mp3',
        type: 'other'
      }
    ];
  }
}
