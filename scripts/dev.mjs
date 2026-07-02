import { spawn } from "node:child_process";
import { resolve } from "node:path";

const processes = [
  spawn(process.execPath, [resolve("scripts/api-server.mjs")], { stdio: "inherit" }),
  spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"), "--host"], { stdio: "inherit" }),
];

const stop = () => {
  processes.forEach((child) => child.kill());
  process.exit();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
processes.forEach((child) => child.on("exit", (code) => {
  if (code && code !== 0) stop();
}));

