import { register } from "../api/auth.js";
import { checkUsernameAvailability } from "../api/users.js";
import { redirectIfAuthenticated } from "../api/auth.js";

redirectIfAuthenticated();

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

let usernameTimer;
let latestUsernameRequest = 0;

const usernameInput = document.getElementById("username");


// --------------------
// LIVE USERNAME CHECK 
// --------------------
if (usernameInput) {
  usernameInput.addEventListener("input", () => {
    clearTimeout(usernameTimer);

    const value = usernameInput.value.trim();

    if (value.length < 3) {
      clearFieldError("username");
      return;
    }

    usernameTimer = setTimeout(async () => {
      const requestId = ++latestUsernameRequest;

      try {
        const res = await checkUsernameAvailability(value);

        // ignore stale responses
        if (requestId !== latestUsernameRequest) return;

        if (res.available) {
          clearFieldError("username");
        } else {
          showFieldError("username", "Username is already taken");
        }
      } catch (err) {
        console.error("Username check failed", err);
      }
    }, 400);
  });
}


// --------------------
// FORM SUBMIT
// --------------------
const form = document.getElementById("register-form");

if (form) {
  enableAutoErrorClear("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;

    let hasError = false;

    // --------------------
    // CLIENT VALIDATION
    // --------------------
    const usernameError = validateUsername(username);
    if (usernameError) {
      showFieldError("username", usernameError);
      hasError = true;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      showFieldError("password", passwordError);
      hasError = true;
    }

    if (password !== confirm) {
      showFieldError("confirm-password", "Passwords do not match");
      hasError = true;
    }

    if (hasError) return;


    // --------------------
    // SERVER VALIDATION (authoritative check)
    // --------------------
    try {
      const res = await checkUsernameAvailability(username);

      if (!res.available) {
        showFieldError("username", "Username is already taken");
        return;
      }
    } catch (err) {
      console.error("Username check failed", err);
      showToast("Could not validate username. Try again.", "error");
      return;
    }


    // --------------------
    // REGISTER USER
    // --------------------
    try {
      await register(username, email, password);

      showToast("Account registered", "success");
      window.location.href = "login.html";

    } catch (err) {
      console.error("Registration failed", err);
      showToast("Registration failed", "error");
    }
  });
}
