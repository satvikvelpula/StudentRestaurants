

export function getInitials(user) {
    if (!user?.username) return "U";
  
    return user.username
      .trim()
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  
  export function createInitialsAvatar(user) {
    const initials = getInitials(user);
  
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text 
          x="50%" 
          y="50%" 
          font-size="72" 
          font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto"
          fill="#374151"
          text-anchor="middle"
          dominant-baseline="middle"
          font-weight="600">
          ${initials}
        </text>
      </svg>
    `)}`;
  }

  
  export function getAvatarSrc(user) {
    if (user?.avatar) {
      return `https://media2.edu.metropolia.fi/restaurant/uploads/${user.avatar}`;
    }
  
    return createInitialsAvatar(user);
  }  