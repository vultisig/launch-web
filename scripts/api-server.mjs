import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";

const envPath = resolve(".env.local");
try {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  // Environment variables may already be provided by the parent process.
}

const { handleApi } = await import("../api/core.mjs");
const server = createServer(async (request, response) => {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 25_000) {
      response.writeHead(413, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Request is too large" }));
      return;
    }
  }
  const result = await handleApi({
    method: request.method,
    url: request.url,
    headers: request.headers,
    body,
  });
  response.writeHead(result.status, result.headers);
  response.end(JSON.stringify(result.body));
});

server.listen(3001, "127.0.0.1", () => {
  console.log("Feature board API: http://127.0.0.1:3001");
});

