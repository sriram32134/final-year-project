import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from './geographicUtils.js';

// Texture cache for crisp billboard label textures
const markerLabelCache = new Map();

function createMarkerLabelTexture(name, isSelected, isAttraction, isDense) {
  const key = `${name}_${isSelected ? 'sel' : 'idle'}_${isAttraction ? 'att' : (isDense ? 'dense' : 'norm')}`;
  if (markerLabelCache.has(key)) return markerLabelCache.get(key);

  const canvas = document.createElement('canvas');
  // Dynamic compact sizing for dense secondary labels
  const w = isAttraction ? 260 : (isSelected ? 300 : (isDense ? 220 : 260));
  const h = isAttraction ? 56 : (isSelected ? 64 : (isDense ? 50 : 56));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.clearRect(0, 0, w, h);

  const pad = 5;
  const rx = pad, ry = pad, rw = w - pad * 2, rh = h - pad * 2, r = 13;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rx, ry, rw, rh, r);
  } else {
    ctx.moveTo(rx + r, ry);
    ctx.arcTo(rx + rw, ry, rx + rw, ry + rh, r);
    ctx.arcTo(rx + rw, ry + rh, rx, ry + rh, r);
    ctx.arcTo(rx, ry + rh, rx, ry, r);
    ctx.arcTo(rx, ry, rx + r, ry, r);
    ctx.closePath();
  }

  // Background styling
  if (isSelected) {
    ctx.fillStyle = 'rgba(6, 182, 212, 0.98)'; // Vibrant Cyan for selected
    ctx.shadowColor = 'rgba(6, 182, 212, 0.9)';
    ctx.shadowBlur = 14;
  } else if (isDense) {
    ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 6;
  } else {
    ctx.fillStyle = isAttraction ? 'rgba(15, 23, 42, 0.92)' : 'rgba(10, 15, 29, 0.92)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;
  }
  ctx.fill();

  ctx.strokeStyle = isSelected
    ? '#ffffff'
    : (isAttraction ? 'rgba(56, 189, 248, 0.65)' : (isDense ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.38)'));
  ctx.lineWidth = isSelected ? 2.0 : 1.5;
  ctx.stroke();

  // Label text with crisp typography
  ctx.shadowBlur = 0;
  ctx.fillStyle = isSelected ? '#000000' : '#ffffff';
  const fontSize = isSelected ? '20px' : (isDense ? '15px' : (isAttraction ? '16px' : '17px'));
  ctx.font = `bold ${fontSize} "Plus Jakarta Sans", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  markerLabelCache.set(key, texture);
  return texture;
}

export function PremiumMarker({
  item,
  type = 'city', // 'city' | 'attraction'
  isSelected = false,
  isVisible = true,
  opacity = 1,
  isDense = false,
  onSelect,
  registerMarker = null,
}) {
  const groupRef = useRef();
  const billboardRef = useRef();
  const labelMeshRef = useRef();
  const pulseRef = useRef();
  const dotRef = useRef();
  const leaderLineRef = useRef();

  const [hovered, setHovered] = useState(false);
  const [isFacingCamera, setIsFacingCamera] = useState(true);

  // Dynamic declutter state mutated in useFrame without causing React re-renders
  const declutterRef = useRef({
    targetX: 0,
    targetY: 0.08,
    currentX: 0,
    currentY: 0.08,
    hasLeaderLine: false,
    isDense: isDense,
    isPrimary: true,
  });

  // Register with parent CityMarkersCluster if provided
  useEffect(() => {
    if (!registerMarker || !item?.id) return;

    const unregister = registerMarker(item.id, {
      getWorldPosition: (target) => {
        if (groupRef.current) {
          groupRef.current.getWorldPosition(target);
        }
      },
      setDeclutterState: (state) => {
        declutterRef.current.targetX = state.targetX;
        declutterRef.current.targetY = state.targetY;
        declutterRef.current.hasLeaderLine = state.hasLeaderLine;
        declutterRef.current.isDense = state.isDense;
        declutterRef.current.isPrimary = state.isPrimary;
      },
    });

    return unregister;
  }, [registerMarker, item?.id]);

  // Geographically anchored altitude on the globe
  const pos = useMemo(() => {
    const altitude = type === 'attraction' ? 2.518 : 2.515;
    return latLngToVector3(item.lat, item.lng, altitude);
  }, [item.lat, item.lng, type]);

  const labelTexture = useMemo(
    () => createMarkerLabelTexture(item.name, isSelected, type === 'attraction', isDense),
    [item.name, isSelected, type, isDense]
  );

  // Geometric dimensions for clean travel marker:
  // ●
  // │
  // ─────
  const isAttraction = type === 'attraction';
  const accentColor = isSelected ? '#06b6d4' : (isAttraction ? '#38bdf8' : '#22d3ee');
  const dotSize = isSelected ? 0.022 : (isAttraction ? 0.012 : 0.015);
  const stemHeight = isSelected ? 0.046 : (isAttraction ? 0.030 : 0.038);

  const planeWidth = isAttraction ? 0.28 : (isSelected ? 0.35 : (isDense ? 0.26 : 0.30));
  const planeHeight = isAttraction ? 0.060 : (isSelected ? 0.074 : (isDense ? 0.058 : 0.065));

  // Surface Normal Horizon Check + Screen Boundary Safe Fade + Dynamic Distance Scaling + Declutter Lerp
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // 1. Dynamic Geographic Horizon Occlusion Check
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);

    const normal = worldPos.clone().normalize();
    const camDir = new THREE.Vector3().subVectors(state.camera.position, worldPos).normalize();
    const dot = normal.dot(camDir);

    // If marker is on the back side of the Earth, hide it completely!
    if (dot <= 0.18) {
      if (groupRef.current.visible) groupRef.current.visible = false;
      if (isFacingCamera) setIsFacingCamera(false);
      return;
    }

    // 2. Viewport Screen Boundary Safe Check (NDC test)
    // Avoids labels getting cut off at screen edges or overflowing
    const screenPos = worldPos.clone().project(state.camera);
    const edgeDistX = Math.max(0, 1.0 - Math.abs(screenPos.x));
    const edgeDistY = Math.max(0, 1.0 - Math.abs(screenPos.y));
    const edgeFade = THREE.MathUtils.clamp(Math.min(edgeDistX, edgeDistY) / 0.14, 0, 1);

    if (edgeFade <= 0.02) {
      if (groupRef.current.visible) groupRef.current.visible = false;
      return;
    }

    if (!groupRef.current.visible) groupRef.current.visible = true;
    if (!isFacingCamera) setIsFacingCamera(true);

    // 3. Dynamic Distance Scaling to prevent labels from blowing up when zoomed in
    const camDist = state.camera.position.distanceTo(worldPos);
    const distScale = THREE.MathUtils.clamp(camDist / 6.0, 0.60, 0.90);
    const priorityMultiplier = isSelected ? 1.12 : (isDense ? 0.78 : (type === 'attraction' ? 0.80 : 0.85));
    const targetScale = distScale * priorityMultiplier;

    // 4. Smooth Declutter Lerp for Billboard Position
    const d = declutterRef.current;
    const lerpSpeed = Math.min(1.0, delta * 9);
    d.currentX = THREE.MathUtils.lerp(d.currentX, d.targetX, lerpSpeed);
    d.currentY = THREE.MathUtils.lerp(d.currentY, d.targetY, lerpSpeed);

    if (billboardRef.current) {
      billboardRef.current.position.set(d.currentX, stemHeight + d.currentY, 0);
      billboardRef.current.scale.set(targetScale, targetScale, targetScale);
    }

    // 5. Leader Line Update (rendered inside the camera-facing Billboard)
    if (leaderLineRef.current) {
      const isSignificantlyOffset = Math.hypot(d.currentX, d.currentY - 0.08) > 0.035;
      if (d.hasLeaderLine && isSignificantlyOffset) {
        leaderLineRef.current.visible = true;
        const posAttr = leaderLineRef.current.geometry.attributes.position;
        // From marker dot [0, 0, 0] to offset label boundary
        posAttr.setXYZ(0, 0, 0.005, 0);
        const targetYClamped = d.currentY > 0 ? (d.currentY - planeHeight * 0.45) : (d.currentY + planeHeight * 0.45);
        posAttr.setXYZ(1, d.currentX * 0.85, targetYClamped, 0);
        posAttr.needsUpdate = true;
      } else {
        leaderLineRef.current.visible = false;
      }
    }

    // Smooth combined opacity
    const horizonRamp = THREE.MathUtils.clamp((dot - 0.18) / 0.22, 0, 1);
    const combinedOpacity = opacity * horizonRamp * edgeFade;

    if (labelMeshRef.current) {
      labelMeshRef.current.material.opacity = combinedOpacity;
    }

    // 6. Gentle Breathing Pulse Ring Animation for Ground Indicator
    const t = state.clock.elapsedTime;
    if (pulseRef.current) {
      const scale = 1 + (Math.sin(t * 3.2) + 1) * 0.25;
      pulseRef.current.scale.set(scale, scale, scale);
      pulseRef.current.material.opacity = Math.max(0, (isSelected ? 0.7 : 0.4) - (scale - 1) * 0.5) * horizonRamp * edgeFade;
    }

    if (dotRef.current && isSelected) {
      dotRef.current.position.y = stemHeight + Math.sin(t * 4) * 0.005;
    }
  });

  if (!isVisible) return null;

  const handlePointerSelect = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(item);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={groupRef} position={pos}>
      {/* 
        3D Click & Hover Hitbox
        Decoupled from visible geometry: 2-3x visual marker size for effortless touch/mouse selection
      */}
      <mesh
        position={[0, stemHeight * 0.6, 0]}
        onClick={handlePointerSelect}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Subtle Ground / Ripple Indicator: ───── */}
      <mesh ref={pulseRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isSelected ? 0.008 : 0.006, isSelected ? 0.024 : 0.016, 24]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={isSelected ? 0.6 : 0.35}
          side={THREE.DoubleSide}
          depthTest={true}
          depthWrite={false}
        />
      </mesh>

      {/* Small Vertical Stem: │ */}
      <mesh position={[0, stemHeight / 2, 0]}>
        <cylinderGeometry args={[0.0016, 0.0016, stemHeight, 8]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : accentColor}
          transparent
          opacity={opacity * 0.85}
          depthTest={true}
        />
      </mesh>

      {/* Small Glowing Location Dot: ● */}
      <mesh ref={dotRef} position={[0, stemHeight, 0]}>
        <sphereGeometry args={[hovered ? dotSize * 1.25 : dotSize, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : accentColor}
          emissive={isSelected ? '#06b6d4' : '#0891b2'}
          emissiveIntensity={isSelected ? 2.8 : (hovered ? 2.2 : 1.4)}
          roughness={0.2}
          depthTest={true}
        />
      </mesh>

      {/* 
        Upright Camera-Facing Billboard
        Contains:
        1. Camera-facing Leader Line (when offset)
        2. Clickable Label Pill
      */}
      <Billboard
        ref={billboardRef}
        position={[0, stemHeight + 0.08, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        {/* Subtle Leader Line Connecting Marker to Offset Label */}
        <line ref={leaderLineRef} visible={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, 0, 0, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.55}
            depthTest={true}
            depthWrite={false}
          />
        </line>

        {/* 
          Clickable City Label Mesh
          Clicking either the marker OR the label name selects the city!
        */}
        <mesh
          ref={labelMeshRef}
          onClick={handlePointerSelect}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[planeWidth, planeHeight]} />
          <meshBasicMaterial
            map={labelTexture}
            transparent
            opacity={opacity}
            depthTest={true}
            depthWrite={false}
          />
        </mesh>
      </Billboard>

      {/* Interactive Compact Hover Tooltip (Only visible if front-facing and hovered) */}
      {hovered && isFacingCamera && (
        <Html position={[0, stemHeight + 0.16, 0]} center pointerEvents="none" zIndexRange={[100, 0]}>
          <div className="bg-[#0a0f1d]/95 border border-cyan-400/50 rounded-lg px-2.5 py-1 shadow-xl backdrop-blur-md whitespace-nowrap pointer-events-none font-sans select-none flex flex-col gap-0.5 animate-fade-in text-left">
            <div className="text-[11px] font-bold text-white tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{item.name}</span>
            </div>
            <div className="text-[9px] text-slate-300 font-mono flex items-center gap-1">
              <span>{item.countryName || item.country || ''}</span>
              {item.travelStyle && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-cyan-300">{item.travelStyle}</span>
                </>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
