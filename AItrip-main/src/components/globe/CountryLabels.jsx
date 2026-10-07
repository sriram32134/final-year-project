import React, { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from './geographicUtils.js';

const countryTextureCache = new Map();

function createCountrySpriteTexture(country, isHovered, isSelected) {
  const key = `${country.id}_${isHovered ? 'hover' : 'idle'}_${isSelected ? 'sel' : 'norm'}`;
  if (countryTextureCache.has(key)) return countryTextureCache.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, 440, 100);

  // Rounded pill background on hover / selection
  if (isHovered || isSelected) {
    const x = 12, y = 14, w = 416, h = 72, r = 20;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    }
    ctx.fillStyle = isSelected ? 'rgba(6, 182, 212, 0.95)' : 'rgba(10, 15, 29, 0.85)';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(34, 211, 238, 0.75)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // Country Text with halo shadow for contrast over ocean and continents
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 32px "Plus Jakarta Sans", Montserrat, sans-serif';

  if (!isSelected && !isHovered) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  }

  ctx.fillStyle = isSelected ? '#000000' : (isHovered ? '#38bdf8' : '#ffffff');
  ctx.fillText(`${country.flag ? country.flag + ' ' : ''}${country.name.toUpperCase()}`, 220, 50);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  countryTextureCache.set(key, texture);
  return texture;
}

function SingleCountryLabel({ country, isSelected, levelOpacity, onSelectCountry }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [facingOpacity, setFacingOpacity] = useState(1);

  // Geographically anchored slightly above Earth's surface (radius 2.50 + 0.035)
  const pos = useMemo(() => {
    return latLngToVector3(country.lat, country.lng, 2.535);
  }, [country.lat, country.lng]);

  const texture = useMemo(() => {
    return createCountrySpriteTexture(country, hovered, isSelected);
  }, [country, hovered, isSelected]);

  // CRITICAL GEOGRAPHIC VISIBILITY TEST (Problem 1 & Problem 14):
  // Checks every frame if the country's surface normal is facing toward the camera.
  // Back-side countries (e.g. Australia when camera faces America) have dot <= 0.18 and are hidden!
  useFrame(({ camera }) => {
    if (!groupRef.current) return;

    // 1. World position of the anchor
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);

    // 2. Surface normal on sphere (sphere center is [0, 0, 0])
    const normal = worldPos.clone().normalize();

    // 3. Direction from point to camera
    const camDir = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();

    // 4. Dot product: positive when facing camera, negative when behind Earth
    const dot = normal.dot(camDir);

    // 5. Hide immediately if on back side (dot <= 0.18)
    if (dot <= 0.18) {
      if (groupRef.current.visible) groupRef.current.visible = false;
    } else {
      if (!groupRef.current.visible) groupRef.current.visible = true;
      // Smooth fade ramp near the horizon
      const ramp = THREE.MathUtils.clamp((dot - 0.18) / 0.22, 0, 1);
      if (meshRef.current) {
        meshRef.current.material.opacity = levelOpacity * ramp;
      }
    }
  });

  return (
    <group ref={groupRef} position={pos}>
      {/* 3D Click Hitbox */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (onSelectCountry) onSelectCountry(country);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* PROBLEM 2: Camera-facing Billboard Label (Stays upright, NEVER tilts or rotates upside-down) */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <mesh ref={meshRef}>
          <planeGeometry args={[0.88, 0.2]} />
          <meshBasicMaterial
            map={texture}
            transparent
            opacity={levelOpacity * facingOpacity}
            depthTest={true} // Enable depthTest so physical sphere occludes it!
            depthWrite={false}
          />
        </mesh>
      </Billboard>

      {/* Selected Country Subtle Geographic Anchor Glow */}
      {isSelected && (
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.14, 24]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function CountryLabels({
  countries = [],
  selectedCountry = null,
  currentLevel = 'world',
  zoomFactor = 0,
  onSelectCountry,
}) {
  // Fade out other country labels as user zooms into country level
  const baseOpacity = Math.max(0, 1 - zoomFactor * 2.2);

  if (baseOpacity <= 0 && currentLevel !== 'world') return null;

  return (
    <group>
      {countries.map((country) => {
        const isSelected = selectedCountry?.id === country.id;
        const opacity = isSelected ? 1 : baseOpacity;

        if (opacity <= 0.02) return null;

        return (
          <SingleCountryLabel
            key={country.id}
            country={country}
            isSelected={isSelected}
            levelOpacity={opacity}
            onSelectCountry={onSelectCountry}
          />
        );
      })}
    </group>
  );
}
