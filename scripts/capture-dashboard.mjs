import fs from "node:fs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevTools() {
  for (let i = 0; i < 30; i += 1) {
    try {
      await fetch("http://127.0.0.1:9222/json/version");
      return;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("Edge DevTools endpoint is not available");
}

function createCdpClient(webSocketDebuggerUrl) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;

    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(message.error);
    else request.resolve(message.result);
  };

  const opened = new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const message = { id: ++id, method, params };
      pending.set(message.id, { resolve, reject });
      ws.send(JSON.stringify(message));
    });
  }

  return { opened, send, close: () => ws.close() };
}

await waitForDevTools();

const response = await fetch("http://127.0.0.1:9222/json/new?http://localhost:5173/", {
  method: "PUT"
});
const tab = await response.json();
const cdp = createCdpClient(tab.webSocketDebuggerUrl);

await cdp.opened;
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false
});
await cdp.send("Page.navigate", { url: "http://localhost:5173/" });
await sleep(1200);
await cdp.send("Runtime.evaluate", {
  expression: 'localStorage.setItem("robbit_token", "preview-token")'
});
await cdp.send("Page.navigate", { url: "http://localhost:5173/" });
await sleep(2500);

const screenshot = await cdp.send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: true
});

fs.writeFileSync("dashboard-screenshot.png", Buffer.from(screenshot.data, "base64"));
cdp.close();

console.log("dashboard-screenshot.png");
