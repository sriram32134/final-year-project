import React from 'react';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VisitUsaStackedStories({ onSelectDestination }) {
  const navigate = useNavigate();

  // Curated Signature Editorial Stories (replicating the exact layout of images 1 & 2)
  const stories = [
    {
      id: 'story-1',
      kicker: 'AMERICAN ORIGINALS • COASTAL GOA',
      title: "AMERICA'S ORIGINAL SPIRIT",
      description:
        "America's answer to scotch and bourbon whiskey... that calls to the rebel inside each of us. An untold saga of open roads, coastal breeze, and untamed horizons.",
      buttonText: 'EXPLORE THE STORY',
      destinationName: 'Goa',
      tripId: 'trip-goa-4d',
      slideNumber: '01 / 04',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'story-2',
      kicker: 'ROUTE 66 • ICONIC HIGHWAY',
      title: 'THE MOTHER ROAD TURNS 100',
      description:
        "The USA's most legendary road trip turns 100 this year. Follow it from Chicago to the California coast and discover that some trips are about the roadside diners, neon signs, and wide-open freedom.",
      buttonText: 'VIEW THE ROUTE',
      destinationName: 'New York',
      tripId: 'trip-goa-4d',
      slideNumber: '02 / 04',
      image:
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'story-3',
      kicker: 'ALPINE ODYSSEY • HIMALAYAN PASSES',
      title: 'CRESTING THE SNOW PASS',
      description:
        'Across 13,000 feet of raw high-altitude pine forests, mountain passes, and roaring glacier streams. Where high-clearance 4x4s meet ancient mountain trails.',
      buttonText: 'EXPLORE EXPEDITION',
      destinationName: 'Manali',
      tripId: 'trip-goa-4d',
      slideNumber: '03 / 04',
      image:
        'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80',
    },
    {
      id: 'story-4',
      kicker: 'MEDITERRANEAN CLIFFS • AMALFI COAST',
      title: 'TERRACED LEMON GROVES',
      description:
        'Pastel villas suspended between azure sea and dramatic limestone cliffs. Sip chilled limoncello along winding coastal roads where every hairpin turn unveils cinematic perfection.',
      buttonText: 'DISCOVER AMALFI',
      destinationName: 'Amalfi Coast',
      tripId: 'trip-goa-4d',
      slideNumber: '04 / 04',
      image:
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  const handleAction = (story) => {
    if (onSelectDestination) {
      onSelectDestination(story.destinationName);
    } else {
      navigate(`/trips/${story.tripId}`);
    }
  };

  return (
    <section className="relative w-full py-16 bg-black">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase font-mono mb-2 flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>SIGNATURE STORIES & ROAD TRIPS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-display">
          UNITED STORIES
        </h2>
      </div>

      {/* ========================================================
          STICKY STACKING / "WRAPPER" CARDS CONTAINER
          Each card sticks at top-24 and stacks over the previous one on scroll!
          ======================================================== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {stories.map((story, idx) => (
          <div
            key={story.id}
            className="sticky top-24 w-full"
            style={{
              zIndex: idx + 10,
              paddingTop: `${idx * 8}px`, // subtle layered offset for premium feel
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-[#1e2330] min-h-[480px] lg:min-h-[540px]">
              {/* Left 50%: Editorial Story Block (Matching Screenshot 1 & 2) */}
              <div className="lg:col-span-6 p-8 sm:p-14 flex flex-col justify-between relative usa-editorial-bg">
                {/* Top Kicker */}
                <div className="space-y-4">
                  <div className="text-xs font-bold tracking-[0.22em] text-slate-300 uppercase font-mono">
                    {story.kicker}
                  </div>

                  {/* Massive Bold Condensed Uppercase Headline */}
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none font-display">
                    {story.title}
                  </h3>

                  {/* Editorial Description */}
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans max-w-md pt-2">
                    {story.description}
                  </p>
                </div>

                {/* Bottom Actions & Slide Index */}
                <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                  {/* Button with hover:bg-white hover:text-black */}
                  <button
                    onClick={() => handleAction(story)}
                    className="px-7 py-3 rounded-full border border-white/30 text-white text-xs font-black tracking-widest uppercase transition-all duration-300 hover:bg-white hover:text-black hover:border-white shadow-md flex items-center justify-center gap-2 group w-fit"
                  >
                    <span>{story.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="text-xs font-mono text-slate-400 tracking-widest">
                    {story.slideNumber}
                  </div>
                </div>
              </div>

              {/* Right 50%: Horizontal Full-Bleed Photography */}
              <div className="lg:col-span-6 relative min-h-[340px] lg:min-h-full overflow-hidden bg-black">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Spacer to allow final stacked card to linger before next section */}
      <div className="h-20" />
    </section>
  );
}
