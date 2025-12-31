import { useEffect, useState } from "react";

function detectOS(ua) {
  if (/windows nt/i.test(ua)) return "Windows";
  if (/mac os x/i.test(ua) || /macintosh/i.test(ua)) return "macOS";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(ua) {
  if (/edg\//i.test(ua)) return "Edge";
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Other";
}

function detectDeviceType(ua, uaData) {
  if (uaData && typeof uaData.mobile === "boolean") {
    return uaData.mobile ? "Mobile" : "Desktop";
  }
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobi|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

function detectMakeModel(ua, uaData, os) {
  if (uaData?.model) {
    return { make: uaData.brands?.[0]?.brand || "Unknown", model: uaData.model };
  }

  if (/iphone/i.test(ua)) return { make: "Apple", model: "iPhone" };
  if (/ipad/i.test(ua)) return { make: "Apple", model: "iPad" };
  if (/macintosh|mac os x/i.test(ua)) return { make: "Apple", model: "Mac" };

  if (/android/i.test(ua)) {
    const modelMatch = ua.match(/; ([^;]*?) Build/i);
    const model = modelMatch ? modelMatch[1].trim() : "Android device";
    const make = model.split(" ")[0] || "Android";
    return { make, model };
  }

  if (/windows/i.test(ua)) return { make: "PC", model: "Windows PC" };
  if (/linux/i.test(ua)) return { make: "Linux", model: "Linux device" };

  return { make: "Unknown", model: os };
}

function buildDeviceInfo() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaData = typeof navigator !== "undefined" ? navigator.userAgentData : null;
  const os = detectOS(ua);
  const browser = detectBrowser(ua);
  const deviceType = detectDeviceType(ua, uaData);
  const { make, model } = detectMakeModel(ua, uaData, os);

  const resolution =
    typeof window !== "undefined"
      ? `${window.screen?.width || window.innerWidth} x ${window.screen?.height || window.innerHeight}`
      : "Unknown";

  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || null : null;
  const memory = typeof navigator !== "undefined" ? navigator.deviceMemory || null : null;

  return {
    deviceType,
    os,
    browser,
    make,
    model,
    resolution,
    cores,
    memory,
    userAgent: ua,
  };
}

function useDeviceInfo() {
  const [info, setInfo] = useState({});

  useEffect(() => {
    setInfo(buildDeviceInfo());
  }, []);

  return info;
}

export default useDeviceInfo;
