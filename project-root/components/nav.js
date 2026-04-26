import { getToken } from "../api/auth.js";

function renderNavHTML() {
    return `
      <nav id = "main-nav" class="nav">
        <div class="logo">🍽 Student Restaurants</div>
  
        <div class="hamburger" id="nav-toggle">☰</div>
  
        <div class="nav-links" id="nav-links">
          <a href="home.html">Home</a>
  
          <a href="dashboard.html" data-auth="required">Dashboard</a>
          <a href="edit-pfp.html" data-auth="required">Edit</a>
  
          <a href="login.html" data-auth="guest">Login</a>
          <a href="register.html" data-auth="guest">Register</a>
        </div>
      </nav>
    `;
  }
  
  export function initNav() {
    const mount = document.getElementById("nav-root");
    if (!mount) return;
  
    // 1. inject navbar
    mount.innerHTML = renderNavHTML();
  
    // 2. NOW elements exist → safe to query
    const nav = document.getElementById("main-nav");
    const isLoggedIn = !!getToken();
  
    const required = nav.querySelectorAll('[data-auth="required"]');
    const guest = nav.querySelectorAll('[data-auth="guest"]');
  
    if (isLoggedIn) {
      required.forEach(el => el.classList.remove("hidden"));
      guest.forEach(el => el.classList.add("hidden"));
    } else {
      required.forEach(el => el.classList.add("hidden"));
      guest.forEach(el => el.classList.remove("hidden"));
    }
  
    const toggle = document.getElementById("nav-toggle");
    const links = document.getElementById("nav-links");
  
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        links.classList.toggle("show");
      });
    }
  }
  
