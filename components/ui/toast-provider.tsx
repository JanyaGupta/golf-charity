"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1e293b",
          color: "#f8fafc",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          fontSize: "14px",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#020617" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#020617" },
        },
      }}
    />
  );
}
