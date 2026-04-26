import { getRestaurants } from "../api/restaurants.js";
import { updateUser } from "../api/users.js";
import { getUser } from "../api/auth.js";
import { uploadAvatar } from "../api/users.js";
import {
    showToast,
    showFieldError,
    enableAutoErrorClear
  } from "../utils/notifications.js";
  
  import {
    validateUsername,
    validatePassword
  } from "../utils/validators.js";


let allRestaurants = [];

const user = getUser();

document.getElementById("username").value = user.username || "";
document.getElementById("email").value = user.email || "";

const preview = document.getElementById("profile-preview");

const emailInput = document.getElementById("email");

if (emailInput && user?.email) {
  emailInput.placeholder = user.email;
}
if (user?.avatar && preview) {
  preview.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
}
let selectedRestaurantId = user?.favouriteRestaurant || null;

async function loadRestaurants() {
  try {
    const restaurants = await getRestaurants();

    restaurants.sort((a, b) => a.name.localeCompare(b.name))

    allRestaurants = restaurants;
    console.log(allRestaurants);
    renderRestaurants(restaurants);

  } catch (err) {
    console.error("Failed to load restaurants", err);
  }
}

loadRestaurants();

function renderRestaurants(restaurants, searchQuery = "") {
    const container = document.getElementById("favorite-container");
  
    container.innerHTML = ""; // clear previous list


    if (!restaurants.length) {
        const empty = document.createElement("div");
        empty.className = "restaurant-slot empty";
    
        empty.textContent = `Restaurant "${searchQuery}" not found`;
    
        container.appendChild(empty);
        return;
      }
  
    restaurants.forEach((restaurant) => {
      const slot = document.createElement("div");
      slot.className = "restaurant-slot favorite";
      slot.textContent = restaurant.name;
  
      if (restaurant._id === selectedRestaurantId) {
        slot.classList.add("active");
      }
  
      slot.addEventListener("click", () => {
        document.querySelectorAll(".restaurant-slot.favorite").forEach(el => el.classList.remove("active"));
        slot.classList.add("active");
        selectedRestaurantId = restaurant._id;
      });
      container.appendChild(slot);
    });
}

function filterRestaurants(restaurants, searchQuery) {
    if (!searchQuery) return restaurants;
  
    return restaurants.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }  

const searchInput = document.getElementById("restaurant-search");

if (searchInput) {
    let debounceTimer;
  
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
  
      debounceTimer = setTimeout(() => {
        const value = e.target.value.trim();
  
        const filtered = filterRestaurants(allRestaurants, value);
  
        renderRestaurants(filtered, value);
      }, 200);
    });
  }

const form = document.querySelector(".auth-form");

if (form) {
    enableAutoErrorClear("auth-form"); // make sure form has this ID
  }

const fileInput = document.getElementById("profilePic");

let selectedFile = null;

if (fileInput) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];

    if (!file) return;

    selectedFile = file;

    // Preview image
    const reader = new FileReader();

    reader.onload = (e) => {
      preview.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/*

form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    try {

      let avatarFilename = user.avatar;
  
      if (selectedFile) {
        const res = await uploadAvatar(selectedFile);
        console.log(res);
        avatarFilename = res.data.avatar; // depends on API response
      } 
  

      const updatedUserData = {
        favouriteRestaurant: selectedRestaurantId || user.favoriteRestaurant,
        avatar: avatarFilename
      };
  
      await updateUser(updatedUserData);
  

      const updatedUser = {
        ...user,
        ...updatedUserData
      };
  
      localStorage.setItem("user", JSON.stringify(updatedUser));
  

      alert("Profile updated!");
      window.location.href = "dashboard.html";
  
    } catch (err) {
      console.error("Update failed", err);
      alert("Could not update profile");
    }
  });

*/


form.addEventListener("submit", async (e) => {
e.preventDefault();

enableAutoErrorClear("auth-form");

try {
    // --------------------
    // 1. USER INPUTS
    // --------------------
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let hasError = false;

    // --------------------
    // 2. VALIDATION
    // --------------------

    const usernameError = validateUsername(username);
    if (usernameError) {
      showFieldError("username", usernameError);
      hasError = true;
    }

    if (password.trim() !== "") {
        const passwordError = validatePassword(password);
        if (passwordError) {
          showFieldError("password", passwordError);
          hasError = true;
        }
      }

    if (hasError) return;
    /*

    if (username.length < 3) {
    alert("Username must be at least 3 characters");
    return;
    }

    

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    alert("Username can only contain letters, numbers, and underscores");
    return;
    }

    */

    // --------------------
    // 3. AVATAR UPLOAD (optional)
    // --------------------
    let avatarFilename = user.avatar;

    if (selectedFile) {
    const res = await uploadAvatar(selectedFile);
    console.log(res);
    avatarFilename = res.data.avatar; // backend filename
    }

    // --------------------
    // 4. BUILD UPDATE OBJECT
    // --------------------
    const updatedUserData = {
    username,
    favouriteRestaurant: selectedRestaurantId ?? user.favouriteRestaurant,
    avatar: avatarFilename,
    };

    // Only include password if user typed it
    if (password.trim() !== "") {
    updatedUserData.password = password;
    }

    // --------------------
    // 5. SEND TO API
    // --------------------
    await updateUser(updatedUserData);

    // --------------------
    // 6. SYNC LOCAL STATE
    // --------------------
    const updatedUser = {
    ...user,
    ...updatedUserData,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    // --------------------
    // 7. SUCCESS UX
    // --------------------
    showToast("Profile updated", "success");
    window.location.href = "dashboard.html";

} catch (err) {
    console.error("Update failed", err);
    showToast("Could not update profile", "error");
}
});
  
  