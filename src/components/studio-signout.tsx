"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function StudioSignout() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return <div><button className="text-link studio-signout" disabled={busy} onClick={async () => {
    setBusy(true); setMessage("");
    try { const response = await fetch("/api/studio/session", { method: "DELETE" }); if (!response.ok) throw new Error(); router.replace("/studio/login"); router.refresh(); }
    catch { setMessage("Could not sign out. Please retry."); } finally { setBusy(false); }
  }}>{busy ? "Signing out…" : "Sign out"}</button><p role="status" className="source-note">{message}</p></div>;
}
