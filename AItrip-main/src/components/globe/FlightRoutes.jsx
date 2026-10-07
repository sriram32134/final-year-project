import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createArcPoints } from './geographicUtils.js';

function ArcLine({ route }) {
  const linePoints = useMemo(() => {
    return createArcPoints(route.fromCoords, route.toCoords, 2.5, 48, 0.22);
  }, [route.fromCoords, route.toCoords]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints(linePoints);
    return geom;
  }, [linePoints]);

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.35}
        linewidth={1}
      />
    </line>
  );
}

export function FlightRoutes({ routes = [], isVisible = true }) {
  if (!isVisible || !routes.length) return null;

  return (
    <group>
      {routes.map((route) => (
        <ArcLine key={route.id} route={route} />
      ))}
    </group>
  );
}
