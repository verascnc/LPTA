interface Location {
  id: number;
  latitude: number;
  longitude: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime: number;
}

interface OptimizedRoute {
  locations: Location[];
  totalDistance: number;
  totalTime: number;
  efficiency: number;
}

// Haversine formula to calculate distance between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Priority weights for optimization
const PRIORITY_WEIGHTS = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

// Nearest neighbor algorithm with priority consideration
export function optimizeRouteNearestNeighbor(
  startLocation: { latitude: number; longitude: number },
  locations: Location[]
): OptimizedRoute {
  if (locations.length === 0) {
    return { locations: [], totalDistance: 0, totalTime: 0, efficiency: 0 };
  }

  const optimized: Location[] = [];
  const remaining = [...locations];
  let currentLocation = startLocation;
  let totalDistance = 0;
  let totalTime = 0;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = Infinity;

    // Find the best next location considering distance and priority
    for (let i = 0; i < remaining.length; i++) {
      const location = remaining[i];
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        location.latitude,
        location.longitude
      );

      // Score combines distance with inverse priority weight
      // Lower score is better
      const priorityBonus = (5 - PRIORITY_WEIGHTS[location.priority]) * 2;
      const score = distance + priorityBonus;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const nextLocation = remaining[bestIndex];
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      nextLocation.latitude,
      nextLocation.longitude
    );

    optimized.push(nextLocation);
    totalDistance += distance;
    totalTime += nextLocation.estimatedTime;
    
    currentLocation = {
      latitude: nextLocation.latitude,
      longitude: nextLocation.longitude
    };
    
    remaining.splice(bestIndex, 1);
  }

  // Calculate efficiency (simple metric based on priority completion vs distance)
  const prioritySum = optimized.reduce((sum, loc, index) => {
    // Earlier locations get bonus for being prioritized
    const positionBonus = (optimized.length - index) / optimized.length;
    return sum + (PRIORITY_WEIGHTS[loc.priority] * positionBonus);
  }, 0);

  const maxPossiblePriority = optimized.reduce((sum, loc) => sum + PRIORITY_WEIGHTS[loc.priority], 0);
  const efficiency = maxPossiblePriority > 0 ? (prioritySum / maxPossiblePriority) * 100 : 0;

  return {
    locations: optimized,
    totalDistance,
    totalTime,
    efficiency
  };
}

// 2-opt improvement algorithm
export function improve2Opt(route: Location[]): Location[] {
  if (route.length < 4) return route;

  let improved = [...route];
  let bestDistance = calculateRouteDistance(improved);
  let hasImprovement = true;

  while (hasImprovement) {
    hasImprovement = false;

    for (let i = 1; i < improved.length - 2; i++) {
      for (let j = i + 1; j < improved.length; j++) {
        if (j - i === 1) continue; // Skip adjacent edges

        const newRoute = [...improved];
        // Reverse the order of cities between i and j
        const segment = newRoute.slice(i, j + 1).reverse();
        newRoute.splice(i, j - i + 1, ...segment);

        const newDistance = calculateRouteDistance(newRoute);
        if (newDistance < bestDistance) {
          improved = newRoute;
          bestDistance = newDistance;
          hasImprovement = true;
        }
      }
    }
  }

  return improved;
}

function calculateRouteDistance(route: Location[]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(
      route[i].latitude,
      route[i].longitude,
      route[i + 1].latitude,
      route[i + 1].longitude
    );
  }
  return totalDistance;
}

// Main optimization function that combines multiple algorithms
export function optimizeRoute(
  startLocation: { latitude: number; longitude: number },
  locations: Location[],
  algorithm: 'nearest-neighbor' | '2-opt' | 'hybrid' = 'hybrid'
): OptimizedRoute {
  if (locations.length === 0) {
    return { locations: [], totalDistance: 0, totalTime: 0, efficiency: 0 };
  }

  switch (algorithm) {
    case 'nearest-neighbor':
      return optimizeRouteNearestNeighbor(startLocation, locations);
    
    case '2-opt':
      // Start with a simple order then apply 2-opt
      const initialRoute = [...locations];
      const improvedRoute = improve2Opt(initialRoute);
      return {
        locations: improvedRoute,
        totalDistance: calculateRouteDistance(improvedRoute),
        totalTime: improvedRoute.reduce((sum, loc) => sum + loc.estimatedTime, 0),
        efficiency: 85 // Simplified efficiency calculation
      };
    
    case 'hybrid':
    default:
      // Use nearest neighbor then improve with 2-opt
      const nnResult = optimizeRouteNearestNeighbor(startLocation, locations);
      const optimizedRoute = improve2Opt(nnResult.locations);
      
      return {
        locations: optimizedRoute,
        totalDistance: calculateRouteDistance(optimizedRoute),
        totalTime: optimizedRoute.reduce((sum, loc) => sum + loc.estimatedTime, 0),
        efficiency: Math.min(nnResult.efficiency + 10, 100) // Improvement bonus
      };
  }
}

// Utility function to estimate travel time based on distance
export function estimateTravelTime(distanceKm: number, averageSpeedKmh: number = 40): number {
  return Math.round((distanceKm / averageSpeedKmh) * 60); // Return minutes
}

// Function to add time windows constraints
export function optimizeWithTimeWindows(
  startLocation: { latitude: number; longitude: number },
  locations: (Location & { 
    earliestDelivery?: Date; 
    latestDelivery?: Date; 
  })[],
  currentTime: Date = new Date()
): OptimizedRoute {
  // Filter locations that can still be reached within their time windows
  const validLocations = locations.filter(loc => {
    if (!loc.latestDelivery) return true;
    return loc.latestDelivery > currentTime;
  });

  // Sort by urgency (earliest deadline first)
  const sortedByDeadline = validLocations.sort((a, b) => {
    if (!a.latestDelivery && !b.latestDelivery) return 0;
    if (!a.latestDelivery) return 1;
    if (!b.latestDelivery) return -1;
    return a.latestDelivery.getTime() - b.latestDelivery.getTime();
  });

  return optimizeRouteNearestNeighbor(startLocation, sortedByDeadline);
}
