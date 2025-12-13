"use client";

import { useEffect, useRef } from "react";

export default function BuildCheckClient() {
  const checkedRef = useRef(false);
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    const clientBuild =
      typeof process !== "undefined" ? process.env.NEXT_PUBLIC_BUILD_ID : null;
    if (!clientBuild) return;
    const check = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const serverBuild = data?.buildId || null;
        if (serverBuild && serverBuild !== clientBuild) {
          console.warn(
            "Build id mismatch detected. Reloading to pick new app version.",
            { clientBuild, serverBuild }
          );
          // Force a hard reload
          try {
            // unregister service workers if present to avoid cached assets
            if ("serviceWorker" in navigator) {
              const registrations =
                await navigator.serviceWorker.getRegistrations();
              for (const r of registrations) {
                try {
                  await r.unregister();
                } catch (e) {
                  /* ignore */
                }
              }
            }
          } catch (e) {
            // ignore
          }
          window.location.reload(true);
        }
      } catch (e) {
        // ignore
      }
    };
    // Do one immediate check then poll every 30s for a short period
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);
  return null;
}
