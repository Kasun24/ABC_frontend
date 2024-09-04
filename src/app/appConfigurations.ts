const {
  VITE_APP_DEFAULT_AUTH,
  VITE_BASE_URL,
  VITE_APP_NAME,
  VITE_COMPANY,
  VITE_APP_MODE,
  VITE_DB_MODE,
  VITE_API_URL,
} = import.meta.env;

const appConfigs = {
  baseUrl: VITE_BASE_URL,
  apiUrl: VITE_API_URL,
  googleMapAPIKey: "AIzaSyAbvyBxmMbFhrzP9Z8moyYr6dCr-pzjhBE",
  appMode: VITE_APP_MODE,
  db: VITE_DB_MODE,
  appName: VITE_APP_NAME,
  company: VITE_COMPANY,
};

export default appConfigs;
