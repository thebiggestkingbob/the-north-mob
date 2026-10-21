import { z } from "zod";
export const enquiryTypes = ["Bookings", "Press", "Partnerships", "Other"] as const;
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.email("Enter a valid email address.").max(254),
  type: z.enum(enquiryTypes, { error: "Choose an enquiry type." }),
  message: z.string().trim().min(10, "Please include at least 10 characters.").max(5000),
  consent: z.literal(true, { error: "Please consent to the use of your details for this enquiry." }),
  website: z.string().max(0, "Unable to accept this enquiry.").optional().default(""),
});
export type Enquiry = z.infer<typeof enquirySchema>;
