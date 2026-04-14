import { getRestaurants } from "../api/restaurants.js";
import { enrichRestaurants, getNearest } from "../utils/map_model.js";
import { createMap, addUserMarker, addRestaurantMarker, openCustomPopup, hideCustomPopup, handleUserMarkerClick } from "./mapView.js";
import { getUser } from "../api/auth.js";

export async function initMap() {
  const restaurants = await getRestaurants();

  function getTestLocation(realCoords) {
    const TEST_MODE = true;
  
    if (!TEST_MODE) return realCoords;

    return {
      latitude: 60.1699,
      longitude: 24.9384
    };
  }
  
  navigator.geolocation.getCurrentPosition((pos) => {
    // const coords = getTestLocation(pos.coords)
    const { latitude, longitude } = pos.coords;

    const map = createMap(latitude, longitude);

    const enriched = enrichRestaurants(restaurants, latitude, longitude);

    const nearest = getNearest(enriched);

    const userIcon = L.icon({
        iconUrl: 'https://grassroots.tools/static/scripts/leaflet/images/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

    // NEAREST MARKER
    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });


    const favouriteIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
      

    addUserMarker(map, latitude, longitude, userIcon, (latlng) => {
        handleUserMarkerClick(map, latlng);
      });

    const user = getUser();
    enriched.forEach((r) => {
        const isNearest = r?._id === nearest?._id;
        const isFavourite = r?._id === user.favouriteRestaurant;

        let icon = undefined;

        if (isFavourite) {
            icon = favouriteIcon;
        } else if (isNearest) {
            icon = greenIcon;
        }

        addRestaurantMarker(
            map,
            r,
            icon,
            isNearest,
            isFavourite,
            (restaurant, latlng, isNearest, isFavourite) => {
              openCustomPopup(map, restaurant, latlng, isNearest, isFavourite);
              map.flyTo(latlng, 15, {
                duration: 0.6
              });
            }
          );


      });

      map.on("click", () => {
        hideCustomPopup();
      });
      
      
  });

}

initMap();

async function openRestaurant(restaurant, latlng, map) {
    const user = getUser();

    const isNearest = restaurant._id === nearest?._id;
    const isFavourite = restaurant._id === user?.favouriteRestaurant;

    openCustomPopup(map, restaurant, latlng, isNearest, isFavourite);

    map.flyTo(latlng, 15, { duration: 0.6 });
}
