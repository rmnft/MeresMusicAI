
import React, { useState } from 'react';
import { Check, Wand2 } from 'lucide-react';

interface StemOptionsProps {
  disabled: boolean;
  onSelect: (option: '2stem' | '4stem') => void;
  selectedOption: '2stem' | '4stem' | null;
}

const StemOptions: React.FC<StemOptionsProps> = ({ disabled, onSelect, selectedOption }) => {
  return (
    <div className="w-full max-w-xl mx-auto mt-8 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-medium">Separation Options</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div 
            className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer 
              ${selectedOption === '2stem' 
                ? 'border-primary bg-primary/10' 
                : 'border-muted bg-card/50 hover:bg-card/80'} 
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onSelect('2stem')}
          >
            {selectedOption === '2stem' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <h3 className="text-base font-medium mb-2">2-Stem Separation</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="px-2 py-1 text-xs font-medium bg-muted rounded-full">Vocals</div>
              <div className="px-2 py-1 text-xs font-medium bg-muted rounded-full">Accompaniment</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Ideal for vocal isolation or removing vocals for karaoke
            </p>
          </div>
          
          <div 
            className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer 
              ${selectedOption === '4stem' 
                ? 'border-primary bg-primary/10' 
                : 'border-muted bg-card/50 hover:bg-card/80'} 
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onSelect('4stem')}
          >
            {selectedOption === '4stem' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <h3 className="text-base font-medium mb-2">4-Stem Separation</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="px-2 py-1 text-xs font-medium bg-muted rounded-full">Vocals</div>
              <div className="px-2 py-1 text-xs font-medium bg-muted rounded-full">Drums</div>
              <div className="px-2 py-1 text-xs font-medium bg-muted rounded-full">Bass</div>
              <div className="px-2 py-1 text-xs font-medium bg-muted rounded-full">Other</div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Complete separation for maximum flexibility and control
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StemOptions;
