import { logout, clearAuthState } from "../api/auth.js";
import { initNav } from "../components/nav.js";
import { getRestaurants } from "../api/restaurants.js";
import { deleteUser, updateUser } from "../api/users.js";
import { getAddressSafe } from "../components/mapView.js"; 
import { getPosition } from "../utils/getLocation.js";
import { loadAuthUser } from "../utils/authLoader.js";
import { getAvatarSrc } from "../utils/avatar.js";



const LOCATION_CACHE_KEY = "user_location_cache";
const LOCATION_TTL = 1000 * 60 * 10; // 10 minutes
const FAVORITE_CACHE_KEY = "favorite_restaurant_cache";
const FAVORITE_TTL = 1000 * 60 * 10; // 10 minutes

async function init() {
    initNav();
  
    const user = await loadAuthUser();
    if (!user) return;
  
    setupUI(user);
    setupActions(user);
    await loadUserData(user);
  }
  
  init();

  function setupUI(user) {
    document.getElementById("user-name").textContent = user.username;
    document.getElementById("user-email").textContent = user.email;
  
    const avatarEl = document.querySelector(".profile-pic");
    if (!avatarEl) return;
  
    avatarEl.src = getAvatarSrc(user);
  }
  
  function setupActions(user) {
    const logoutBtn = document.getElementById("logout-btn");
    const deleteBtn = document.getElementById("delete-account-btn");
  
    const confirmBox = document.getElementById("delete-confirmation");
    const input = document.getElementById("delete-confirm-input");
    const confirmDeleteBtn = document.getElementById("confirm-delete");
    const cancelDeleteBtn = document.getElementById("cancel-delete");
    const deleteError = document.getElementById("delete-error");
  
    const editBtn = document.getElementById("edit-profile-btn");
  
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.replace("edit-pfp.html");
      });
    }
  
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }
  
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        confirmBox.classList.add("show");
        deleteError.textContent = "";
        input.value = "";
        confirmDeleteBtn.disabled = true;
      });
  
      input.addEventListener("input", () => {
        confirmDeleteBtn.disabled = input.value !== "DELETE";
      });
  
      cancelDeleteBtn.addEventListener("click", () => {
        confirmBox.classList.remove("show");
      });
  
      confirmDeleteBtn.addEventListener("click", async () => {
        try {
          confirmDeleteBtn.disabled = true;
  
          await deleteUser();
          clearAuthState();
  
          window.location.replace("login.html");
        } catch (err) {
          console.error(err);
          deleteError.textContent = "Could not delete account. Try again.";
          confirmDeleteBtn.disabled = false;
        }
      });
    }
  }
  

  async function loadUserData(user) {
    await Promise.all([
      loadFavoriteRestaurant(user),
      loadUserLocation()
    ]);
  }  

  async function loadFavoriteRestaurant(user) {
    const favoriteText = document.getElementById("user-favorite");
    const favoriteCard = document.getElementById("favorite-restaurant-card");
  
    try {
      if (!user?.favouriteRestaurant) {
        favoriteText.textContent = "Not set";
        favoriteCard.innerHTML = "<h3>No favorite restaurant</h3>";
        return;
      }
  
      const cached = localStorage.getItem(FAVORITE_CACHE_KEY);
  
      if (cached) {
        const parsed = JSON.parse(cached);
        const isFresh = Date.now() - parsed.timestamp < FAVORITE_TTL;
  
        if (isFresh && parsed.restaurant?._id === user.favouriteRestaurant) {
          renderFavorite(parsed.restaurant);
          return;
        }
      }
  
      const restaurants = await getRestaurants();
  
      const favorite = restaurants.find(
        (r) => r._id === user.favouriteRestaurant
      );
  
      if (!favorite) {
        favoriteText.textContent = "Not set";
        favoriteCard.innerHTML = "<h3>No favorite restaurant</h3>";
        return;
      }
  
      renderFavorite(favorite);
  
      localStorage.setItem(
        FAVORITE_CACHE_KEY,
        JSON.stringify({
          restaurant: favorite,
          timestamp: Date.now()
        })
      );
  
    } catch (err) {
      console.error(err);
      favoriteText.textContent = "Error";
      favoriteCard.innerHTML = "<h3>Error loading data</h3>";
    }
  }

  
  async function loadUserLocation() {
    const locationEl = document.getElementById("user-location");
  
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
  
      if (cached) {
        const parsed = JSON.parse(cached);
        const isFresh = Date.now() - parsed.timestamp < LOCATION_TTL;
  
        if (isFresh && parsed.address) {
          locationEl.textContent = parsed.address;
          return;
        }
      }
  
      const position = await getPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
  
      const address = await getAddressSafe(lat, lng);
  
      locationEl.textContent = address || "Unknown location";
  
      localStorage.setItem(
        LOCATION_CACHE_KEY,
        JSON.stringify({
          lat,
          lng,
          address,
          timestamp: Date.now()
        })
      );
  
    } catch (err) {
      console.error(err);
      locationEl.textContent = "Location unavailable";
    }
  }

  function renderFavorite(favorite) {
    const favoriteCard = document.getElementById("favorite-restaurant-card");
    const favoriteText = document.getElementById("user-favorite");
  
    if (!favoriteCard || !favoriteText) return;
  
    favoriteText.textContent = favorite.name;
  
    favoriteCard.innerHTML = `
      <h3>${favorite.name}</h3>
      <p><strong>Company:</strong> ${favorite.company || "N/A"}</p>
      <p><strong>Phone:</strong> ${favorite.phone || "N/A"}</p>
      <p><strong>Address:</strong> ${favorite.address || "N/A"}</p>
    `;
  }
  