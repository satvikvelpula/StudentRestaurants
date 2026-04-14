import { fetchData } from '../utils/fetchData.js';

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

  localStorage.clear();
  // Save token + user
  localStorage.setItem("token", response.token);
  localStorage.setItem("user", JSON.stringify(response.data));

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  
    // optional cleanup
    sessionStorage.clear();
  
    window.location.href = "login.html";
  }
  

// --------------------
// CHECK LOGIN
// --------------------
export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = "login.html";
    }
  }

/*

export function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      window.location.href = "home.html";
    }
  }  
  
  */

// --------------------
// GET USER
// --------------------
export function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

// --------------------
// GET TOKEN
// --------------------

export function getToken() {
    return localStorage.getItem("token");
  }
  
