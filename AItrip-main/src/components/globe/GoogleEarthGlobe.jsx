import React, { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  COUNTRIES,
  CITIES,
  ATTRACTIONS,
  FEATURED_FLIGHT_ROUTES
} from './globeData.js';
import { TravelGlobeScene } from './TravelGlobeScene.jsx';
import { GlobeBreadcrumb } from './GlobeBreadcrumb.jsx';
import { GlobeControls } from './GlobeControls.jsx';
import { LocationPanel } from './LocationPanel.jsx';
import { GoogleMapsView } from './GoogleMapsView.jsx';

function GlobeFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[2.5, 24, 24]} />
      <meshStandardMaterial color="#0f172a" wireframe />
    </mesh>
  );
}

export function GoogleEarthGlobe({ onSelectDestination }) {
  const controlsRef = useRef();
  const idleTimerRef = useRef(null);

  // Geographic Interaction Level: 'world' | 'country' | 'city' | 'destination'
  const [currentLevel, setCurrentLevel] = useState('world');
  const [mapEngine, setMapEngine] = useState('3d'); // '3d' | '2d'
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isFlying, setIsFlying] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [runtimeMarker, setRuntimeMarker] = useState(null);

  // Clear Search Lifecycle: Completely removes all search-specific UI, marker, card, and resets world view
  const handleClearSearch = useCallback(() => {
    setSelectedLocation(null);
    setSelectedCity(null);
    setSelectedCountry(null);
    setSelectedAttraction(null);
    setRuntimeMarker(null);
    setIsPanelOpen(false);
    setCurrentLevel('world');
    setIsFlying(true);
    setIsAutoRotate(true);
  }, []);

  // Level 1 -> Level 2: Transition to Country View
  const handleSelectCountry = useCallback((country) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    setSelectedAttraction(null);
    setSelectedLocation(country);
    setRuntimeMarker(null);
    setCurrentLevel('country');
    setIsFlying(true);
    setIsAutoRotate(false);
    setIsPanelOpen(true);
  }, []);

  // Level 2 -> Level 3: Transition to City / Resolved Destination View
  const handleSelectCity = useCallback((city) => {
    if (!city) return;
    const safeCity = {
      ...city,
      lat: typeof city.lat === 'number' && !isNaN(city.lat) ? city.lat : (Number(city.latitude) || 0),
      lng: typeof city.lng === 'number' && !isNaN(city.lng) ? city.lng : (Number(city.longitude) || 0),
      cameraDistance: city.cameraDistance || (
        city.type === 'ocean' ? 6.5 :
        city.type === 'desert' || city.type === 'region' ? 5.2 :
        city.type === 'landmark' ? 3.25 :
        city.type === 'mountain' ? 3.8 : 3.5
      ),
    };

    // If country is not selected, resolve from city.countryId or country name
    const parentCountry =
      COUNTRIES.find((c) => c.id === safeCity.countryId || c.name.toLowerCase() === (safeCity.country || '').toLowerCase()) ||
      (safeCity.country ? { id: safeCity.countryId || 'global', name: safeCity.country, flag: '🌍' } : null) ||
      selectedCountry;

    setSelectedCountry(parentCountry);
    setSelectedCity(safeCity);
    setSelectedLocation(safeCity);
    setSelectedAttraction(null);
    setCurrentLevel(safeCity.type === 'landmark' ? 'destination' : 'city');
    setIsFlying(true);
    setIsAutoRotate(false);
    setIsPanelOpen(true);
  }, [selectedCountry]);

  // Universal Single-Source Location Selection (Curated or Google Places runtime)
  const handleSelectLocation = useCallback((loc) => {
    if (!loc) return;

    // Reset previous runtime marker & selection immediately
    setSelectedLocation(loc);

    if (loc.itemType === 'country' || loc.type === 'country') {
      const countryObj = COUNTRIES.find((c) => c.id === loc.id || c.name.toLowerCase() === loc.name.toLowerCase()) || loc;
      setRuntimeMarker(null);
      handleSelectCountry(countryObj);
    } else {
      const targetLat = Number(loc.latitude ?? loc.lat);
      const targetLng = Number(loc.longitude ?? loc.lng);
      const isCurated = Boolean(loc.curated);

      // Create runtime marker for any runtime search result
      setRuntimeMarker({
        id: loc.id || `marker-${loc.name}`,
        name: loc.name,
        lat: targetLat,
        lng: targetLng,
        latitude: targetLat,
        longitude: targetLng,
        type: loc.type || 'city',
        category: loc.type === 'landmark' ? 'Landmark' : 'Destination',
      });

      const curatedCity = CITIES.find((c) => c.id === loc.id || c.name.toLowerCase() === loc.name.toLowerCase());
      const targetCity = curatedCity || {
        ...loc,
        lat: targetLat,
        lng: targetLng,
        country: loc.country || 'Global',
        countryId: loc.countryId || (loc.country || 'world').toLowerCase().replace(/[^a-z0-9]/g, '_'),
        isGlobalResolved: !isCurated,
        cameraDistance: loc.cameraDistance || (
          loc.type === 'ocean' ? 6.5 :
          loc.type === 'desert' || loc.type === 'region' ? 5.2 :
          loc.type === 'landmark' ? 3.25 :
          loc.type === 'mountain' ? 3.8 : 3.5
        ),
      };
      handleSelectCity(targetCity);
    }
  }, [handleSelectCountry, handleSelectCity]);

  // Level 3 -> Destination / Specific Attraction
  const handleSelectAttraction = useCallback((attraction) => {
    setSelectedAttraction(attraction);
    setCurrentLevel('destination');
    setIsFlying(true);
    setIsAutoRotate(false);
    setIsPanelOpen(true);
  }, []);

  // Breadcrumb / Reset Navigation: Back to World View
  const handleNavigateWorld = useCallback(() => {
    setCurrentLevel('world');
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedAttraction(null);
    setIsFlying(true);
    setIsAutoRotate(true);
    setIsPanelOpen(false);
  }, []);

  // Breadcrumb Navigation: Back to Country View
  const handleNavigateCountry = useCallback((country) => {
    setSelectedCountry(country);
    setSelectedCity(null);
    setSelectedAttraction(null);
    setCurrentLevel('country');
    setIsFlying(true);
    setIsAutoRotate(false);
    setIsPanelOpen(true);
  }, []);

  // Breadcrumb Navigation: Back to City View
  const handleNavigateCity = useCallback((city) => {
    setSelectedCity(city);
    setSelectedAttraction(null);
    setCurrentLevel('city');
    setIsFlying(true);
    setIsAutoRotate(false);
    setIsPanelOpen(true);
  }, []);

  // Roll Dice: randomly pick a city and smoothly zoom into it
  const handleRollDice = useCallback(() => {
    const availableCities = CITIES.filter((c) => c.id !== selectedCity?.id);
    const randomPick = availableCities[Math.floor(Math.random() * availableCities.length)] || CITIES[0];
    handleSelectCity(randomPick);
  }, [selectedCity, handleSelectCity]);

  // Zoom Button Controls (+ / -)
  const handleZoom = useCallback((direction) => {
    if (!controlsRef.current) return;
    const factor = direction === 'in' ? 0.78 : 1.3;
    controlsRef.current.object.position.multiplyScalar(factor);
  }, []);

  // Handle User Drag: pause rotation and cancel active camera fly animation immediately
  const handleUserDragStart = useCallback(() => {
    setIsAutoRotate(false);
    setIsFlying(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  const handleUserDragEnd = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      // Resume slow rotation only if in World view and no panel is open
      if (currentLevel === 'world' && !isPanelOpen) {
        setIsAutoRotate(true);
      }
    }, 3000);
  }, [currentLevel, isPanelOpen]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Derived filtered data
  const countryCities = selectedCountry
    ? CITIES.filter((c) => c.countryId === selectedCountry.id)
    : [];

  const cityAttractions = selectedCity
    ? ATTRACTIONS.filter((a) => a.cityId === selectedCity.id)
    : [];

  return (
    <div className="w-full flex flex-col bg-black relative select-none font-sans">
      {/* 1. Top Controls Bar: Search, 🎲 Roll Dice, 🌍 Reset, Orbit Toggle, Engine Toggle */}
      <GlobeControls
        countries={COUNTRIES}
        cities={CITIES}
        isAutoRotate={isAutoRotate}
        mapEngine={mapEngine}
        onToggleAutoRotate={() => setIsAutoRotate((prev) => !prev)}
        onToggleMapEngine={() => setMapEngine((prev) => (prev === '3d' ? '2d' : '3d'))}
        onResetWorld={handleNavigateWorld}
        onRollDice={handleRollDice}
        onZoom={handleZoom}
        onSelectCountry={handleSelectCountry}
        onSelectCity={handleSelectCity}
        onSelectLocation={handleSelectLocation}
        onClosePanel={handleClearSearch}
        onClearSearch={handleClearSearch}
      />

      {/* 2. Geographic Interactive Stage */}
      <div className="relative w-full h-[620px] sm:h-[700px] lg:h-[780px] bg-black overflow-hidden">
        {/* Unobtrusive Breadcrumb Navigation: World -> Country -> City -> Destination */}
        <GlobeBreadcrumb
          currentLevel={currentLevel}
          selectedCountry={selectedCountry}
          selectedCity={selectedCity}
          selectedAttraction={selectedAttraction}
          onNavigateWorld={handleNavigateWorld}
          onNavigateCountry={handleNavigateCountry}
          onNavigateCity={handleNavigateCity}
        />

        {mapEngine === '2d' ? (
          <GoogleMapsView
            selectedLocation={selectedLocation || selectedCity || selectedCountry}
            curatedCities={CITIES}
            onSelectCity={handleSelectCity}
            currentLevel={currentLevel}
          />
        ) : (
          /* 3D WebGL Travel Globe Canvas */
          <Canvas
            camera={{ position: [0, 0, 6.6], fov: 42 }}
            className="cursor-grab active:cursor-grabbing w-full h-full bg-black"
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={1.3} />
            <directionalLight position={[6, 4, 5]} intensity={2.6} />
            <directionalLight position={[-6, -3, -4]} intensity={0.5} color="#06b6d4" />

            <Suspense fallback={<GlobeFallback />}>
              <TravelGlobeScene
                currentLevel={currentLevel}
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                selectedAttraction={selectedAttraction}
                runtimeMarker={runtimeMarker}
                countries={COUNTRIES}
                cities={CITIES}
                attractions={ATTRACTIONS}
                flightRoutes={FEATURED_FLIGHT_ROUTES}
                isAutoRotate={isAutoRotate}
                isFlying={isFlying}
                setIsFlying={setIsFlying}
                onSelectCountry={handleSelectCountry}
                onSelectCity={handleSelectCity}
                onSelectAttraction={handleSelectAttraction}
                controlsRef={controlsRef}
                onUserDragStart={handleUserDragStart}
                onUserDragEnd={handleUserDragEnd}
              />
            </Suspense>
          </Canvas>
        )}

        {/* 3. Floating Location Information Panel (Country / City / Destination) */}
        {isPanelOpen && (
          <LocationPanel
            currentLevel={currentLevel}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            selectedAttraction={selectedAttraction}
            countryCities={countryCities}
            cityAttractions={cityAttractions}
            onSelectCity={handleSelectCity}
            onSelectAttraction={handleSelectAttraction}
            onClose={() => setIsPanelOpen(false)}
            onOpenFullDetail={onSelectDestination}
          />
        )}

        {/* Re-open Panel Tab if user closed it during inspection */}
        {!isPanelOpen && currentLevel !== 'world' && (selectedCountry || selectedCity) && (
          <button
            onClick={() => setIsPanelOpen(true)}
            className="absolute top-16 left-4 sm:left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/90 border border-white/25 text-white shadow-2xl backdrop-blur-md hover:bg-white hover:text-black transition-all cursor-pointer font-bold text-xs"
          >
            <span>SHOW {selectedCity?.name || selectedCountry?.name} PANEL</span>
          </button>
        )}
      </div>
    </div>
  );
}
