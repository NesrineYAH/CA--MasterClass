// frontend/src/services/authService.js

const API_URL = "http://localhost:5000/data/users";

// Gestion du token
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

// Fonction utilitaire pour les requêtes
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Erreur serveur",
    }));
    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
  }

  return await response.json();
}

// Inscription
export async function registerUser(data) {
  const result = await fetchAPI("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (result.token) {
    setToken(result.token);
  }

  return result;
}

// Connexion
export async function loginUser({ email, password }) {
  const result = await fetchAPI("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (result.token) {
    setToken(result.token);
  }

  return result;
}

// Déconnexion
export function logoutUser() {
  removeToken();
}

// Profil utilisateur
export async function getUserProfile() {
  const token = getToken();
  if (!token) throw new Error("Authentification requise");

  return await fetchAPI("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Vérification authentification
export function isAuthenticated() {
  return !!getToken();
}
