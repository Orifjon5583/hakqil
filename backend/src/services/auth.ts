import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  sub: string;
  username: string;
  role: "admin";
};

export function signAdminToken(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });
}

export function verifyAdminToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyAgentToken(token: string) {
  return jwt.verify(token, env.AGENT_JWT_SECRET) as { deviceId?: string; deviceCode?: string };
}
