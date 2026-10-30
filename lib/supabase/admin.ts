import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Cliente com service_role. Só no servidor. Ignora RLS: use apenas em rotas já autorizadas. */
export function createAdminClient() {
  if (!env.supabaseUrl || !env.supabaseService) {
    throw new Error("Falta configuração: SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(env.supabaseUrl, env.supabaseService, { auth: { persistSession: false, autoRefreshToken: false } });
}
