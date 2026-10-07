import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PremiumMarker } from './PremiumMarker.jsx';

/**
 * CityMarkersCluster
 * 
 * Intelligent 3D City Marker & Label Decluttering System
 * - Detects dense city clusters dynamically in screen space
 * - Resolves label collisions using priority:
 *     1. Selected City (+10,000)
 *     2. City Importance (+100 * importance)
 *     3. Camera Distance (closer = higher)
 * - Offsets secondary labels with subtle leader lines
 * - Dynamically expands labels when user zooms in
 * - Prevents overlapping markers and unreadable labels
 * - Runs 100% inside useFrame with ZERO React re-renders for buttery 60+ FPS
 * - Completely generic: works for Japan, Italy, India, UK, USA, etc.
 */
export function CityMarkersCluster({
  cities = [],
  selectedCity = null,
  currentLevel = 'country',
  onSelectCity,
}) {
  // Registry of child marker APIs: { [cityId]: { getWorldPos, setDeclutterState } }
  const markerRegistry = useRef(new Map());

  const registerMarker = (id, api) => {
    markerRegistry.current.set(id, api);
    return () => {
      markerRegistry.current.delete(id);
    };
  };

  // Precompute geographically dense cities within the visible country
  const denseCityIds = useMemo(() => {
    const denseSet = new Set();
    if (!cities || cities.length < 2) return denseSet;
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const c1 = cities[i];
        const c2 = cities[j];
        const dLat = c1.lat - c2.lat;
        const dLng = c1.lng - c2.lng;
        // Within ~4.5 degrees (~450 km) is a dense regional cluster
        if (Math.hypot(dLat, dLng) < 4.5) {
          denseSet.add(c1.id);
          denseSet.add(c2.id);
        }
      }
    }
    return denseSet;
  }, [cities]);

  // Reusable Three.js vectors for zero-allocation performance in useFrame
  const tempWorldPos = useRef(new THREE.Vector3());
  const tempNormal = useRef(new THREE.Vector3());
  const tempCamDir = useRef(new THREE.Vector3());
  const tempScreenPos = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    if (!cities || cities.length === 0) return;

    const visibleItems = [];

    // 1. Project all registered front-facing cities to screen space
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const api = markerRegistry.current.get(city.id);
      if (!api) continue;

      const worldPos = tempWorldPos.current;
      api.getWorldPosition(worldPos);

      // Check horizon visibility (surface normal dot cam direction)
      const normal = tempNormal.current.copy(worldPos).normalize();
      const camDir = tempCamDir.current.subVectors(camera.position, worldPos).normalize();
      const dot = normal.dot(camDir);

      // Behind the Earth?
      if (dot <= 0.18) continue;

      // Project to NDC [-1, 1]
      const screenPos = tempScreenPos.current.copy(worldPos).project(camera);

      // Screen edge boundary check
      if (Math.abs(screenPos.x) > 0.95 || Math.abs(screenPos.y) > 0.95) continue;

      // Approximate pixel coordinates (reference 1000 x 700 viewport)
      const pxX = screenPos.x * 500;
      const pxY = screenPos.y * 350;
      const camDist = camera.position.distanceTo(worldPos);

      // Calculate priority score
      const isSelected = selectedCity?.id === city.id;
      const importance = city.importance || 5;
      const priority = (isSelected ? 10000 : 0) + importance * 100 + (10 / (camDist || 1));

      visibleItems.push({
        city,
        api,
        pxX,
        pxY,
        camDist,
        isSelected,
        priority,
        clusterId: -1,
      });
    }

    if (visibleItems.length === 0) return;

    // 2. Screen-Space Collision Detection
    // Thresholds: horizontal 105px (labels are ~80-100px wide on screen), vertical 40px
    const COLLISION_THRESH_X = 105;
    const COLLISION_THRESH_Y = 40;

    let clusterCount = 0;
    const clusters = [];

    // Pairwise collision checks
    for (let i = 0; i < visibleItems.length; i++) {
      for (let j = i + 1; j < visibleItems.length; j++) {
        const itemA = visibleItems[i];
        const itemB = visibleItems[j];

        const dx = Math.abs(itemA.pxX - itemB.pxX);
        const dy = Math.abs(itemA.pxY - itemB.pxY);

        if (dx < COLLISION_THRESH_X && dy < COLLISION_THRESH_Y) {
          // Collision detected! Assign to cluster
          if (itemA.clusterId === -1 && itemB.clusterId === -1) {
            itemA.clusterId = clusterCount;
            itemB.clusterId = clusterCount;
            clusters[clusterCount] = [itemA, itemB];
            clusterCount++;
          } else if (itemA.clusterId !== -1 && itemB.clusterId === -1) {
            itemB.clusterId = itemA.clusterId;
            clusters[itemA.clusterId].push(itemB);
          } else if (itemA.clusterId === -1 && itemB.clusterId !== -1) {
            itemA.clusterId = itemB.clusterId;
            clusters[itemB.clusterId].push(itemA);
          } else if (itemA.clusterId !== itemB.clusterId) {
            // Merge clusters
            const targetId = itemA.clusterId;
            const sourceId = itemB.clusterId;
            const sourceCluster = clusters[sourceId];
            for (let k = 0; k < sourceCluster.length; k++) {
              sourceCluster[k].clusterId = targetId;
              clusters[targetId].push(sourceCluster[k]);
            }
            clusters[sourceId] = [];
          }
        }
      }
    }

    // 3. Resolve Offsets and Priorities for Clusters
    // Track cities handled in clusters
    const handledCityIds = new Set();

    for (let c = 0; c < clusters.length; c++) {
      const cluster = clusters[c];
      if (!cluster || cluster.length < 2) continue;

      // Sort cluster members by priority descending: Selected > Importance > Distance
      cluster.sort((a, b) => b.priority - a.priority);

      // Primary city: Highest priority city in this cluster
      const primary = cluster[0];
      handledCityIds.add(primary.city.id);
      primary.api.setDeclutterState({
        targetX: 0,
        targetY: 0.08,
        hasLeaderLine: false,
        isDense: true,
        isPrimary: true,
      });

      // Secondary cities: Compute intelligent non-overlapping offsets with leader lines
      let leftSecondaryCount = 0;
      let rightSecondaryCount = 0;

      for (let s = 1; s < cluster.length; s++) {
        const sec = cluster[s];
        handledCityIds.add(sec.city.id);

        const dx = sec.pxX - primary.pxX;
        const dy = sec.pxY - primary.pxY;

        let offX = 0;
        let offY = 0;

        // Choose side based on relative position to primary
        if (dx < -15 || (Math.abs(dx) <= 15 && leftSecondaryCount <= rightSecondaryCount)) {
          // Place on Left
          offX = -0.19;
          offY = leftSecondaryCount === 0 ? (dy > 0 ? 0.04 : -0.05) : -0.06;
          leftSecondaryCount++;
        } else {
          // Place on Right
          offX = +0.19;
          offY = rightSecondaryCount === 0 ? (dy > 0 ? 0.04 : -0.05) : -0.06;
          rightSecondaryCount++;
        }

        sec.api.setDeclutterState({
          targetX: offX,
          targetY: offY,
          hasLeaderLine: true,
          isDense: true,
          isPrimary: false,
        });
      }
    }

    // 4. Default uncollided state for isolated cities
    for (let i = 0; i < visibleItems.length; i++) {
      const item = visibleItems[i];
      if (!handledCityIds.has(item.city.id)) {
        item.api.setDeclutterState({
          targetX: 0,
          targetY: 0.08,
          hasLeaderLine: false,
          isDense: false,
          isPrimary: true,
        });
      }
    }
  });

  return (
    <>
      {cities.map((city) => {
        const isSelected = selectedCity?.id === city.id;
        const cityOpacity =
          currentLevel === 'city' || currentLevel === 'destination'
            ? isSelected
              ? 1
              : 0.4
            : 1;

        return (
          <PremiumMarker
            key={city.id}
            item={city}
            type="city"
            isSelected={isSelected}
            isVisible={true}
            opacity={cityOpacity}
            isDense={denseCityIds.has(city.id)}
            onSelect={onSelectCity}
            registerMarker={registerMarker}
          />
        );
      })}
    </>
  );
}
