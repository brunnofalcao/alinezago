export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactTo: process.env.CONTACT_TO_EMAIL ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseService: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  resendKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  waPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  waToken: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
  waVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  metaAppSecret: process.env.META_APP_SECRET ?? "",
  waVersion: process.env.WHATSAPP_API_VERSION ?? "v21.0",
  waTplLembrete: process.env.WHATSAPP_TEMPLATE_LEMBRETE ?? "lembrete_aula",
  waTplBoasVindas: process.env.WHATSAPP_TEMPLATE_BOAS_VINDAS ?? "boas_vindas_comunidade",
  cronSecret: process.env.CRON_SECRET ?? "",
};

export const integrations = {
  supabase: () => Boolean(env.supabaseUrl && env.supabaseAnon),
  supabaseAdmin: () => Boolean(env.supabaseUrl && env.supabaseService),
  resend: () => Boolean(env.resendKey && env.emailFrom),
  whatsapp: () => Boolean(env.waPhoneId && env.waToken),
  whatsappWebhook: () => Boolean(env.waVerifyToken && env.metaAppSecret),
  cron: () => Boolean(env.cronSecret),
  contact: () => Boolean(env.contactTo),
};
