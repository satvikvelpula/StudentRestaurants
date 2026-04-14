import { login } from "../api/auth.js";

import {
  showToast,
  showFieldError,
  enableAutoErrorClear
} from "../utils/notifications.js";



/*redirectIfLoggedIn();*/

const form = document.getElementById("login-form");

if (form) {
    enableAutoErrorClear("login-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
      
        // const email = document.getElementById("email").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("Atomize").value;

        let hasError = false;

        if (!username) {
            showFieldError("username", "Please enter your username");
            hasError = true;
        }

        if (!password) {
            showFieldError("password", "Please enter your password");
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
