import { login } from "../api/auth.js";
import { requireGuest } from "../utils/requireGuest.js";
import { initNav } from "../components/nav.js";

initNav();
requireGuest();

import {
    showToast,
    showFieldError,
    enableAutoErrorClear
} from "../utils/notifications.js";


const form = document.getElementById("login-form");
let isPasswordVisible = false;

const passwordInput = document.getElementById("Atomize");
const togglePasswordBtn = document.getElementById("toggle-password"); // New to HTML

// Toggle password visibility
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", () => {
    isPasswordVisible.valueOf() ? isPasswordVisible = !isPasswordVisible : isPasswordVisible = true;
      passwordInput.type = isPasswordVisible ? "text" : "password";
      togglePasswordBtn.textContent = isPasswordVisible
          ? "Hide"
          : "Show";
  });
}



if (form) {
    enableAutoErrorClear("login-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
      
        const username = document.getElementById("username").value;
        const password = passwordInput.value;

        let hasError = false;

        if (!username) {
            showFieldError("username", "Please enter your username");
            
            hasError = true;
        }

        if (!password) {
            showFieldError("Atomize", "Please enter your password");
            hasError = true;
          }
          
        if (hasError) return;
      
        try {
          await login(username, password);
          showToast("Login successful", "success");
          window.location.href = "home.html";
        } catch (err) {
            showFieldError("username", null)
            showFieldError("Atomize", "Invalid username or password");
          console.error(err);
        }
      });
}
