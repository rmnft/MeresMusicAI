
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
    
    // Send prediction request to Replicate
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
    const error = await response.text();
    throw new Error(`Failed to start prediction: ${error}`);
  }
  
  return await response.json();
}

// Poll for prediction results until complete
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
      throw new Error(`Failed to check prediction status: ${await response.text()}`);
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
