
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingStatusProps {
  isProcessing: boolean;
  progress: number;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ isProcessing, progress }) => {
  if (!isProcessing) return null;
  
  // Helper to determine the current stage message
  const getStageMessage = () => {
    if (progress < 20) return "Simulando o processamento de áudio...";
    if (progress < 40) return "Preparando demonstração...";
    if (progress < 70) return "Carregando áudios de amostra...";
    return "Finalizando a demonstração...";
  };
  
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
          
          <h3 className="text-lg font-medium mb-2">Demonstração em andamento</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {getStageMessage()}
          </p>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-red-500 transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-center space-x-1 mt-6">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-red-500/80 rounded-full"
                style={{ 
                  height: `${Math.random() * 24 + 8}px`,
                  animation: 'wave 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
          
          <p className="text-xs text-amber-400 mt-4 font-medium">
            MODO DEMO - Utilizando áudios pré-definidos
          </p>
          
          {progress === 100 && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 text-xs text-red-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                Finalizando demonstração...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
