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

if (form) {
    enableAutoErrorClear("login-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
      
        const username = document.getElementById("username").value;
        const password = document.getElementById("Atomize").value;

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
