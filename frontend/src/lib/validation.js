// Usernames become part of profile URLs, so they're limited to URL-friendly characters.
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
export const USERNAME_HINT = "Usernames need 3 to 20 letters, numbers or underscores.";
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
