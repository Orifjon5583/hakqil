import type { NextFunction, Request, Response } from "express";
import { verifyAdminToken, verifyAgentToken } from "../services/auth.js";

function bearer(req: Request) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    req.user = verifyAdminToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAgent(req: Request, res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) return res.status(401).json({ error: "Missing agent token" });

  try {
    req.agent = verifyAgentToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid agent token" });
  }
}

