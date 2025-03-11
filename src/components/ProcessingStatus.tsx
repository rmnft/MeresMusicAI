
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  progress: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ isProcessing, progress }) => {
  if (!isProcessing) return null;
  
  return (
    <div className="w-full max-w-xl mx-auto mt-8 animate-fade-in">
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-muted opacity-30"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-l-transparent border-r-transparent border-b-transparent" 
              style={{ 
                borderTopColor: 'hsl(var(--accent))',
                transform: 'rotate(0deg)',
                animation: 'spin-slow 1.5s linear infinite'
              }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-2">Processing your audio file</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            We're separating the stems with AI. This might take a few minutes depending on file size.
          </p>
          
          <div className="w-full progress-indicator mt-2">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="audio-visualizer mt-6">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="bar" 
                style={{ 
                  height: `${Math.random() * 24 + 8}px`,
                  animationName: 'wave',
                  animationDuration: '1.2s',
                  animationDelay: `${i * 0.1}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out' 
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
