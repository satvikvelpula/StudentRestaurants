const MAX_TOASTS = 20;
const DEDUP_MS = 2000;

const toastDedup = new Map();

function getToastContainer() {
  let container = document.querySelector(".toast-container");

  if (container) return container;

  container = document.createElement("div");
  container.className = "toast-container";

  document.body.appendChild(container);

  return container;
}

function isDuplicate(message, type) {
  const key = `${type}:${message}`;
  const now = Date.now();

  if (toastDedup.has(key)) {
    const last = toastDedup.get(key);
    if (now - last < DEDUP_MS) return true;
  }

  toastDedup.set(key, now);
  return false;
}

function enforceMax(container) {
  while (container.children.length > MAX_TOASTS) {
    container.removeChild(container.firstChild);
  }
}

export function showToast(message, type = "success") {
  const container = getToastContainer();

  // prevent spam duplicates (network errors etc.)
  if (isDuplicate(message, type)) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  enforceMax(container);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, type === "error" ? 3500 : 2500);
}


/* ---------------- FIELD ERRORS (UNCHANGED, SAFE) ---------------- */

export function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;

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
