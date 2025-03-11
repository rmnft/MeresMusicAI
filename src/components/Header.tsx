
import React from 'react';
import { Music } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full z-10 py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2 animate-slide-down">
          <div className="bg-red-600 rounded-full p-2 flex items-center justify-center">
            <Music className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-gradient-red">MusicAI</span>
          </h1>
        </div>
        <nav className="flex items-center gap-6 animate-slide-down" style={{ animationDelay: "0.1s" }}>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors">
            How It Works
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors">
            About
          </a>
          <a href="#" className="relative px-4 py-2 text-sm font-medium text-black bg-red-600 hover:bg-red-700 transition-colors rounded-lg">
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
