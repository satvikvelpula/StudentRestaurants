export function showToast(message, type = "success") {
    const toast = document.createElement("div");
  
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
  
    document.body.appendChild(toast);
  
    // trigger animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });
  
    // auto remove
    setTimeout(() => {
      toast.classList.remove("show");
  
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }
  

export function showFieldError(inputId, message) {
const input = document.getElementById(inputId);

if (!input) return;

// Remove old error
clearFieldError(inputId);

const error = document.createElement("div");
error.className = "input-error";
error.textContent = message;

input.classList.add("input-invalid");

input.parentElement.appendChild(error);
}

export function clearFieldError(inputId) {
const input = document.getElementById(inputId);

if (!input) return;

input.classList.remove("input-invalid");

const existing = input.parentElement.querySelector(".input-error");
if (existing) existing.remove();
}

export function enableAutoErrorClear(formId) {
    document.querySelectorAll(`#${formId} input`).forEach(input => {
      input.addEventListener("input", () => {
        clearFieldError(input.id);
      });
    });
  }
