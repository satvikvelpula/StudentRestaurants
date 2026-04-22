import { getRestaurants } from "../api/restaurants.js";
import { enrichRestaurants, getNearest } from "../utils/map_model.js";
import { createMap, addUserMarker, addRestaurantMarker, hideCustomPopup, handleUserMarkerClick } from "./mapView.js";
import { getUser } from "../api/auth.js";
import { getDailyMenu, getWeeklyMenu } from "../api/menus.js";
import { parseCourses, parseWeeklyCourses } from "../utils/menu_model.js";

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
    const icons = {
        favourite: favouriteIcon,
        nearest: greenIcon
      };


    enriched.forEach((r) => {
        const icon = getRestaurantIcon(r, user, nearest, icons);

        addRestaurantMarker(
            map,
            r,
            icon,
            (restaurant, latlng) => {
                openRestaurant(restaurant, latlng, map, nearest);
            },
            user,
            nearest
          );
      });

      map.on("click", () => {
        hideCustomPopup();
      });

      renderRestaurantList(enriched, map, nearest);
      
      
  });

}

initMap();

async function openRestaurant(restaurant, latlng, map, nearest) {

    // const isNearest = restaurant._id === nearest?._id;
    // const isFavourite = restaurant._id === user?.favouriteRestaurant;

    // openCustomPopup(map, restaurant, latlng, isNearest, isFavourite);

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

function renderRestaurantList(restaurants, map, nearest) {
    const container = document.querySelector(".restaurant-list");
  
    container.innerHTML = `
    <h2 class="section-title">Restaurants</h2>
    <div class="restaurant-list-scroll"></div>
  `;
  
  const scrollContainer = container.querySelector(".restaurant-list-scroll");
  
  
    restaurants.forEach((r) => {
      const card = document.createElement("div");
      card.className = "restaurant-card";
  
      card.innerHTML = `
        <h3>${r.name}</h3>
        <p>${r.address || "No address"}</p>
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
        console.log(data, "parseWeeklyCourses(data) function check");
      }
  
      menuCache.set(cacheKey, data);
  
      renderMenu(data, type);
  
    } catch (err) {
      console.error("Menu error:", err);
      renderMenu([], type);
    }
  }
  
  function renderMenu(data, type) {
    const container = document.getElementById("menu-content");
  
    if (!data || data.length === 0) {
      container.innerHTML = "<p>No menu available</p>";
      return;
    }
  
    if (type === "daily") {
        console.log(data, "Daily data check");
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
    console.log(currentRestaurantId);
  
    // document.getElementById("modal-title").textContent = restaurant.name;
    renderRestaurantProfile(restaurant, nearest);
  
    modal.classList.remove("hidden");
  
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
        modal.classList.add("hidden");
    });
    }


function renderRestaurantProfile(restaurant, nearest) {

    const user = getUser();
    const isFavourite = restaurant._id === user?.favouriteRestaurant;
    const isNearest = restaurant._id === nearest?._id;

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

    </div>
  `;
}
      

  
  
  
  