import React, { createContext, useContext, useState, useEffect } from 'react';

export const PALETTES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Onyx',
    subtitle: 'Pure Black & Electric Cyan',
    bg: '#000000',
    bgSecondary: '#090a0f',
    bgCard: '#11141d',
    border: 'rgba(255, 255, 255, 0.12)',
    accent: '#06b6d4',
    accentHover: '#22d3ee',
    accentGradient: 'from-cyan-500 to-blue-600',
    swatch: ['#000000', '#06b6d4', '#ffffff'],
  },
  googleMaps: {
    id: 'googleMaps',
    name: 'Google Maps Slate',
    subtitle: 'Deep Navy & Google Royal Blue',
    bg: '#0a101d',
    bgSecondary: '#0f172a',
    bgCard: '#182234',
    border: 'rgba(59, 130, 246, 0.25)',
    accent: '#3b82f6',
    accentHover: '#60a5fa',
    accentGradient: 'from-blue-600 via-indigo-600 to-sky-500',
    swatch: ['#0a101d', '#3b82f6', '#ea4335'],
  },
  emerald: {
    id: 'emerald',
    name: 'Nordic Emerald',
    subtitle: 'Deep Obsidian & Aurora Green',
    bg: '#04100c',
    bgSecondary: '#081c15',
    bgCard: '#0f2920',
    border: 'rgba(16, 185, 129, 0.22)',
    accent: '#10b981',
    accentHover: '#34d399',
    accentGradient: 'from-emerald-500 to-teal-600',
    swatch: ['#04100c', '#10b981', '#f59e0b'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Horizon',
    subtitle: 'Cyber Violet & Rose Amber',
    bg: '#0e0817',
    bgSecondary: '#160d24',
    bgCard: '#211438',
    border: 'rgba(244, 63, 94, 0.22)',
    accent: '#f43f5e',
    accentHover: '#fb7185',
    accentGradient: 'from-rose-500 via-purple-600 to-amber-500',
    swatch: ['#0e0817', '#f43f5e', '#fbbf24'],
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [currentPalette, setCurrentPalette] = useState(() => {
    return localStorage.getItem('aitrip_palette') || 'midnight';
  });
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const palette = PALETTES[currentPalette] || PALETTES.midnight;

  useEffect(() => {
    localStorage.setItem('aitrip_palette', currentPalette);
    const root = document.documentElement;

    root.style.setProperty('--bg-main', palette.bg);
    root.style.setProperty('--bg-secondary', palette.bgSecondary);
    root.style.setProperty('--bg-card', palette.bgCard);
    root.style.setProperty('--border-theme', palette.border);
    root.style.setProperty('--accent-theme', palette.accent);
    root.style.setProperty('--accent-hover', palette.accentHover);

    // Update body background
    document.body.style.backgroundColor = palette.bg;
  }, [currentPalette, palette]);

  return (
    <ThemeContext.Provider
      value={{
        currentPalette,
        setCurrentPalette,
        isPaletteOpen,
        setIsPaletteOpen,
        palette,
        palettes: PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
