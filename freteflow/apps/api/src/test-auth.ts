import { createAccessToken } from "./config/auth.js";

process.env.JWT_SECRET ??= "test-secret-with-at-least-32-characters-long";

export function authHeader(profile = "admin") {
  return `Bearer ${createAccessToken({ id: 1, perfil: profile })}`;
}
