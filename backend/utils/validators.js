// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength (e.g., min 6 characters)
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

module.exports = {
  isValidEmail,
  isValidPassword
};