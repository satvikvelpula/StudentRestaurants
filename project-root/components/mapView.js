import { showToast } from "../utils/notifications.js"; 
// Store latest user location (shared)
let userLocation = null;

export function setUserLocation(lat, lng) {
  userLocation = { lat, lng };
}

export function getUserLocation() {
  return userLocation;
}

// Build Google Maps directions URL
export function getGoogleMapsDirectionsUrl(origin, destination, mode = "driving") {
  if (!origin || !destination) return "#";

  return `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&travelmode=${mode}`;
}


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
  
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
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
      return `${city}, ${road}`;
    } catch (e) {
      console.error("Reverse geocoding failed:", e);
      return null;
    }
  }

  let invalidRestaurantWarningShown = false;
  
  export function addRestaurantMarker(map, restaurant, icon, onClick, user, nearest) {


    if (!restaurant?.location?.coordinates) {
        console.warn("Missing coordinates:", restaurant);

        if (!invalidRestaurantWarningShown) {
            showToast("Some restaurants could not be displayed", "error");
            invalidRestaurantWarningShown = true;
          }

        return null;
    }
  
    const [lng, lat] = restaurant.location.coordinates;

    if (typeof lat !== "number" || typeof lng !== "number") {
        console.warn("Invalid coordinates:", restaurant);
        return null;
      }

    const options = icon ? { icon } : {};
    const marker = L.marker([lat, lng], options).addTo(map);
  
    const isFavourite = restaurant._id === user?.favouriteRestaurant;
    const isNearest = restaurant._id === nearest?._id;

      // 4. Safe distance
    let distanceText = "N/A";

    if (typeof restaurant.distance === "number") {
        distanceText =
        restaurant.distance < 1
            ? `${Math.round(restaurant.distance * 1000)} m`
            : `${restaurant.distance.toFixed(1)} km`;
    } else {
        console.warn("Missing distance:", restaurant);
    }

    /*
  
    const distance =
      restaurant.distance < 1
        ? `${Math.round(restaurant.distance * 1000)} m`
        : `${restaurant.distance.toFixed(1)} km`;

    */
  
    let typeClass = "";
    if (isFavourite) typeClass = "favourite";
    else if (isNearest) typeClass = "nearest";

    const html = `
  <div class="popup-title">
    ${restaurant.name}
    ${isFavourite ? "(favourite)" : isNearest ? "(closest)" : ""}
  </div>
  <div class="popup-subtext">
    ${distanceText} away
  </div>
`;

    createTooltip(map, marker, html, typeClass);

    
  
    if (onClick) {
      marker.on("click", () => {
        const latlng = marker.getLatLng();
        onClick(restaurant, latlng);
      });
    }

    return marker;
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

    popup.style.visibility = "visible";

    popup.getBoundingClientRect();

    requestAnimationFrame(() => {
      popup.style.opacity = "1";
      popup.style.transform = "translate(-50%, -140%) scale(1)";
    });


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
    popup.style.opacity = "0";
    popup.style.transform = "translate(-50%, -140%) scale(0.92)";

    setTimeout(() => {
    popup.style.visibility = "hidden";  
    }, 180);

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

      if (!fetchedAddress) {
        showToast("Could not fetch address", "error");
      }
  
      const finalText = fetchedAddress || "Location unavailable";
  
      addressCache.set(key, finalText);
  
      openUserPopup(map, latlng, finalText);
    } finally {
      isFetchingAddress = false;
    }
  }
  
  function createTooltip(map, marker, html, typeClass = "") {
    const tooltip = document.createElement("div");
    tooltip.className = `map-tooltip ${typeClass}`;
    tooltip.innerHTML = `
      <div class="map-popup ${typeClass}">
        ${html}
      </div>
    `;
  
    document.getElementById("map").appendChild(tooltip);
  
    const update = () => {
      const pos = map.latLngToContainerPoint(marker.getLatLng());
  
      tooltip.style.left = `${pos.x}px`;
      tooltip.style.top = `${pos.y - 30}px`;
    };

    update();
  
    const show = () => {
        tooltip.style.visibility = "visible";
      
        // force browser to register start state
        tooltip.getBoundingClientRect();
      
        requestAnimationFrame(() => {
          tooltip.style.opacity = "1";
          tooltip.style.transform = "translate(-50%, -110%) scale(1)";
        });
      };
  
    const hide = () => {
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translate(-50%, -110%) scale(0.96)";

        setTimeout(() => {
            tooltip.style.visibility = "hidden";
        }, 140);
    };
      
  
    // tooltip.style.display = "none";
  
    // Hover behavior
    marker.on("mouseover", show);
    marker.on("mouseout", hide);
  
    // keep position synced
    // map.on("zoom move", update);
    map.on("move", update);
    map.on("zoomend", update);
  
    marker.on("remove", () => {
      map.off("zoom move", update);
      tooltip.remove();
    });
  }
  
  
  
  