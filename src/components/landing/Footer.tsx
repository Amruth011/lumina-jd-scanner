"use client";

import React from 'react';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LuminaLogo } from '../LuminaLogo';

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/10 py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand Col spanning the full width to center it or just keeping it clean */}
          <div className="lg:col-span-5 flex flex-col items-center text-center space-y-6">
            <LuminaLogo size={120} className="mx-auto" />
            <p className="text-muted-foreground font-body text-sm max-w-md leading-relaxed mx-auto">
              The world's most advanced intelligence engine for career strategists. Optimized for the top 0.1% of global engineering talent.
            </p>
            <div className="flex justify-center items-center gap-5">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-border/15 flex items-center justify-center text-muted-foreground/50 hover:text-lumina-teal hover:border-lumina-teal/30 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground/40 text-xs font-body">
            © 2026 Lumina Career Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground/30 text-[10px] font-display font-bold uppercase tracking-widest">Built with Llama-3.3 Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
