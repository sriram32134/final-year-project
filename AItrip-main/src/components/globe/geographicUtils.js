import * as THREE from 'three';

/**
 * Convert latitude and longitude to 3D Cartesian coordinates on sphere of radius R.
 * Standard spherical coordinate mapping:
 * - Latitude: -90 (South Pole) to +90 (North Pole)
 * - Longitude: -180 to +180
 */
export function latLngToVector3(lat, lng, radius = 2.5) {
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : Number(lat) || 0;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : Number(lng) || 0;
  const phi = (90 - safeLat) * (Math.PI / 180);
  const theta = (safeLng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

/**
 * Compute the Euler rotation angles (rotX, rotY) to bring (lat, lng)
 * directly in front of the camera at (0, 0, +Z).
 */
export function getRotationForLatLng(lat, lng) {
  const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : Number(lat) || 0;
  const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : Number(lng) || 0;
  const targetAngleY = -Math.PI / 2 - (safeLng * Math.PI) / 180;
  const targetAngleX = (safeLat * Math.PI) / 180;
  return { targetAngleX, targetAngleY };
}

/**
 * Generate 3D curved Great Circle arc points between two lat/lng points,
 * slightly elevated above the sphere radius.
 */
export function createArcPoints(fromLatLng, toLatLng, radius = 2.5, numPoints = 48, maxAltitude = 0.25) {
  const v1 = latLngToVector3(fromLatLng[0], fromLatLng[1], radius);
  const v2 = latLngToVector3(toLatLng[0], toLatLng[1], radius);

  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Slerp along unit sphere
    const p = new THREE.Vector3().lerpVectors(v1, v2, t).normalize();
    // Parabolic arc elevation
    const elevation = Math.sin(t * Math.PI) * maxAltitude;
    p.multiplyScalar(radius + elevation);
    points.push(p);
  }
  return points;
}
