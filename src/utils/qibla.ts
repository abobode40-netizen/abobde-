/**
 * Qibla Compass & Gyroscope/Orientation Utility
 * Accurate Geodesic Calculations towards the Holy Kaaba in Makkah
 */

import { UserLocation } from './prayerTimes';

export const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206,
  name: 'الكعبة المشرفة - المسجد الحرام، مكة المكرمة'
};

/**
 * Calculates Great-Circle forward azimuth (bearing) from user's coordinates to Kaaba in degrees (0 - 360).
 */
export function calculateQiblaBearing(userLat: number, userLng: number): number {
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (KAABA_COORDS.latitude * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDS.longitude - userLng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  qiblaDeg = (qiblaDeg + 360) % 360;

  return Math.round(qiblaDeg * 10) / 10;
}

/**
 * Calculates Great-Circle distance to the Kaaba in kilometers.
 */
export function calculateDistanceToKaaba(userLat: number, userLng: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((KAABA_COORDS.latitude - userLat) * Math.PI) / 180;
  const dLon = ((KAABA_COORDS.longitude - userLng) * Math.PI) / 180;
  const lat1 = (userLat * Math.PI) / 180;
  const lat2 = (KAABA_COORDS.latitude * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Converts a degree heading to an Arabic cardinal direction string.
 */
export function getBearingCardinalArabic(deg: number): string {
  const normalized = (deg + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'الشمال (N)';
  if (normalized >= 22.5 && normalized < 67.5) return 'الشمال الشرقي (NE)';
  if (normalized >= 67.5 && normalized < 112.5) return 'الشرق (E)';
  if (normalized >= 112.5 && normalized < 157.5) return 'الجنوب الشرقي (SE)';
  if (normalized >= 157.5 && normalized < 202.5) return 'الجنوب (S)';
  if (normalized >= 202.5 && normalized < 247.5) return 'الجنوب الغربي (SW)';
  if (normalized >= 247.5 && normalized < 292.5) return 'الغرب (W)';
  return 'الشمال الغربي (NW)';
}

/**
 * Formats difference angle relative to Qibla.
 * Returns negative if user needs to turn left, positive if turn right.
 */
export function calculateAngleDifference(heading: number, qiblaBearing: number): number {
  let diff = (qiblaBearing - heading + 360) % 360;
  if (diff > 180) {
    diff -= 360;
  }
  return Math.round(diff * 10) / 10;
}

/**
 * Checks if iOS DeviceOrientation permission is required and handles permission request.
 */
export async function requestOrientationPermission(): Promise<boolean> {
  if (
    typeof window !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      .requestPermission === 'function'
  ) {
    try {
      const perm = await (
        DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
      ).requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }
  return true; // Non-iOS or older devices do not require explicit runtime permission
}
