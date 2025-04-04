
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Stem {
  id: string;
  name: string;
  url: string;
  type: 'vocals' | 'accompaniment' | 'drums' | 'bass' | 'other';
}

interface StemPlayerProps {
  stem: Stem;
}

const StemPlayer: React.FC<StemPlayerProps> = ({ stem }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    // Clean up any existing audio object
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Reset states
    setIsLoading(true);
    setError(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    
    const audio = new Audio();
    audio.volume = volume;
    
    // Setup event handlers
    const onDataLoaded = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      console.log(`Audio loaded: ${stem.name}, duration: ${audio.duration}`);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const onError = () => {
      console.error(`Error loading audio: ${stem.name}`);
      setError("Erro ao carregar áudio");
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Erro de áudio",
        description: `Não foi possível carregar: ${stem.name}`,
      });
    };
    
    // Attach events
    audio.addEventListener('loadeddata', onDataLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    
    audioRef.current = audio;
    
    // Set source after event listeners are attached
    try {
      audio.src = stem.url;
      audio.load();
    } catch (err) {
      console.error("Error initializing audio:", err);
      setError("Erro ao inicializar áudio");
      setIsLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      audio.pause();
      audio.removeEventListener('loadeddata', onDataLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };
  }, [stem.url, stem.name, toast]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || error) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Playing ${stem.name}`);
            setIsPlaying(true);
          })
          .catch(err => {
            console.error("Error playing audio:", err);
            setError("Erro ao reproduzir áudio");
            setIsPlaying(false);
            toast({
              variant: "destructive",
              title: "Erro de reprodução",
              description: "Não foi possível reproduzir o áudio",
            });
          });
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  // Handle progress bar click
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressBarRef.current;
    if (!progressBar || !audioRef.current || error) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  // Type-specific colors
  const getTypeColor = () => {
    switch (stem.type) {
      case 'vocals': return 'rgb(var(--accent) / 0.8)';
      case 'accompaniment': return 'hsl(var(--primary))';
      case 'drums': return 'hsl(320, 100%, 70%)';
      case 'bass': return 'hsl(40, 100%, 60%)';
      case 'other': return 'hsl(200, 100%, 70%)';
      default: return 'hsl(var(--accent))';
    }
  };

  return (
    <div className="glass rounded-xl p-4 animate-scale-in">
      <div className="flex items-center mb-4">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: getTypeColor() }}
        >
          {stem.type === 'vocals' ? (
            <span className="text-xs font-bold text-background">VO</span>
          ) : stem.type === 'accompaniment' ? (
            <span className="text-xs font-bold text-background">AC</span>
          ) : stem.type === 'drums' ? (
            <span className="text-xs font-bold text-background">DR</span>
          ) : stem.type === 'bass' ? (
            <span className="text-xs font-bold text-background">BA</span>
          ) : (
            <span className="text-xs font-bold text-background">OT</span>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-medium truncate" title={stem.name}>
            {stem.name}
          </h3>
          <p className="text-xs text-muted-foreground capitalize">{stem.type}</p>
        </div>
        <a 
          href={stem.url} 
          download={`${stem.name}.mp3`}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title="Download stem"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </a>
      </div>
      
      {error ? (
        <div className="p-3 bg-destructive/10 rounded-lg text-destructive text-sm flex items-center gap-2 my-2">
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div 
            ref={progressBarRef}
            className="w-full h-2 bg-muted rounded-full overflow-hidden cursor-pointer mb-1"
            onClick={handleProgressBarClick}
          >
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${(currentTime / duration) * 100}%`,
                backgroundColor: getTypeColor()
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            
            <button 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                isLoading 
                  ? 'bg-white/5 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-4 h-4 block rounded-full border-2 border-white/30 border-t-white/80 animate-spin"></span>
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
            
            <span className="text-xs text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center mt-3 px-1">
            <Volume2 className="w-3 h-3 text-muted-foreground mr-2" />
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 accent-accent bg-muted rounded-full appearance-none cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StemPlayer;
