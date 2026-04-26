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

    console.log("Logged in user:", response.data);

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
// CHECK LOGIN
// --------------------
export function isLoggedIn() {
  // return !!localStorage.getItem("token");
  return !!sessionStorage.getItem("token");
}

export async function requireAuth() {
    const token = getToken();
  
    if (!token) {
      window.location.replace("login.html");
      return false;
    }
  
    try {
      const res = await fetchCurrentUser();
      // fetch safe
      const user = res.data || res.user || res;
      if (!user) throw new Error("No user returned");
  
      // sync fresh user
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (err) {
      console.error("Auth check failed", err);
  
      sessionStorage.removeItem("token");
      localStorage.removeItem("user");
  
      window.location.replace = "login.html";
      return false;
    }
  }

export function redirectIfAuthenticated() {
    if (isLoggedIn()) {
    window.location.replace("dashboard.html");
    }
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
// GET TOKEN
// --------------------

export function getToken() {
    // return localStorage.getItem("token");
    return sessionStorage.getItem("token");
  }
  
