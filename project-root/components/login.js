import { login } from "../api/auth.js";
import { redirectIfAuthenticated } from "../api/auth.js";

redirectIfAuthenticated();

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
          showToast("Invalid credentials", "error");
          console.error(err);
        }
      });
}
