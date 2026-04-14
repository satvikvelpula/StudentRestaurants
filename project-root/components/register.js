import { register } from "../api/auth.js";
import {
    showToast,
    showFieldError,
    enableAutoErrorClear
  } from "../utils/notifications.js";

import {
validateUsername,
validatePassword
} from "../utils/validators.js";
  

const form = document.getElementById("register-form");

if (form) {
    enableAutoErrorClear("register-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirm = document.getElementById("confirm-password").value;

        let hasError = false;

        // Username validation
        const usernameError = validateUsername(username);
        if (usernameError) {
          showFieldError("username", usernameError);
          hasError = true;
        }
    
        // Password validation
        const passwordError = validatePassword(password);
        if (passwordError) {
          showFieldError("password", passwordError);
          hasError = true;
        }
    
        // Confirm password validation
        if (password !== confirm) {
          showFieldError("confirm-password", "Passwords do not match");
          hasError = true;
        }
    
        if (hasError) return;
      
        try {
          await register(username, email, password);
          showToast("Account registered", "success");
          window.location.href = "login.html";
        } catch (err) {
          showToast("Registration failed", "error");
          console.error(err);
        }
      });
}

