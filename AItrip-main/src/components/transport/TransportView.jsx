import React from 'react';
import { Plane, Car, AlertTriangle, CheckCircle, Clock, MapPin, Sparkles, RefreshCw } from 'lucide-react';

export function TransportView({ transport, onTriggerDelaySim }) {
  if (!transport) return null;

  const { flight, carRental } = transport;

  return (
    <div className="space-y-8">
      {/* Live Flight Telemetry & Delay Simulation Action Bar */}
      <div className="p-6 rounded-3xl bg-space-900/80 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-cyan-400 uppercase font-mono mb-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AGENTIC FLIGHT RADAR & SATELLITE MONITOR</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            AITrip actively monitors ATC gates and flight telemetry to detect inbound schedule changes before airlines notify passengers.
          </p>
        </div>

        {/* The User-Requested Interactive Delay Simulator Button */}
        <button
          onClick={() => onTriggerDelaySim && onTriggerDelaySim(flight.flightNumber)}
          className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white text-xs font-black tracking-widest uppercase transition-all shadow-lg hover:scale-105 active:scale-95"
          title="Simulate 3-Hour Flight Delay"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>SIMULATE 3H FLIGHT DELAY</span>
        </button>
      </div>

      {/* Flight Boarding Pass Card */}
      <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-space-900 to-space-950 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
                {flight.airline} • {flight.flightNumber}
              </div>
              <div className="text-lg font-black text-white uppercase font-sans">
                NON-STOP FLIGHT TO GOA
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
              flight.status.includes('Delay')
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {flight.status}
            </span>
          </div>
        </div>

        {/* Airport Route Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 items-center text-center md:text-left">
          {/* Origin */}
          <div>
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">BOM</div>
            <div className="text-sm font-bold text-slate-200 mt-1">14:30 IST</div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">{flight.origin}</div>
          </div>

          {/* Flight Path Graphic */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-mono text-cyan-400 mb-2">1h 15m NON-STOP</div>
            <div className="relative w-full max-w-[200px] flex items-center justify-center">
              <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
              <Plane className="w-5 h-5 text-cyan-400 absolute rotate-90" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">AIRBUS A321 NEO</div>
          </div>

          {/* Destination */}
          <div className="md:text-right">
            <div className="text-3xl sm:text-4xl font-black text-white font-mono">GOI</div>
            <div className="text-sm font-bold text-cyan-300 mt-1">{flight.arrivalTime} IST</div>
            <div className="text-xs text-slate-400 font-sans mt-0.5">{flight.destination}</div>
          </div>
        </div>

        {/* Boarding Pass Meta Strip */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-slate-500 text-[10px] uppercase">TERMINAL</div>
            <div className="font-bold text-white text-sm">{flight.terminal}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">GATE</div>
            <div className="font-bold text-white text-sm">{flight.gate}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">SEATS</div>
            <div className="font-bold text-white text-sm">{flight.seat}</div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase">BOOKING PNR</div>
            <div className="font-bold text-cyan-400 text-sm">{flight.pnr}</div>
          </div>
        </div>
      </div>

      {/* Car Rental Reservation Card */}
      {carRental && (
        <div className="rounded-3xl overflow-hidden border border-white/10 bg-space-900/60 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono text-amber-400 font-bold uppercase">
                  {carRental.provider}
                </div>
                <div className="text-lg font-black text-white uppercase font-sans">
                  {carRental.vehicle}
                </div>
              </div>
            </div>

            <div className="font-mono text-right">
              <div className="text-xs text-slate-400 uppercase">RATE</div>
              <div className="text-base font-bold text-emerald-400">
                ₹{carRental.ratePerDay} / day
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-slate-400 text-[10px] uppercase font-mono mb-1">
                PICKUP LOCATION
              </div>
              <div className="text-slate-200 font-semibold">{carRental.pickupLocation}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
              <div className="text-slate-400 text-[10px] uppercase font-mono mb-1">
                DROPOFF LOCATION
              </div>
              <div className="text-slate-200 font-semibold">{carRental.dropoffLocation}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
