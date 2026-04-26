import { logout, getUser, clearAuthState } from "../api/auth.js";
import { initNav } from "../components/nav.js";
import { requireAuth } from "../utils/requireAuth.js";
import { getRestaurants } from "../api/restaurants.js";
import { deleteUser } from "../api/users.js";
import { getAddressSafe } from "../components/mapView.js"; 
import { getPosition } from "../utils/getLocation.js";

initNav();
const user = await requireAuth();
/*
await requireAuth();
const user = getUser();
if (!user) {
    window.location.replace("login.html");
  }  
    */


const LOCATION_CACHE_KEY = "user_location_cache";
const LOCATION_TTL = 1000 * 60 * 10; // 10 minutes
const FAVORITE_CACHE_KEY = "favorite_restaurant_cache";
const FAVORITE_TTL = 1000 * 60 * 10; // 10 minutes
  

const logoutBtn = document.getElementById("logout-btn");
const deleteBtn = document.getElementById("delete-account-btn");

const confirmBox = document.getElementById("delete-confirmation");
const input = document.getElementById("delete-confirm-input");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const deleteError = document.getElementById("delete-error");

const editBtn = document.getElementById("edit-profile-btn");
const avatarEl = document.querySelector(".profile-pic");
const favoriteCard = document.getElementById("favorite-restaurant-card");

if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.replace("edit-pfp.html");
    });
}

if (deleteBtn) {
    console.log(deleteBtn)
    deleteBtn.addEventListener("click", () => {
        confirmBox.classList.add("show");
        deleteError.textContent = "";
        input.value = "";
        confirmDeleteBtn.disabled = true;
      });
      
      // enable button only if user types DELETE
      input.addEventListener("input", () => {
        confirmDeleteBtn.disabled = input.value !== "DELETE";
      });
      
      // cancel
      cancelDeleteBtn.addEventListener("click", () => {
        confirmBox.classList.remove("show"); // works 
      });
      
      // confirm delete
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

// Populate UI
if (user) { 
  document.getElementById("user-name").textContent = user.username;
  document.getElementById("user-email").textContent = user.email;

  async function loadFavoriteRestaurant() {
    const favoriteText = document.getElementById("user-favorite");
  
    try {
      // --------------------
      // NO FAVORITE
      // --------------------
      if (!user?.favouriteRestaurant) {
        favoriteText.textContent = "Not set";
        favoriteCard.innerHTML = "<h3>No favorite restaurant</h3>";
        return;
      }
  
      // --------------------
      // CACHE CHECK
      // --------------------
      const cached = localStorage.getItem(FAVORITE_CACHE_KEY);
  
      if (cached) {
        const parsed = JSON.parse(cached);
  
        const isFresh = Date.now() - parsed.timestamp < FAVORITE_TTL;
  
        if (
          isFresh &&
          parsed.restaurant &&
          parsed.restaurant._id === user.favouriteRestaurant
        ) {
          renderFavorite(parsed.restaurant);
          return;
        }
      }
  
      // --------------------
      // FETCH + FIND
      // --------------------
      const restaurants = await getRestaurants();
  
      const favorite = restaurants.find(
        (r) => r._id === user.favouriteRestaurant
      );
  
      if (!favorite) {
        favoriteText.textContent = "Not set";
        favoriteCard.innerHTML = "<h3>No favorite restaurant</h3>";
        return;
      }
  
      // --------------------
      // RENDER
      // --------------------
      renderFavorite(favorite);
  
      // --------------------
      // CACHE SAVE
      // --------------------
      localStorage.setItem(
        FAVORITE_CACHE_KEY,
        JSON.stringify({
          restaurant: favorite,
          timestamp: Date.now()
        })
      );
  
    } catch (err) {
      console.error("Failed to load favorite restaurant", err);
  
      favoriteText.textContent = "Error";
      favoriteCard.innerHTML = "<h3>Error loading data</h3>";
    }
  }

  function renderFavorite(favorite) {
    const favoriteText = document.getElementById("user-favorite");
  
    favoriteText.textContent = favorite.name;
  
    favoriteCard.innerHTML = `
      <h3>${favorite.name}</h3>
      <p><strong>Company:</strong> ${favorite.company || "N/A"}</p>
      <p><strong>Phone:</strong> ${favorite.phone || "N/A"}</p>
      <p><strong>Address:</strong> ${favorite.address || "N/A"}</p>
      <p><strong>ID:</strong> ${favorite._id}</p>
    `;
  }

  await loadFavoriteRestaurant();

  async function loadUserLocation() {
    const locationEl = document.getElementById("user-location");
  
    try {
        
        const cached = localStorage.getItem(LOCATION_CACHE_KEY);

        if (cached) {
            const parsed = JSON.parse(cached);
      
            const isFresh = Date.now() - parsed.timestamp < LOCATION_TTL;
      
            if (isFresh && parsed.address) {
              locationEl.textContent = parsed.address;
              return; // skip API + geolocation
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
      console.error("Location error:", err);
      locationEl.textContent = "Location unavailable";
    }
  }
  
  await loadUserLocation();
  

  if (user.avatar) {
    avatarEl.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
  }
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
