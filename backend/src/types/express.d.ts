import type { JwtPayload } from "../services/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      agent?: { deviceId?: string; deviceCode?: string };
    }
  }
}
