
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-6 mt-20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            MusicAI &copy; {new Date().getFullYear()} ・ All rights reserved
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
