import { requireAuth, logout, getUser } from "../api/auth.js";
import { getRestaurants } from "../api/restaurants.js";

requireAuth();

const user = getUser();
const logoutBtn = document.getElementById("logout-btn");
const avatarEl = document.querySelector(".profile-pic");
const favoriteCard = document.getElementById("favorite-restaurant-card");

// If somehow no user → redirect
if (!user) {
  window.location.href = "login.html";
}

// Populate UI
if (user) { 
  document.getElementById("user-name").textContent = user.username;
  document.getElementById("user-email").textContent = user.email;

  async function loadFavoriteRestaurant() {
    if (!user.favouriteRestaurant) {
      document.getElementById("user-favorite").textContent = "Not set";
      return;
    }
  
    try {
      const restaurants = await getRestaurants();
  
      const favorite = restaurants.find(
        (r) => r._id === user.favouriteRestaurant
      );
  
      document.getElementById("user-favorite").textContent =
        favorite?.name || "Not found";

    
        if (!favorite) {
            favoriteCard.innerHTML = "<h3>Not found</h3>";
            return;
        }

        favoriteCard.innerHTML = `
        <h3>${favorite.name}</h3>
        <p><strung>Company:</strung> ${favorite.company || "N/A"}</p>
        <p><strong>Phone:</strong> ${favorite.phone || "N/A"}</p>
        <p><strung>Address:</strung> ${favorite.address || "N/A"}</p>
        <p><strung>ID:</strung> ${favorite._id}</p>
      `;
    } catch (err) {
      console.error("Failed to load favorite restaurant", err);
      favoriteCard.innerHTML = "<h3>Error loading data</h3>";
    }
  }
  
  loadFavoriteRestaurant();

  document.getElementById("user-favorite").textContent =
    user.favouriteRestaurant || "Not set";

  if (user.avatar) {
    avatarEl.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
  }
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
