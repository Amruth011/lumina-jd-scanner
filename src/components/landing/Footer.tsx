"use client";

import React from 'react';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-lumina-navy py-20 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-serif font-bold text-white">Lumina</span>
              <div className="w-2 h-2 rounded-full bg-lumina-teal shadow-[0_0_8px_#10B981]" />
            </div>
            <p className="text-white/40 font-body text-sm max-w-xs leading-relaxed">
              The world's most advanced intelligence engine for career strategists. Optimized for the top 0.1% of global engineering talent.
            </p>
            <div className="flex items-center gap-6">
              {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="text-white/20 hover:text-lumina-teal transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          {[
            {
              title: 'Product',
              links: ['JD Decoder', 'Gap Analysis', 'Resume Tailor', 'Pricing']
            },
            {
              title: 'Company',
              links: ['About', 'Careers', 'Security', 'Privacy']
            },
            {
              title: 'Resources',
              links: ['Documentation', 'API Reference', 'Community', 'Support']
            }
          ].map((col, i) => (
            <div key={i} className="space-y-6">
              <p className="text-white text-xs font-display font-bold uppercase tracking-widest">{col.title}</p>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/40 hover:text-lumina-teal text-sm font-body transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/20 text-xs font-body">
            © 2026 Lumina Career Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-white/20 text-[10px] font-display font-bold uppercase tracking-widest">Built with Llama-3.3 Intelligence</span>
             <div className="h-1 w-1 rounded-full bg-white/20" />
             <a href="#" className="text-white/20 hover:text-white/40 text-xs font-body transition-colors">Privacy</a>
             <a href="#" className="text-white/20 hover:text-white/40 text-xs font-body transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
