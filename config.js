// config.js
const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://aiquickdoc-3f1m.onrender.com";
  }
  return "http://localhost:5000";
};

export const BACKEND_URL = getBackendUrl();
