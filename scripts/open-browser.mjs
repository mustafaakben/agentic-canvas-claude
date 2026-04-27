import { spawn } from "node:child_process";

function isWsl() {
  return !!process.env.WSL_DISTRO_NAME || /microsoft/i.test(process.env.OS || "");
}

function spawnDetached(command, args) {
  const child = spawn(command, args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
}

export function openBrowser(url, options = {}) {
  if (options.noOpen || process.env.CANVAS_NO_OPEN === "1") return false;
  try {
    if (process.platform === "win32") {
      spawnDetached("cmd", ["/c", "start", "", url]);
      return true;
    }
    if (isWsl()) {
      spawnDetached("powershell.exe", ["-NoProfile", "-Command", "Start-Process", url]);
      return true;
    }
    if (process.platform === "darwin") {
      spawnDetached("open", [url]);
      return true;
    }
    spawnDetached("xdg-open", [url]);
    return true;
  } catch {
    return false;
  }
}
