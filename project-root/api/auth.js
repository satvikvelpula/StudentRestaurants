import { fetchData } from '../utils/fetchData.js';
import { fetchCurrentUser } from "./users.js";

// --------------------
// LOGIN
// --------------------
export async function login(username, password) {
  const response = await fetchData("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      username, // API uses username field
      password,
    }),
  });

    // clear old state safely
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

      // set new state
    sessionStorage.setItem("token", response.token);
    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

  return response;
}

// --------------------
// REGISTER
// --------------------
export async function register(username, email, password) {
  const response = await fetchData("/users", {
    method: "POST",
    body: JSON.stringify({
        /*
      username: email,
      password: password,
      email: email,
      */
     username,
     password,
     email
    }),
  });

  return response;
}

// --------------------
// LOGOUT
// --------------------
export function logout() {
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.replace("login.html");
  }
  
export function clearAuthState() {
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
}

// --------------------
// GET TOKEN
// --------------------

export function getToken() {
    // return localStorage.getItem("token");
    return sessionStorage.getItem("token");
  }



// --------------------
// GET USER
// --------------------
export function getUser() {
    try {
      const data = localStorage.getItem("user");
  
      if (!data || data === "undefined") return null;
  
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to parse user:", err);
      return null;
    }
  }

// --------------------
// CHECK LOGIN
// --------------------
export function isLoggedIn() {
  // return !!localStorage.getItem("token");
  return !!sessionStorage.getItem("token");
}

  
