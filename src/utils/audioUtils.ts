
// Utility to generate waveform data from an audio file
export const generateWaveformData = async (
  audioFile: File,
  numPoints = 100
): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const fileReader = new FileReader();
    
    fileReader.onload = async (e) => {
      try {
        if (!e.target || !e.target.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const arrayBuffer = e.target.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get the audio data
        const channelData = audioBuffer.getChannelData(0);
        const blockSize = Math.floor(channelData.length / numPoints);
        
        // Reduce the audio data to the number of points
        const dataPoints = [];
        for (let i = 0; i < numPoints; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          
          // Average the values in this block
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[blockStart + j]);
          }
          
          dataPoints.push(sum / blockSize);
        }
        
        // Normalize the data to a range of 0 to 1
        const maxValue = Math.max(...dataPoints);
        const normalizedData = dataPoints.map(point => point / maxValue);
        
        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };
    
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(audioFile);
  });
};

// Utility to calculate the duration of an audio file
export const getAudioDuration = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      reject(new Error('Failed to load audio metadata'));
    };
    audio.src = URL.createObjectURL(file);
  });
};

// Utility to format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
