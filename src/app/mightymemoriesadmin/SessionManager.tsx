"use client";

import { useEffect } from "react";

export function SessionManager() {
  useEffect(() => {
    const handleUnload = () => {
      // Clear the adminAuth cookie when the user refreshes or closes the tab.
      // Next.js client-side navigation (<Link>) does NOT trigger beforeunload.
      document.cookie = "adminAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return null;
}
