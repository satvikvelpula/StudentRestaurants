import { getRestaurants } from "../api/restaurants.js";
import { enrichRestaurants, getNearest } from "../utils/map_model.js";
import { createMap, addUserMarker, addRestaurantMarker, hideCustomPopup, handleUserMarkerClick, setUserLocation, getGoogleMapsDirectionsUrl, getUserLocation } from "./mapView.js";
import { getUser } from "../api/auth.js";
import { getDailyMenu, getWeeklyMenu } from "../api/menus.js";
import { parseCourses, parseWeeklyCourses } from "../utils/menu_model.js";
import { showToast } from "../utils/notifications.js"; 
import { userIcon, greenIcon, favouriteIcon } from "../components/icons.js";
import { extractFilterOptions, populateFilters, setupFilterEvents } from "../components/filters.js";
import { filterRestaurants } from "../components/restaurantFilters.js";
import { updateUI, fadeOutMarker } from "../components/updateUI.js";
import { initNav } from "../components/nav.js";
import { safeApi } from "../utils/safeApi.js";

initNav();

export function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function bootstrapApp() {
    try {
      const position = await getPosition();

      showToast("Location detected 📍", "success");
  
      startApp(position.coords.latitude, position.coords.longitude);
  
    } catch (err) {
      console.warn("Geolocation failed, using fallback");
  
      showToast("Using default location (Helsinki)", "error");
  
      startApp(60.1699, 24.9384);
    }
  }

function startApp(lat, lng) {
    setUserLocation(lat, lng);

    const map = createMap(lat, lng);

    initMap(lat, lng, map);
}
  

export async function initMap(latitude, longitude, map) {
  let restaurants = [];
  try {
    restaurants = await safeApi(
        () => getRestaurants(),
        [],
        "Could not load restaurants (VPN or network issue)"
      );
      
    showToast(`Loaded ${restaurants.length} restaurants`, "success");
    } catch (err) {
        console.error("Failed to fetch restaurants:", err);
        showToast("Could not load restaurants", "error");
        return;
    }

    const state = {
        restaurantMarkers: [],
        isUpdating: false
        };

    const deps = {
        getUser,
        getNearest,
        getRestaurantIcon,
        addRestaurantMarker,
        renderRestaurantList,
        fadeOutMarker,
        showToast,
        icons: {
            favourite: favouriteIcon,
            nearest: greenIcon
        },
        onRestaurantClick: (restaurant, latlng, nearest) => {
            openRestaurant(restaurant, latlng, map, nearest);
        }
        };
        

    const enriched = enrichRestaurants(restaurants, latitude, longitude);

    const filterSets = extractFilterOptions(enriched);
    populateFilters(filterSets.cities, filterSets.companies);

    const allRestaurants = enriched;

    setupFilterEvents({
        allRestaurants,
        map,
        state,
        deps,
        filterRestaurants,
        updateUI
    });

    addUserMarker(map, latitude, longitude, userIcon, (latlng) => {
        handleUserMarkerClick(map, latlng);
    });

    map.on("click", () => {
        hideCustomPopup();
    });

    updateUI({
        filteredRestaurants: enriched,
        searchQuery: "",
        map,
        state,
        deps
    });

}

bootstrapApp()

async function openRestaurant(restaurant, latlng, map, nearest) {
    map.flyTo(latlng, 15, { duration: 0.6 });
    openMenuModal(restaurant, nearest);
}

function getRestaurantIcon(r, user, nearest, icons) {
    const isFavourite = r._id === user?.favouriteRestaurant;
    const isNearest = r._id === nearest?._id;

    if (isFavourite) return icons.favourite;
    if (isNearest) return icons.nearest;
    return undefined;
}

