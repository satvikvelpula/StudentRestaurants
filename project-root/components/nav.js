import { getToken } from "../api/auth.js";

function renderNavHTML() {
    return `
      <nav id="main-nav" class="nav">
        
        <div class="nav-inner">
          
          <div class="nav-links" id="nav-links">
            <a href="home.html" class="nav-btn">Home</a>
  
            <a href="dashboard.html" class="nav-btn" data-auth="required">Profile</a>
            <a href="edit-pfp.html" class="nav-btn" data-auth="required">Edit</a>
  
            <a href="login.html" class="nav-btn" data-auth="guest">Login</a>
            <a href="register.html" class="nav-btn" data-auth="guest">Register</a>
          </div>
  
          <button id="nav-toggle" class="nav-toggle">
            ☰
          </button>
  
        </div>
  
      </nav>
    `;
  }

export function initNav() {
    const mount = document.getElementById("nav-root");
    if (!mount) return;
  
    mount.innerHTML = renderNavHTML();
  
    const nav = document.getElementById("main-nav");
    if (!nav) return;
  
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
  
    toggle?.addEventListener("click", () => {
      links.classList.toggle("show");
    });
  
    links?.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        links.classList.remove("show");
      });
    });
  
    const current = window.location.pathname;
  
    nav.querySelectorAll(".nav-btn").forEach(link => {
      if (current.includes(link.getAttribute("href"))) {
        link.classList.add("active");
      }
    });
  }
  