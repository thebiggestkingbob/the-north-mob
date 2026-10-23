import { bookingEmail } from "@/config/content";
import type { Enquiry } from "@/lib/contact";

const origin = "https://api.brevo.com/v3";
const listName = "THE NORTH MOB — Website";
let pendingList: Promise<number> | undefined;
export function brevoConfigured() { return !!process.env.BREVO_API_KEY?.trim(); }
async function request(path: string, method = "GET", data?: unknown) {
  const key = process.env.BREVO_API_KEY?.trim();
  if (!key) throw new Error("Brevo is not configured");
  return fetch(`${origin}${path}`, { method, redirect: "error", cache: "no-store", headers: { "api-key": key, Accept: "application/json", ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}), signal: AbortSignal.timeout(10000) });
}
export async function checkBrevoConnection() {
  const response = await request("/account");
  return response.ok;
}
async function findOrCreateList(): Promise<number> {
  const configured = process.env.BREVO_LIST_ID;
  if (configured) {
    const id = Number(configured);
    if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid list configuration");
    return id;
  }
  // Resolve a dedicated list without using unrelated existing subscriber lists.
  for (let offset = 0; offset < 1000; offset += 50) {
    const response = await request(`/contacts/lists?limit=50&offset=${offset}`);
    if (!response.ok) throw new Error("List lookup failed");
    const data = await response.json();
    if (!Array.isArray(data.lists)) throw new Error("Invalid list response");
    const found = data.lists.find((list: { name?: string; id?: number }) => list.name === listName && Number.isSafeInteger(list.id) && list.id! > 0);
    if (found) return found.id;
    if (data.lists.length < 50) {
      // Folder 1 was verified through the connected Brevo account.
      const created = await request("/contacts/lists", "POST", { name: listName, folderId: 1 });
      if (!created.ok) throw new Error("List creation failed");
      const list = await created.json();
      if (!Number.isSafeInteger(list.id) || list.id <= 0) throw new Error("Invalid created list");
      return list.id;
    }
  }
  throw new Error("Set BREVO_LIST_ID for this account");
}
function subscriberList() {
  if (!pendingList) pendingList = findOrCreateList().catch(error => { pendingList = undefined; throw error; });
  return pendingList;
}
export async function subscribeWithBrevo(email: string) {
  const contact = await request(`/contacts/${encodeURIComponent(email)}`);
  if (contact.ok) {
    const existing = await contact.json();
    // Never clear suppression/unsubscribe flags or disclose an address's status.
    if (existing.emailBlacklisted === true) return;
  } else if (contact.status !== 404) throw new Error("Contact lookup failed");
  const listId = await subscriberList();
  const response = await request("/contacts", "POST", { email, listIds: [listId], updateEnabled: true });
  if (response.status !== 201 && response.status !== 204) throw new Error("Subscription not confirmed");
}
export async function sendBrevoEnquiry(enquiry: Omit<Enquiry, "website">) {
  const response = await request("/smtp/email", "POST", {
    sender: { name: "THE NORTH MOB", email: bookingEmail },
    to: [{ email: bookingEmail }], replyTo: { email: enquiry.email, name: enquiry.name },
    subject: `THE NORTH MOB — ${enquiry.type}`,
    textContent: `Name: ${enquiry.name}\nEmail: ${enquiry.email}\nEnquiry: ${enquiry.type}\n${[enquiry.eventDate && `Date: ${enquiry.eventDate}`, enquiry.location && `Location: ${enquiry.location}`, enquiry.budget && `Budget: ${enquiry.budget}`, enquiry.organisation && `Organisation: ${enquiry.organisation}`].filter(Boolean).join("\n")}\n\n${enquiry.message}`,
  });
  if (!response.ok) throw new Error("Enquiry not accepted");
  const receipt = await response.json();
  if (typeof receipt.messageId !== "string" || !receipt.messageId) throw new Error("Enquiry not acknowledged");
}
