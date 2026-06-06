import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const codes = process.argv.slice(2);

if (codes.length === 0) {
  console.error("Usage: npm run create-agent-tokens -- HP-01 HP-02 LEN-08");
  process.exit(1);
}

for (const deviceCode of codes) {
  const token = jwt.sign({ deviceCode }, env.AGENT_JWT_SECRET, { expiresIn: "365d" });
  console.log(`${deviceCode},${token}`);
}
