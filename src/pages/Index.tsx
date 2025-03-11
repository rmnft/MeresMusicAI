
import React, { useState } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import StemOptions from '../components/StemOptions';
import ProcessingStatus from '../components/ProcessingStatus';
import StemPlayer, { Stem } from '../components/StemPlayer';
import Footer from '../components/Footer';
import Particles from '../components/Particles';
import { processStemSeparation } from '../utils/api';
import { ArrowDown, Download, Music } from 'lucide-react';
import { toast } from "sonner";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [separationType, setSeparationType] = useState<'2stem' | '4stem' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stems, setStems] = useState<Stem[]>([]);
  
  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    // Reset other states when a new file is selected
    setSeparationType(null);
    setStems([]);
  };
  
  const handleSeparationTypeSelected = (type: '2stem' | '4stem') => {
    setSeparationType(type);
  };
  
  const handleProcess = async () => {
    if (!file || !separationType) return;
    
    setIsProcessing(true);
    setProgress(0);
    setStems([]);
    
    try {
      const result = await processStemSeparation(
        file,
        separationType,
        (progressValue) => setProgress(progressValue)
      );
      
      setStems(result);
      toast.success("Separation Complete", {
        description: `Your ${separationType === '2stem' ? '2' : '4'} stems are ready!`
      });
    } catch (error) {
      console.error('Error processing stems:', error);
      toast.error("Processing Failed", {
        description: "There was an error processing your file. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDownloadAll = () => {
    // In a real app, this would download a zip file with all stems
    toast.info("Download Started", {
      description: "Downloading all stems as individual files."
    });
    
    // Simulate download all stems
    stems.forEach(stem => {
      const link = document.createElement('a');
      link.href = stem.url;
      link.download = `${stem.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Particles />
      <Header />
      
      <main className="flex-1 container py-10">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10 animate-slide-down">
            <div className="inline-block mb-4">
              <div className="w-14 h-14 rounded-xl bg-red-600/20 flex items-center justify-center mb-4 mx-auto">
                <Music className="w-8 h-8 text-red-500 animate-pulse-glow" />
              </div>
              <h1 className="text-4xl font-bold mb-3 text-glow">
                <span className="text-gradient-red">AI Stem Separation</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Isolate vocals, drums, bass, and other instruments from your music using AI technology
            </p>
          </div>
          
          <FileUpload onFileSelected={handleFileSelected} />
          
          {file && (
            <StemOptions 
              disabled={isProcessing}
              onSelect={handleSeparationTypeSelected}
              selectedOption={separationType}
            />
          )}
          
          {file && separationType && !isProcessing && stems.length === 0 && (
            <div className="w-full max-w-xl mx-auto mt-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <button
                onClick={handleProcess}
                className="w-full py-3 rounded-xl glass glass-hover bg-gradient-to-r from-red-700/80 to-red-500/80 text-white font-medium transition-all duration-300 hover:shadow-lg hover:from-red-700 hover:to-red-500"
              >
                Start Processing
              </button>
            </div>
          )}
          
          <ProcessingStatus isProcessing={isProcessing} progress={progress} />
          
          {stems.length > 0 && (
            <div className="w-full max-w-xl mx-auto mt-12 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium">Your Separated Stems</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-muted rounded-full">
                    {stems.length} stems
                  </span>
                </div>
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 glass glass-hover rounded-lg text-sm hover:text-red-500"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {stems.map(stem => (
                  <StemPlayer key={stem.id} stem={stem} />
                ))}
              </div>
              
              <div className="mt-8 p-4 glass rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-full mt-0.5">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Need more stems?</h3>
                    <p className="text-xs text-muted-foreground">
                      Choose a different separation type to get more or fewer stems, depending on your needs.
                    </p>
                    <button
                      onClick={() => {
                        setSeparationType(null);
                        setStems([]);
                      }}
                      className="mt-3 text-xs font-medium text-red-500 hover:text-red-400 transition-colors"
                    >
                      Change separation type
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
