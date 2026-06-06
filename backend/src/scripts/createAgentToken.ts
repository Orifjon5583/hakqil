import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const deviceCode = process.argv[2] ?? "academy-agent";

const token = jwt.sign({ deviceCode }, env.AGENT_JWT_SECRET, { expiresIn: "365d" });

console.log(token);
