import { getRestaurants } from "../api/restaurants.js";
import { updateUser, uploadAvatar, checkUsernameAvailability } from "../api/users.js";
import { initNav } from "../components/nav.js";
import { loadAuthUser } from "../utils/authLoader.js";
import { getAvatarSrc } from "../utils/avatar.js";


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
// INIT
// --------------------
init();

async function init() {
  initNav();

  const user = await loadAuthUser();
  if (!user) return;

  setupState(user);
  setupUI(user);
  setupAvatarRemoval(user);
  setupEvents(user);

  await loadRestaurants();
}

// --------------------
// STATE
// --------------------
let allRestaurants = [];
let selectedRestaurantId = null;
let removeAvatar = false;

let usernameTimer;
let latestRequest = 0;
let isUsernameAvailable = true;


let selectedFile = null;

function setupState(user) {
  selectedRestaurantId = user?.favouriteRestaurant || null;
}

// --------------------
// UI
// --------------------
function setupUI(user) {
  document.getElementById("username").value = user.username || "";
  document.getElementById("email").value = user.email || "";

  renderAvatar(user);
}

function setupAvatarRemoval(user) {
    const btn = document.getElementById("remove-avatar-btn");
    const preview = document.getElementById("profile-preview");
  
    if (!btn || !preview) return;
  
    btn.addEventListener("click", () => {
      // clear selected file
      selectedFile = null;
  
      // mark for removal
      removeAvatar = true;
  
      // update preview to initials avatar
      preview.src = getAvatarSrc({ ...user, avatar: null });
  
      showToast("Profile picture removed (not saved yet)", "success");
    });
  }

function renderAvatar(user) {
    const preview = document.getElementById("profile-preview");
    if (!preview) return;
  
    preview.src = getAvatarSrc(user);
  }

// --------------------
// EVENTS
// --------------------
function setupEvents(user) {
  setupUsernameValidation(user);
  setupAvatarUpload();
  setupFormSubmit(user);
  setupSearch();
}

// --------------------
// RESTAURANTS
// --------------------
function renderRestaurantState(type, message = "") {
  const container = document.getElementById("favorite-container");
  container.innerHTML = "";

  const el = document.createElement("div");
  el.className = "restaurant-slot empty-state";

  if (type === "loading") el.textContent = "Loading restaurants...";
  if (type === "error") {
    el.textContent = message || "Failed to load restaurants.";
    el.classList.add("error");
  }

  container.appendChild(el);
}

async function loadRestaurants() {
  renderRestaurantState("loading");

  try {
    const restaurants = await getRestaurants();

    if (!restaurants?.length) {
      renderRestaurantState("error", "No restaurants found.");
      return;
    }

    restaurants.sort((a, b) => a.name.localeCompare(b.name));

    allRestaurants = restaurants;
    renderRestaurants(restaurants);

  } catch (err) {
    console.error(err);

    renderRestaurantState(
      "error",
      "Could not load restaurants. Check connection/VPN."
    );

    showToast("Restaurant data failed to load", "error");
  }
}

function renderRestaurants(restaurants, query = "") {
  const container = document.getElementById("favorite-container");
  container.innerHTML = "";

  if (!restaurants.length) {
    const empty = document.createElement("div");
    empty.className = "restaurant-slot empty";
    empty.textContent = `Restaurant "${query}" not found`;
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
// SEARCH
// --------------------
function setupSearch() {
  const searchInput = document.getElementById("restaurant-search");
  let searchTimer;

  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
      const query = e.target.value.toLowerCase().trim();

      const filtered = allRestaurants.filter(r =>
        r.name.toLowerCase().includes(query)
      );

      renderRestaurants(filtered, query);
    }, 150);
  });
}

// --------------------
// USERNAME VALIDATION
// --------------------
function setupUsernameValidation(user) {
  const input = document.getElementById("username");
  if (!input) return;

  const originalUsername = user.username;

  input.addEventListener("input", () => {
    clearTimeout(usernameTimer);

    const value = input.value.trim();

    if (value.length < 3 || value === originalUsername) {
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
        console.error(err);
      }
    }, 400);
  });
}

// --------------------
// AVATAR
// --------------------
function setupAvatarUpload() {
  const fileInput = document.getElementById("profilePic");
  const preview = document.getElementById("profile-preview");

  if (!fileInput) return;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    selectedFile = file;
    removeAvatar = false;

    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target?.result
      };
    reader.readAsDataURL(file);
  });
}

// --------------------
// FORM SUBMIT
// --------------------
function setupFormSubmit(user) {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  enableAutoErrorClear("auth-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    let hasError = false;

    // validation
    const usernameError = validateUsername(username);
    if (usernameError) {
      showFieldError("username", usernameError);
      hasError = true;
    }

    if (username !== user.username && !isUsernameAvailable) {
      showFieldError("username", "Username is already taken");
      hasError = true;
    }

    if (password !== "") {
      if (password.trim() === "") {
        showFieldError("password", "Password cannot be empty");
        hasError = true;
      } else {
        const err = validatePassword(password);
        if (err) {
          showFieldError("password", err);
          hasError = true;
        }
      }
    }

    if (hasError) return;

    // avatar upload
    let avatarFilename = user.avatar;

    try {
        if (selectedFile) {
          const res = await uploadAvatar(selectedFile);
          avatarFilename = res.data.avatar;
        } else if (removeAvatar) {
          avatarFilename = "";
        }
      } catch (err) {
        showToast("Avatar upload failed", "error");
        return;
      }

    // payload
    const payload = {
      username,
      avatar: avatarFilename,
      favouriteRestaurant: selectedRestaurantId || "000000000000000000000000"
    };

    if (password.trim()) {
      payload.password = password;
    }

    // API call
    try {
      await updateUser(payload);

      const updatedUser = { ...user, ...payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showToast("Profile updated", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    } catch (err) {
      console.error(err);
      showToast("Update failed", "error");
    }
  });
}
