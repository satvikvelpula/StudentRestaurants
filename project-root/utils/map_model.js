export function toRadians(deg) {
    return deg * (Math.PI / 180);
  }
  
  export function calculateDistance(a, b, lat, lng) {
    const [lon2, lat2] = a.location.coordinates;
  
    const dLat = toRadians(lat2 - lat);
    const dLon = toRadians(lon2 - lng);
  
    const lat1 = toRadians(lat);
    const lat2Rad = toRadians(lat2);
  
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) *
        Math.cos(lat2Rad) *
        Math.sin(dLon / 2) ** 2;
  
    const distance = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  
    return 6371 * distance; // km
  }
  
  export function enrichRestaurants(restaurants, lat, lng) {
    return restaurants.map((r) => {
      const distance = calculateDistance(r, r.location, lat, lng);
  
      return {
        ...r,
        distance
      };
    });
  }
  
  export function getNearest(restaurants) {
    return restaurants.reduce((closest, current) => {
      return !closest || current.distance < closest.distance
        ? current
        : closest;
    }, null);
  }
  