import { spawn } from "node:child_process";
import { resolve } from "node:path";

const processes = [
  spawn(process.execPath, [resolve("scripts/api-server.mjs")], { stdio: "inherit" }),
  spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"), "--host"], { stdio: "inherit" }),
];

let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  processes.forEach((child) => child.kill());
  process.exit();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
processes.forEach((child) => {
  child.on("error", (error) => {
    console.error(error);
    stop();
  });
  child.on("exit", (code, signal) => {
    if (signal || (code !== null && code !== 0)) stop();
  });
});
