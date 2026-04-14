export function createMap(lat, lng) {

    const finlandBounds = L.latLngBounds(
      [59.0, 18.0],
      [71.0, 33.0]
    );
  
    const map = L.map("map", {
      zoom: 13,
      minZoom: 5,
      maxZoom: 18,
      attributionControl: false
    });
  
    const isInsideFinland = finlandBounds.contains([lat, lng]);
  
    if (isInsideFinland) {
      map.setView([lat, lng], 13);
    } else {
      map.fitBounds(finlandBounds);
    }
  
    map.setMaxBounds(finlandBounds);
  
    L.tileLayer(/*"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"*/"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 18
    }).addTo(map);
  
    return map;
  }
  

  export function addUserMarker(map, lat, lng, icon, onClick) {
    const marker = L.marker([lat, lng], { icon }).addTo(map);
  
    if (onClick) {
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        const latlng = marker.getLatLng();
        onClick(latlng);
      });
    }
  }  

  async function getAddressSafe(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
  
      if (!res.ok) throw new Error("Failed");
  
      const data = await res.json();
  
      // Extract cleaner format
      const road = data.address?.road || "N/A";
      const city = data.address?.city || data.address?.town || "N/A";
  
      if (!road && !city) return null;
  
      console.log(`${city}, ${road} called from main function`);
      return `${city}, ${road}`;
    } catch (e) {
      console.error("Reverse geocoding failed:", e);
      return null;
    }
  }
  
  

  export function addRestaurantMarker(map, restaurant, icon, isNearest, isFavorite, onClick) {
    const [lng, lat] = restaurant.location.coordinates;
  
    const options = icon ? { icon } : {};
  
    const marker = L.marker([lat, lng], options).addTo(map);

    /*marker.bindPopup(
        `${restaurant.name} ${isNearest ? "🟢" : ""}\n${restaurant.distance.toFixed(2)} km`,
        {
        direction: "top",
        opacity: 0.9
        }
    );*/
  
    if (onClick) {
      marker.on("click", () => {
        const latlng = marker.getLatLng();
        
        onClick(restaurant, latlng, isNearest, isFavorite);
      });
    }
  }  



  function showPopup(map, popup, latlng) {
    popup.classList.remove("hidden");
    popup.classList.add("show");
  
    window.currentPopupLatLng = latlng;
  
    if (map._popupMoveHandler) {
      map.off("move", map._popupMoveHandler);
    }
  
    map._popupMoveHandler = () => {
      const point = map.latLngToContainerPoint(window.currentPopupLatLng);
      popup.style.left = `${point.x}px`;
      popup.style.top = `${point.y}px`;
    };
  
    map._popupMoveHandler();
    map.on("move", map._popupMoveHandler);
  } 



  export async function openUserPopup(map, latlng, address = null) {
    const popup = document.getElementById("map-popup");

    if (!latlng || latlng.lat === undefined || latlng.lng === undefined) {
        console.error("Invalid latlng:", latlng);
        return;
      }
  
    popup.innerHTML = `
      <div class="map-popup user">
        <div class="popup-title">
            Your Location
        </div>
        <div class="popup-subtext">
          ${address || "Fetching location..."}
        </div>
      </div>
    `;

    showPopup(map, popup, latlng);
  }
  

  export function openCustomPopup(map, restaurant, latlng, isNearest, isFavourite) {
    const popup = document.getElementById("map-popup");
  
    const distance =
      restaurant.distance < 1
        ? `${Math.round(restaurant.distance * 1000)} m`
        : `${restaurant.distance.toFixed(1)} km`;


    let typeClass = "";

    if (isFavourite) {
        typeClass = "favourite";
    } else if (isNearest) {
        typeClass = "nearest";
    }
  
    popup.innerHTML = `
    <div class="map-popup ${typeClass}">
      <div class="popup-title">
        ${restaurant.name}
        ${isFavourite ? "(favourite)" : isNearest ? "(closest)" : ""}
      </div>
      <div class="popup-subtext">${distance} away</div>
    </div>
  `;
  

    showPopup(map, popup, latlng);
  }

  export function hideCustomPopup() {
    const popup = document.getElementById("map-popup");
    popup.classList.add("hidden");
  }

  let isFetchingAddress = false; // GLOBAL FETCHING ADDRESS CHECKER
  let addressCache = new Map();
  
  export async function handleUserMarkerClick(map, latlng) {
    const key = `${latlng.lat.toFixed(5)},${latlng.lng.toFixed(5)}`;
  
    if (addressCache.has(key)) {
      openUserPopup(map, latlng, addressCache.get(key));
      return;
    }
  
    openUserPopup(map, latlng, "Fetching location...");
  
    if (isFetchingAddress) return;
  
    isFetchingAddress = true;
  
    try {
      const fetchedAddress = await getAddressSafe(latlng.lat, latlng.lng);
  
      const finalText = fetchedAddress || "Location unavailable";
  
      addressCache.set(key, finalText);
  
      openUserPopup(map, latlng, finalText);
    } finally {
      isFetchingAddress = false;
    }
  }
  
  