function renderRestaurantList(restaurants, map, nearest, searchQuery = "") {
    const container = document.querySelector(".restaurant-list");
  
    container.innerHTML = `
    <h2 class="section-title">Restaurants</h2>
    <div class="restaurant-list-scroll"></div>
  `;
  
  const scrollContainer = container.querySelector(".restaurant-list-scroll");
  
  if (!restaurants.length) {
    const empty = document.createElement("div");
    empty.className = "restaurant-card";

    empty.innerHTML = `
      <p>
        Restaurant "${searchQuery}" not found
      </p>
    `;

    scrollContainer.appendChild(empty);
    return;
  }
  
    restaurants.forEach((r) => {
      const card = document.createElement("div");

      const user = getUser();
      const isFavourite = r._id === user?.favouriteRestaurant;
      const isNearest = r._id === nearest?._id;

      let badge = "";
      if (isFavourite) {
        badge = `<span class="badge fav">★</span>`;
        card.classList.add("favourite");
      } else if (isNearest) {
        badge = `<span class="badge near">●</span>`;
        card.classList.add("nearest");
      }

      card.className = "restaurant-card";
      card.innerHTML = `
      <div class="card-header">
        <h3>${r.name}</h3>
        ${badge}
      </div>
      <p>${r.address || "No address"}</p>
      <p class="card-company">${r.company || "Unknown"}</p>
    `;
  
      card.addEventListener("click", () => {
        const [lng, lat] = r.location.coordinates;
  
        openRestaurant(
          r,
          { lat, lng },
          map,
          nearest
        );
      });
  
      scrollContainer.appendChild(card);
    });
  }

    const menuCache = new Map();
    let currentRestaurantId = null;

    const dailyTab = document.getElementById("tab-daily");
    const weeklyTab = document.getElementById("tab-weekly");
    const modal = document.getElementById("modal");


    function renderMenuError(message = "Failed to load menu", type = "daily") {
    const container = document.getElementById("menu-content");

    container.innerHTML = `
        <div class="menu-error">
        <p>${message}</p>
        </div>
    `;

    document.getElementById("retry-menu").addEventListener("click", () => {
        loadMenu(currentRestaurantId, type);
    });
    }


  async function loadMenu(restaurantId, type = "daily") {
    const cacheKey = `${restaurantId}-${type}`;
  
    if (menuCache.has(cacheKey)) {
      renderMenu(menuCache.get(cacheKey), type);
      return;
    }
  
    try {
      let data;
  
      if (type === "daily") {
        data = await getDailyMenu(restaurantId);
        data = parseCourses(data);
      } else {
        data = await getWeeklyMenu(restaurantId);
        data = parseWeeklyCourses(data);
      }
  
      menuCache.set(cacheKey, data);
  
      renderMenu(data, type);
  
    } catch (err) {
      console.error("Menu error:", err);
      renderMenuError("Could not load menu. Try again.", type);
      // renderMenu([], type);
    }
  }
  
  function renderMenu(data, type) {
    const container = document.getElementById("menu-content");
  
    if (!data || data.length === 0) {
      container.innerHTML = "<p>No menu available</p>";
      return;
    }
  
    if (type === "daily") {
      container.innerHTML = data.map(item => `
        <div class="menu-item">
          <strong>${item.name}</strong><br>
          ${item.price || ""}
          <small>
            ${item.diets?.join?.(", ") || item.diets || ""}
          </small>
        </div>
      `).join("");
    }
    else {
        container.innerHTML = data.map((day, index) => `
          <div class="menu-day">
          <h4>
            ${day.date || `Menu ${index + 1}`}
        </h4>

    
            ${day.courses.map(course => `
              <div class="menu-item">
                <strong>${course.name}</strong><br>
                ${course.price || ""}
                <small>
                  ${course.diets || ""}
                </small>
              </div>
            `).join("")}
    
          </div>
        `).join("");
      }
  }

  function setActiveTab(type) {
    dailyTab.classList.remove("active");
    weeklyTab.classList.remove("active");
  
    if (type === "daily") {
      dailyTab.classList.add("active");
    } else {
      weeklyTab.classList.add("active");
    }
  }  

  function openMenuModal(restaurant, nearest) {
    currentRestaurantId = restaurant._id;
    
    if (!currentRestaurantId) return;
  
    renderRestaurantProfile(restaurant, nearest);

    modal.classList.remove("closing"); 
    modal.classList.add("open");
  
    setActiveTab("daily");
    loadMenu(currentRestaurantId, "daily");
  }
  
  if (dailyTab && weeklyTab) {
    dailyTab.addEventListener("click", () => {
      setActiveTab("daily");
      loadMenu(currentRestaurantId, "daily");
    });
  
    weeklyTab.addEventListener("click", () => {
      setActiveTab("weekly");
      loadMenu(currentRestaurantId, "weekly");
    });
  }

  const closeBtn = document.getElementById("modal-close");

    if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
        modal.classList.add("closing");

        setTimeout(() => {
            modal.classList.remove("closing");
        }, 200); // match CSS
    });
    }
      
function renderRestaurantProfile(restaurant, nearest) {

    const user = getUser();
    const userLocation = getUserLocation();
    if (!userLocation) {
        showToast("Location not available", "error");
        return;
      }
    const isFavourite = restaurant._id === user?.favouriteRestaurant;
    const isNearest = restaurant._id === nearest?._id;

    const [lng, lat] = restaurant.location.coordinates;

    const drivingUrl = getGoogleMapsDirectionsUrl(userLocation, { lat, lng }, "driving");
    const walkingUrl = getGoogleMapsDirectionsUrl(userLocation, { lat, lng }, "walking");
    const transitUrl = getGoogleMapsDirectionsUrl(userLocation, { lat, lng }, "transit");

    const container = document.getElementById("restaurant-profile");

    const distance =
    restaurant.distance < 1
        ? `${Math.round(restaurant.distance * 1000)} m`
        : `${restaurant.distance.toFixed(1)} km`;

    let themeClass = "";

    if (isFavourite) {
    themeClass = "favourite";
    } else if (isNearest) {
    themeClass = "nearest";
    }  

    container.innerHTML = `
    <div class="restaurant-profile ${themeClass}">
      
      <div class="profile-header">
        <h2 class="profile-name">
          ${restaurant.name}
        </h2>

        <div class="profile-badges">
          ${isFavourite ? `<span class="badge fav">★</span>` : ""}
          ${isNearest ? `<span class="badge near">●</span>` : ""}
        </div>
      </div>

      <p class="profile-address">
        ${restaurant.address}, ${restaurant.postalCode} ${restaurant.city}
      </p>

      <p class="profile-meta">
        <span>📞</span>
        <span>${restaurant.phone || "N/A"}</span>
      </p>

      <p class="profile-meta">
        <span>🏢</span>
        <span>${restaurant.company || "Unknown"}</span>
      </p>

      <p class="profile-distance">
        📍 ${distance} away
      </p>

        <div class="nav-row">
        <a href="${drivingUrl}" target="_blank" class="navigate-btn">
            🚗 Navigate
        </a>

        <a href="${walkingUrl}" target="_blank" class="nav-icon">
            🚶 
        </a>

        <a href="${transitUrl}" target="_blank" class="nav-icon">
            🚌
        </a>
        </div>

    </div>
  `;
}
      

  
  
  
  