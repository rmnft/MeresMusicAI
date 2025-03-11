
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileMusic, AlertCircle, Check } from 'lucide-react';
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 100MB"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('audio/')) {
      toast.error("Invalid file type", {
        description: "Please upload an audio file (MP3, WAV, etc.)"
      });
      return;
    }
    
    setSelectedFile(file);
    onFileSelected(file);
    
    toast.success("File uploaded successfully", {
      description: `${file.name} is ready for processing`
    });
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
    },
    maxFiles: 1
  });

  React.useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div 
        {...getRootProps()} 
        className={`relative w-full p-8 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
          dragActive ? 'bg-primary/10 border-primary' : 'glass border-muted'
        } ${selectedFile ? 'glass glass-hover' : ''} hover:border-primary/50 cursor-pointer`}
      >
        <input {...getInputProps()} />
        
        <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          selectedFile ? 'bg-accent/20' : 'bg-primary/20'
        }`}>
          {selectedFile ? (
            <Check className="w-8 h-8 text-accent animate-scale-in" />
          ) : (
            <Upload className={`w-8 h-8 ${dragActive ? 'text-primary animate-pulse-glow' : 'text-muted-foreground'}`} />
          )}
        </div>
        
        {selectedFile ? (
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <FileMusic className="w-4 h-4 text-accent" />
              <p className="font-medium text-foreground truncate max-w-[300px]">{selectedFile.name}</p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to process
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg font-medium">
              {dragActive ? 'Drop your audio file here' : 'Drag & drop your audio file'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload MP3, WAV files (max. 100MB)
            </p>
          </div>
        )}
        
        {!selectedFile && (
          <div className="flex items-center justify-center">
            <button className="mt-2 px-4 py-2 text-sm font-medium glass glass-hover rounded-lg">
              Browse Files
            </button>
          </div>
        )}
        
        {selectedFile && (
          <button 
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
            }}
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
