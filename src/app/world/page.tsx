import { redirect } from "next/navigation";
export default function WorldPage() {
  // Vercel's preview protection disallows iframe embedding, even on this site.
  // Serve the interactive engine as a top-level document instead.
  redirect("/world-engine/index.html");
}
