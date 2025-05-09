
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User as AppUser } from "./types";

// Transform Supabase user to app user
export const transformUser = (
  dbUser: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at?: string;
    last_login?: string;
    is_banned?: boolean;
    active_plan?: string | null;
    plan_expiry_date?: string | null;
    credits?: number;
    email_verified?: boolean;
    phone?: string;
  } | null
): AppUser | null => {
  if (!dbUser) return null;

  // Convert string role to proper enum type
  let typedRole: "admin" | "user" | "ceo" = "user";
  
  if (dbUser.role === "admin") {
    typedRole = "admin";
  } else if (dbUser.role === "ceo") {
    typedRole = "ceo";
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: typedRole,
    createdAt: dbUser.created_at || new Date().toISOString(),
    lastLogin: dbUser.last_login || new Date().toISOString(),
    isBanned: dbUser.is_banned || false,
    activePlan: dbUser.active_plan || null,
    planExpiryDate: dbUser.plan_expiry_date || null,
    credits: dbUser.credits || 0,
    emailVerified: dbUser.email_verified || false,
    phone: dbUser.phone
  };
};

// Transform app user to DB user format
export const transformAppUserToDbUser = (appUser: AppUser) => {
  return {
    id: appUser.id,
    email: appUser.email,
    name: appUser.name,
    role: appUser.role,
    created_at: appUser.createdAt,
    last_login: appUser.lastLogin,
    is_banned: appUser.isBanned,
    active_plan: appUser.activePlan,
    plan_expiry_date: appUser.planExpiryDate,
    credits: appUser.credits || 0,
    email_verified: appUser.emailVerified,
    phone: appUser.phone
  };
};

export const getCurrentUser = async (): Promise<AppUser | null> => {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.session.user.id)
    .single();

  if (!profile) return null;

  return transformUser(profile);
};
