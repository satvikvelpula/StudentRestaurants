// Username validation
export function validateUsername(username) {
    if (!username || username.trim().length < 3) {
      return "Must be at least 3 characters";
    }
  
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Only letters, numbers, _ allowed";
    }
  
    return null;
  }
  
  // Password validation
  export function validatePassword(password) {
    if (!password || password.length < 6) {
      return "Password must be at least 6 characters";
    }
  
    if (!/[A-Za-z]/.test(password)) {
      return "Password must contain a letter";
    }
  
    if (!/[0-9]/.test(password)) {
      return "Password must contain a number";
    }
  
    return null;
  }

  export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!email) return "Email is required";
    if (!regex.test(email)) return "Invalid email format";
  
    return null;
  }
  
  