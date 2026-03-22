import { z } from "zod";

// ── Auth ──

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  username: z.string().min(1).max(50),
  password: z
    .string()
    .min(7)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z
    .string()
    .min(7)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
});

// ── Products ──

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  site_links: z.array(z.string().url()).optional(),
});

export const renameProductSchema = z.object({
  name: z.string().min(1).max(200),
});

export const changeDescriptionSchema = z.object({
  description: z.string(),
});

// ── Sites ──

export const createSiteSchema = z.object({
  "Site Link": z.string().url(),
  ProductId: z.number().int().positive(),
});

export const renameSiteSchema = z.object({
  "Site Link": z.string().url(),
});

// ── Notifications ──

export const linkNotificationSchema = z.object({
  ProductId: z.number().int().positive(),
});

export const updateNotificationSettingsSchema = z.object({
  Enable: z.boolean(),
});

// ── Discord ──

export const discordWebhookSchema = z.object({
  Webhook: z.string().url().startsWith("https://discord.com/api/webhooks/"),
});

// ── Email ──

export const emailSchema = z.object({
  Email: z.string().email(),
});

// ── Images ──

export const setImageForProductSchema = z.object({
  ImageId: z.number().int().positive(),
});

// ── Import ──

export const importProductSchema = z.object({
  import_link: z.string().url(),
});
