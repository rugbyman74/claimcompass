import { supabase } from "@/lib/supabaseClient";

export async function getProStatus(): Promise<{ isPro: boolean; error?: string }> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) return { isPro: false, error: sessionError.message };

  const session = sessionData.session;
  if (!session) return { isPro: false, error: "Not logged in" };

  const { data, error } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) return { isPro: false, error: error.message };
  return { isPro: !!data?.is_pro };
}
