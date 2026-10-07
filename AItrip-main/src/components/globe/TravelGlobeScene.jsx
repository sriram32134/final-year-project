import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CountryLabels } from './CountryLabels.jsx';
import { PremiumMarker } from './PremiumMarker.jsx';
import { CityMarkersCluster } from './CityMarkersCluster.jsx';
import { FlightRoutes } from './FlightRoutes.jsx';
import { getRotationForLatLng, latLngToVector3 } from './geographicUtils.js';

// High-performance starfield background (60fps)
function Starfield() {
  const starsRef = useRef();
  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.003;
    }
  });

  const count = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      const radius = 35 + Math.random() * 25;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      pos[i] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  return (
    <points ref={starsRef} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.13} color="#ffffff" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}



export function TravelGlobeScene({
  currentLevel = 'world', // 'world' | 'country' | 'city' | 'destination'
  selectedCountry = null,
  selectedCity = null,
  selectedAttraction = null,
  runtimeMarker = null,
  countries = [],
  cities = [],
  attractions = [],
  flightRoutes = [],
  isAutoRotate = true,
  isFlying = false,
  setIsFlying,
  onSelectCountry,
  onSelectCity,
  onSelectAttraction,
  controlsRef,
  onUserDragStart,
  onUserDragEnd,
}) {
  const earthRef = useRef();
  const [zoomFactor, setZoomFactor] = useState(0);

  const [colorMap, bumpMap] = useTexture([
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-topology.png',
  ]);

  // Determine active geographic focus target
  const activeGeoTarget = useMemo(() => {
    if (selectedAttraction) return selectedAttraction;
    if (selectedCity) return selectedCity;
    if (selectedCountry) return selectedCountry;
    return null;
  }, [selectedAttraction, selectedCity, selectedCountry]);

  // PROBLEM 4: EXPLICIT 4-TIER CAMERA DISTANCES (No excessive or dramatic zoom!)
  // Earth radius = 2.5
  // World: 6.5 (Full globe with surrounding space)
  // Country: 5.1 (Country occupies roughly 45-65% of viewport, surrounding geography visible)
  // City: 4.3 (City area occupies roughly 30-50%, Earth is visibly round and spherical)
  // Destination: 3.85 (Detailed perspective, maintaining full spherical Earth context without clipping)
  const targetCamZ = useMemo(() => {
    if (activeGeoTarget?.cameraDistance) {
      return Math.min(activeGeoTarget.cameraDistance, 4.2);
    }
    switch (currentLevel) {
      case 'destination':
        return 3.25;
      case 'city':
        return 3.5;
      case 'country':
        return 4.6;
      case 'world':
      default:
        return 6.5;
    }
  }, [currentLevel, activeGeoTarget]);

  const autoRotVelocity = useRef(0);

  // Frame Loop: Smooth camera distance transition + Euler shortest-path centering + Gentle auto-rotation blending
  useFrame((state, delta) => {
    if (!earthRef.current) return;

    if (isFlying && activeGeoTarget) {
      const safeTargetZ = typeof targetCamZ === 'number' && !isNaN(targetCamZ) ? targetCamZ : 6.5;

      // Smoothly bring camera to (0, 0, safeTargetZ)
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x || 0, 0, delta * 3.6);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y || 0, 0, delta * 3.6);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z || 6.5, safeTargetZ, delta * 3.6);
      state.camera.lookAt(0, 0, 0);

      if (controlsRef?.current) {
        controlsRef.current.target.set(0, 0, 0);
      }

      // Compute Euler rotation angles to face target directly toward camera (+Z)
      const targetLat = typeof activeGeoTarget.lat === 'number' && !isNaN(activeGeoTarget.lat)
        ? activeGeoTarget.lat
        : Number(activeGeoTarget.latitude) || 0;
      const targetLng = typeof activeGeoTarget.lng === 'number' && !isNaN(activeGeoTarget.lng)
        ? activeGeoTarget.lng
        : Number(activeGeoTarget.longitude) || 0;

      const { targetAngleX, targetAngleY } = getRotationForLatLng(targetLat, targetLng);

      if (!isNaN(targetAngleX) && !isNaN(targetAngleY)) {
        const currentY = earthRef.current.rotation.y || 0;
        const diffY = THREE.MathUtils.euclideanModulo(targetAngleY - currentY + Math.PI, Math.PI * 2) - Math.PI;

        earthRef.current.rotation.y = THREE.MathUtils.lerp(currentY, currentY + diffY, delta * 3.6);
        earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x || 0, targetAngleX, delta * 3.6);

        if (
          Math.abs(diffY) < 0.002 &&
          Math.abs((earthRef.current.rotation.x || 0) - targetAngleX) < 0.002 &&
          Math.abs((state.camera.position.z || 6.5) - safeTargetZ) < 0.02
        ) {
          setIsFlying(false);
        }
      } else {
        setIsFlying(false);
      }
    } else {
      // WHEN NOT FLYING:
      // OrbitControls has 100% full, uninterrupted control over camera orbit and zoom.
      // We do NOT overwrite camera position so trackpad and mouse rotation are completely smooth!

      // Smooth auto-rotation blending at World level
      if (isAutoRotate && currentLevel === 'world') {
        autoRotVelocity.current = THREE.MathUtils.lerp(autoRotVelocity.current, 0.008, delta * 1.8);
        earthRef.current.rotation.y += delta * autoRotVelocity.current;
        earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, 0, delta * 1.5);
      } else {
        autoRotVelocity.current = 0;
      }
    }

    // Dynamic zoom factor for label fading based on actual radial camera distance
    const currentDist = state.camera.position.length();
    const factor = THREE.MathUtils.clamp((6.0 - currentDist) / 2.0, 0, 1);
    setZoomFactor(factor);
  });

  // Filter cities to display:
  // LEVEL 1 (World): NO city pins visible
  // LEVEL 2 (Country): ONLY cities of that country
  // LEVEL 3 (City): Target city + sibling cities of that country
  const visibleCities = useMemo(() => {
    if (currentLevel === 'world') return [];
    if (selectedCountry) {
      return cities.filter((c) => c.countryId === selectedCountry.id);
    }
    if (selectedCity) {
      const match = cities.filter((c) => c.countryId === selectedCity.countryId);
      if (!match.some((c) => c.id === selectedCity.id)) {
        return [selectedCity, ...match];
      }
      return match;
    }
    return [];
  }, [currentLevel, selectedCountry, selectedCity, cities]);

  // Filter attractions to display:
  // LEVEL 3 (City) & LEVEL 4 (Destination): ONLY attractions of the selected city
  const visibleAttractions = useMemo(() => {
    if (currentLevel !== 'city' && currentLevel !== 'destination') return [];
    if (!selectedCity) return [];
    return attractions.filter((a) => a.cityId === selectedCity.id);
  }, [currentLevel, selectedCity, attractions]);

  return (
    <>
      <Starfield />

      {/* 3D Earth Group */}
      <group ref={earthRef} position={[0, 0, 0]}>
        {/* Photorealistic 3D Earth Mesh */}
        <mesh receiveShadow castShadow>
          <sphereGeometry args={[2.5, 48, 48]} />
          <meshStandardMaterial
            map={colorMap}
            bumpMap={bumpMap}
            bumpScale={0.045}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Atmospheric Rim Glow */}
        <mesh scale={[1.02, 1.02, 1.02]} raycast={() => null}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.11}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Flight Routes (Curved Great-Circle Arcs) */}
        <FlightRoutes routes={flightRoutes} isVisible={currentLevel === 'world' || currentLevel === 'country'} />

        {/* LEVEL 1: Geographically Anchored Country Labels with Back-side Culling */}
        <CountryLabels
          countries={countries}
          selectedCountry={selectedCountry}
          currentLevel={currentLevel}
          zoomFactor={zoomFactor}
          onSelectCountry={onSelectCountry}
        />

        {/* LEVEL 2: City Markers with Screen-Space Decluttering, Collision Detection & Dynamic Offsets */}
        <CityMarkersCluster
          cities={visibleCities}
          selectedCity={selectedCity}
          currentLevel={currentLevel}
          onSelectCity={onSelectCity}
        />

        {/* LEVEL 3 & 4: Destination / Attraction Markers (Appear in City View) */}
        {visibleAttractions.map((attraction) => {
          const isSelected = selectedAttraction?.id === attraction.id;
          return (
            <PremiumMarker
              key={attraction.id}
              item={attraction}
              type="attraction"
              isSelected={isSelected}
              isVisible={true}
              opacity={1}
              onSelect={onSelectAttraction}
            />
          );
        })}

        {/* REAL RUNTIME SEARCH MARKER: Placed at real Google coordinates, removed on clear */}
        {runtimeMarker && (
          <PremiumMarker
            key={`runtime-marker-${runtimeMarker.id}-${runtimeMarker.name}`}
            item={runtimeMarker}
            type="city"
            isSelected={true}
            isVisible={true}
            opacity={1}
            onSelect={() => {}}
          />
        )}
      </group>

      {/* CINEMATIC DAMPED ORBIT CONTROLS (Tuned for trackpad & mouse) */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableDamping={true}
        dampingFactor={0.05} // Gentle, luxurious settle
        rotateSpeed={0.45} // Precise, low-sensitivity trackpad & mouse rotation
        zoomSpeed={0.45} // Controlled, progressive trackpad zoom
        minDistance={3.6} // Prevents camera from ever clipping into Earth
        maxDistance={9.5}
        minPolarAngle={Math.PI * 0.12} // Upright restriction
        maxPolarAngle={Math.PI * 0.88}
        onStart={onUserDragStart}
        onEnd={onUserDragEnd}
      />
    </>
  );
}
