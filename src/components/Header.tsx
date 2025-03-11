
import React from 'react';
import { Music } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full z-10 py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2 animate-slide-down">
          <div className="bg-accent rounded-full p-2 flex items-center justify-center">
            <Music className="w-5 h-5 text-background" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-gradient">StemSeeker</span>
          </h1>
        </div>
        <nav className="flex items-center gap-6 animate-slide-down" style={{ animationDelay: "0.1s" }}>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="relative px-4 py-2 text-sm font-medium text-accent-foreground glass glass-hover rounded-lg">
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
