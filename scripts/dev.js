const { spawn } = require("child_process");

const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

const processes = [
  {
    name: "ws",
    command: process.execPath,
    args: ["server.js"],
  },
  {
    name: "react",
    command: npmCommand,
    args: ["start"],
  },
];

const children = new Set();
let shuttingDown = false;

function stopAll(signal = "SIGTERM") {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const proc of processes) {
  const child = spawn(proc.command, proc.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  children.add(child);

  child.on("exit", (code, signal) => {
    children.delete(child);

    if (!shuttingDown && code !== 0) {
      console.error(
        `[${proc.name}] exited with ${signal || `code ${code}`}; stopping dev session.`
      );
      stopAll();
      process.exitCode = code || 1;
    }
  });
}

process.on("SIGINT", () => stopAll("SIGINT"));
process.on("SIGTERM", () => stopAll("SIGTERM"));
