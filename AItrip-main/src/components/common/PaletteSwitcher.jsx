import React, { useState } from 'react';
import { Palette, Check, Sparkles, X } from 'lucide-react';
import { useTheme, PALETTES } from '../../context/ThemeContext.jsx';

export function PaletteSwitcher() {
  const { currentPalette, setCurrentPalette, isPaletteOpen, setIsPaletteOpen } = useTheme();

  return (
    <>
      {/* Floating Quick Palette Button (Left screen edge, unobtrusive) */}
      <button
        onClick={() => setIsPaletteOpen(true)}
        className="fixed left-4 bottom-6 z-40 px-3.5 py-2.5 rounded-full bg-black/90 border border-white/25 text-white shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-bold font-mono tracking-wider hover:bg-white hover:text-black hover:border-white transition-all duration-300 cursor-pointer group"
        title="Change Website Color Palette"
      >
        <Palette className="w-4 h-4 text-cyan-400 group-hover:text-black transition-colors" />
        <span className="hidden sm:inline">PALETTES</span>
        <div className="flex items-center gap-1">
          {PALETTES[currentPalette].swatch.map((color, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-white/30"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </button>

      {/* Modal / Flyout for Choosing Palette */}
      {isPaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsPaletteOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#10141d] border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                    COLOR PALETTES
                  </h3>
                  <p className="text-xs text-slate-400">
                    Switch the design aesthetic in real-time for your project demo
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPaletteOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {Object.values(PALETTES).map((pal) => {
                const isSelected = currentPalette === pal.id;
                return (
                  <button
                    key={pal.id}
                    onClick={() => {
                      setCurrentPalette(pal.id);
                      setIsPaletteOpen(false);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                      isSelected
                        ? 'border-white bg-white/10 shadow-lg scale-102 ring-2 ring-white/40'
                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        {pal.swatch.map((c, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white uppercase tracking-wide font-sans mb-1">
                      {pal.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {pal.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Active Theme: <strong>{PALETTES[currentPalette].name}</strong>
              </span>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors"
              >
                APPLY
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
