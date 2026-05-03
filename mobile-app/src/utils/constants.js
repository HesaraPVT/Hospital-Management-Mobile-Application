// Base URL is read from the EXPO_PUBLIC_API_URL environment variable (defined in .env).
// The .env file is gitignored — never hardcode the URL here.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://hospital-management-mobile-backend-1.onrender.com/api';