import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const deviceId = process.argv[2] ?? "academy-agent";

const token = jwt.sign({ deviceId }, env.AGENT_JWT_SECRET, { expiresIn: "365d" });

console.log(token);
