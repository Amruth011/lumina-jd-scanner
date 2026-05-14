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

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <LuminaLogo size={120} />
            <p className="text-muted-foreground font-body text-sm max-w-xs leading-relaxed">
              The world's most advanced intelligence engine for career strategists. Optimized for the top 0.1% of global engineering talent.
            </p>
            <div className="flex items-center gap-5">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full border border-border/15 flex items-center justify-center text-muted-foreground/50 hover:text-lumina-teal hover:border-lumina-teal/30 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          {[
            { title: 'Product',   links: ['JD Decoder', 'Gap Analysis', 'Resume Tailor', 'Pricing'] },
            { title: 'Company',   links: ['About', 'Careers', 'Security', 'Privacy'] },
            { title: 'Resources', links: ['Documentation', 'API Reference', 'Community', 'Support'] },
          ].map((col, i) => (
            <div key={i} className="space-y-5">
              <p className="text-foreground text-xs font-display font-bold uppercase tracking-widest">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground/60 hover:text-lumina-teal text-sm font-body transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground/40 text-xs font-body">
            © 2026 Lumina Career Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-muted-foreground/30 text-[10px] font-display font-bold uppercase tracking-widest">Built with Llama-3.3 Intelligence</span>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
            <a href="#" className="text-muted-foreground/40 hover:text-muted-foreground text-xs font-body transition-colors">Privacy</a>
            <a href="#" className="text-muted-foreground/40 hover:text-muted-foreground text-xs font-body transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
