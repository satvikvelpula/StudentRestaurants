import { getRestaurants } from "../api/restaurants.js";
import { updateUser } from "../api/users.js";
import { getUser } from "../api/auth.js";
import { requireAuth } from "../utils/requireAuth.js";
import { uploadAvatar } from "../api/users.js";
import { checkUsernameAvailability } from "../api/users.js";
import { initNav } from "../components/nav.js";

import {
  showToast,
  showFieldError,
  clearFieldError,
  enableAutoErrorClear
} from "../utils/notifications.js";

import {
  validateUsername,
  validatePassword
} from "../utils/validators.js";

// --------------------
// AUTH + USER
// --------------------
initNav();
const user = await requireAuth();

// --------------------
// STATE
// --------------------
let allRestaurants = [];
let selectedRestaurantId = user?.favouriteRestaurant || null;

let usernameTimer;
let latestRequest = 0;
let isUsernameAvailable = true;

// --------------------
// PREFILL UI
// --------------------
document.getElementById("username").value = user.username || "";
document.getElementById("email").value = user.email || "";

const preview = document.getElementById("profile-preview");

if (user?.avatar && preview) {
  preview.src = `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
}

// --------------------
// RESTAURANTS
// --------------------
async function loadRestaurants() {
  try {
    const restaurants = await getRestaurants();
    restaurants.sort((a, b) => a.name.localeCompare(b.name));

    allRestaurants = restaurants;
    renderRestaurants(restaurants);
  } catch (err) {
    console.error("Failed to load restaurants", err);
  }
}

loadRestaurants();

const searchInput = document.getElementById("restaurant-search");

let searchTimer;

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();

      const filtered = allRestaurants.filter((r) =>
        r.name.toLowerCase().includes(query)
      );

      renderRestaurants(filtered, query);
    }, 150);
  });
}

function renderRestaurants(restaurants, searchQuery = "") {
  const container = document.getElementById("favorite-container");
  container.innerHTML = "";

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
      const isActive = slot.classList.contains("active");

      document.querySelectorAll(".restaurant-slot.favorite")
        .forEach(el => el.classList.remove("active"));

      if (isActive) {
        selectedRestaurantId = null;
      } else {
        slot.classList.add("active");
        selectedRestaurantId = restaurant._id;
      }
    });

    container.appendChild(slot);
  });
}

// --------------------
// LIVE USERNAME CHECK
// --------------------
const usernameInput = document.getElementById("username");

if (usernameInput) {
  const originalUsername = user.username;

  usernameInput.addEventListener("input", () => {
    clearTimeout(usernameTimer);

    const value = usernameInput.value.trim();

    if (value.length < 3) {
      isUsernameAvailable = true;
      clearFieldError("username");
      return;
    }

    if (value === originalUsername) {
      isUsernameAvailable = true;
      clearFieldError("username");
      return;
    }

    usernameTimer = setTimeout(async () => {
      const requestId = ++latestRequest;

      try {
        const res = await checkUsernameAvailability(value);

        if (requestId !== latestRequest) return;

        isUsernameAvailable = res.available;

        if (!res.available) {
          showFieldError("username", "Username is already taken");
        } else {
          clearFieldError("username");
        }
      } catch (err) {
        console.error("Username check failed", err);
      }
    }, 400);
  });
}

// --------------------
// AVATAR
// --------------------
const fileInput = document.getElementById("profilePic");
let selectedFile = null;

if (fileInput) {
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --------------------
// FORM
// --------------------
const form = document.querySelector(".auth-form");

if (form) {
  enableAutoErrorClear("auth-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    let hasError = false;

    // --------------------
    // VALIDATION
    // --------------------
    const usernameError = validateUsername(username);
    if (usernameError) {
      showFieldError("username", usernameError);
      hasError = true;
    }

    if (username !== user.username && isUsernameAvailable === false) {
      showFieldError("username", "Username is already taken");
      hasError = true;
    }

    if (password !== "") {
        // user typed something
      
        if (password.trim() === "") {
          showFieldError("password", "Password cannot be empty or spaces");
          hasError = true;
        } else {
          const passwordError = validatePassword(password);
          if (passwordError) {
            showFieldError("password", passwordError);
            hasError = true;
          }
        }
    }

    /*
    if (password.trim() !== "") {
      const passwordError = validatePassword(password);
      if (passwordError) {
        showFieldError("password", passwordError);
        hasError = true;
      }
    }
      */

    if (hasError) return;
    // --------------------
    // AVATAR
    // --------------------
    let avatarFilename = user.avatar;

    if (selectedFile) {
      const res = await uploadAvatar(selectedFile);
      avatarFilename = res.data.avatar;
    }

    console.log("Edit's password: ", password);

    // --------------------
    // PAYLOAD
    // --------------------
    const updatedUserData = {
      username,
      avatar: avatarFilename
    };

    if (selectedRestaurantId) {
        updatedUserData.favouriteRestaurant = selectedRestaurantId;
      } else {
        updatedUserData.favouriteRestaurant = "000000000000000000000000";
      }

    if (password.trim() !== "") {
        updatedUserData.password = password;
    }

      
    // --------------------
    // API CALL
    // --------------------
    try {
      await updateUser(updatedUserData);

      const updatedUser = {
        ...user,
        ...updatedUserData
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      showToast("Profile updated", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    } catch (err) {
        console.error("Update failed", err);
        const fallbackFields = ["username", "password"];

        fallbackFields.forEach((id) => {
            showFieldError(id, null);
        });

        showFieldError(fallbackFields.pop(), "Something went wrong. Try again. ")
      }
  });
}
