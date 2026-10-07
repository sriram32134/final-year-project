import React, { useState, useEffect } from 'react';
import { tripService, executionService } from '../services/index.js';
import {
  Download,
  Calendar,
  Printer,
  FileText,
  Share2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Plane,
  Compass,
} from 'lucide-react';

export function ExecutionCenterPage() {
  const [trip, setTrip] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    tripService.getTripById('trip-goa-4d').then(setTrip);
  }, []);

  if (!trip) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/trips/${trip.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-space-950 font-sans py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-bold tracking-[0.25em] uppercase font-mono mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>SEAMLESS DISPATCH & TRAVEL EXPORT HUB</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-sans mb-3">
            EXECUTION CENTER
          </h1>

          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Synchronize your verified multi-agent trip into calendar software, export print-ready PDFs, or dispatch live tracking links to fellow travelers.
          </p>
        </div>

        {/* 4 Action Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {/* Card 1: Add to Calendar .ICS */}
          <div className="p-8 rounded-3xl bg-space-900/60 border border-white/10 flex flex-col justify-between space-y-6 hover:border-cyan-500/30 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase font-sans">
                GOOGLE & APPLE CALENDAR (.ICS)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Generates a clean RFC 5545 iCalendar payload with exact timings, geo-coordinates, and transit times for every scheduled node.
              </p>
            </div>

            <button
              onClick={() => executionService.downloadICS(trip)}
              className="w-full py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-black tracking-widest uppercase transition-all shadow-glow-cyan flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD CALENDAR FILE</span>
            </button>
          </div>

          {/* Card 2: Print / Download Itinerary PDF */}
          <div className="p-8 rounded-3xl bg-space-900/60 border border-white/10 flex flex-col justify-between space-y-6 hover:border-cyan-500/30 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase font-sans">
                PRINT-READY ITINERARY (PDF)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Format your 4-day Goa journey into an elegant, high-contrast offline booklet including emergency contacts and packing list.
              </p>
            </div>

            <button
              onClick={() => executionService.printItinerary(trip)}
              className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / SAVE AS PDF</span>
            </button>
          </div>

          {/* Card 3: Shareable Dynamic Web Link */}
          <div className="p-8 rounded-3xl bg-space-900/60 border border-white/10 flex flex-col justify-between space-y-6 hover:border-cyan-500/30 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase font-sans">
                SHARE LIVE TRACKING LINK
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Share a live synchronized itinerary URL with travel companions so they can monitor updates and delay reconciliations in real time.
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">LINK COPIED TO CLIPBOARD!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>COPY TRIP LINK</span>
                </>
              )}
            </button>
          </div>

          {/* Card 4: Boarding Pass & Digital Key Quick Access */}
          <div className="p-8 rounded-3xl bg-space-900/60 border border-white/10 flex flex-col justify-between space-y-6 hover:border-cyan-500/30 transition-colors">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white uppercase font-sans">
                BOARDING PASS & KEYS
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Direct access to IndiGo flight 6E 5234 boarding pass and Casa Severina mobile express check-in key.
              </p>
            </div>

            <a
              href="#flight"
              onClick={(e) => {
                e.preventDefault();
                alert('Boarding Pass PNR: WD49LX (Gate 41B - Seats 12A, 12B)');
              }}
              className="w-full py-3.5 rounded-full bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-200 text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>VIEW DIGITAL PASS (WD49LX)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
