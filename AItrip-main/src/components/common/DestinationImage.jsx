import React, { useState } from 'react';
import { MapPin, ImageOff } from 'lucide-react';

export function DestinationImage({
  src,
  alt = 'Destination',
  fallbackSrc = null,
  objectPosition = 'center',
  className = '',
  aspectRatio = 'aspect-[16/10]',
  loading = 'lazy',
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'

  const hasImage = Boolean(src || fallbackSrc);

  if (!hasImage || status === 'error') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1128] to-slate-900 border-b border-white/10 flex flex-col items-center justify-center p-6 text-center ${aspectRatio} ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 mb-2">
          <MapPin className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          {alt}
        </div>
        <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center gap-1.5">
          <ImageOff className="w-3 h-3" />
          <span>No location photo available</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-950 ${aspectRatio} ${className}`}>
      {/* Loading shimmer skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse z-10 pointer-events-none" />
      )}

      {/* Actual Image */}
      <img
        src={src || fallbackSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setStatus('loaded')}
        onError={() => {
          setStatus('error');
        }}
        style={{ objectPosition }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Subtle bottom gradient vignette for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none z-10" />
    </div>
  );
}
