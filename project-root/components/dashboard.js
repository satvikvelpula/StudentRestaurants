import { requireAuth, logout, getUser, clearAuthState } from "../api/auth.js";
import { getRestaurants } from "../api/restaurants.js";
import { deleteUser } from "../api/users.js";
import { showToast } from "../utils/notifications.js";
  

await requireAuth();

const user = getUser();
if (!user) {
    window.location.replace("login.html");
  }  

const logoutBtn = document.getElementById("logout-btn");
const deleteBtn = document.getElementById("delete-account-btn");
const editBtn = document.getElementById("edit-profile-btn");
const avatarEl = document.querySelector(".profile-pic");
const favoriteCard = document.getElementById("favorite-restaurant-card");

if (editBtn) {
    editBtn.addEventListener("click", () => {
      window.location.replace("edit-pfp.html");
    });
}

if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const confirmDelete = confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      );
  
      if (!confirmDelete) return;
  
      try {
        await deleteUser();
  
        // clear local state
        clearAuthState();
  
        showToast("Account deleted", "success");

        setTimeout(() => {
            window.location.replace("login.html");
          }, 300);

  
      } catch (err) {
        console.error("Delete failed", err);
        showToast("Could not delete account", "error");
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
      // CASE 1: no favorite set
      if (!user?.favouriteRestaurant) {
        console.log(user.favoriteRestaurant)
        favoriteText.textContent = "Not set";
        favoriteCard.innerHTML = "<h3>No favorite restaurant</h3>";
        return;
      }
  
      const restaurants = await getRestaurants();
  
      const favorite = restaurants.find(
        (r) => r._id === user.favouriteRestaurant
      );
  
      if (!favorite) {
        favoriteText.textContent = "Not found";
        favoriteCard.innerHTML = "<h3>Not found</h3>";
        return;
      }
  
      favoriteText.textContent = favorite.name;
  
      favoriteCard.innerHTML = `
        <h3>${favorite.name}</h3>
        <p><strong>Company:</strong> ${favorite.company || "N/A"}</p>
        <p><strong>Phone:</strong> ${favorite.phone || "N/A"}</p>
        <p><strong>Address:</strong> ${favorite.address || "N/A"}</p>
        <p><strong>ID:</strong> ${favorite._id}</p>
      `;
  
    } catch (err) {
      console.error("Failed to load favorite restaurant", err);
  
      const favoriteText = document.getElementById("user-favorite");
      favoriteText.textContent = "Error";
  
      favoriteCard.innerHTML = "<h3>Error loading data</h3>";
    }
  }
  
  
  loadFavoriteRestaurant();

  if (user.avatar) {
    avatarEl.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
  }
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}
