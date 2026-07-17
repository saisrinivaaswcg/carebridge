import { API_BASE_URL } from "../config";
// Previous design was:
// const API_BASE_URL = "http://192.168.1.15:3000/api/v1";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      "Request failed"
    );
  }

  return data;
}

// ---------------- AUTH ----------------

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function requestOTP(phone_number) {
  return request("/auth/senior/otp/request", {
    method: "POST",
    body: JSON.stringify({
      phone_number,
    }),
  });
}

export function verifyOTP(phone_number, code) {
  return request("/auth/senior/otp/verify", {
    method: "POST",
    body: JSON.stringify({
      phone_number,
      code,
    }),
  });
}

// ---------------- MESSAGES ----------------

export function getMessages(seniorId, token) {
  return request(`/seniors/${seniorId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function sendMessage(seniorId, token, message) {
  return request(`/seniors/${seniorId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });
}

export default API_BASE_URL;