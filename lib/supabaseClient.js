import { createBrowserClient } from "@supabase/ssr";

let supabase;

if (typeof window !== "undefined") {
  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
} else {
  // Export a safe stub for server-side builds to avoid runtime errors
  supabase = {
    auth: {
      signInWithPassword: async () => {
        throw new Error("Supabase client is only available in the browser.");
      },
    },
  };
}

export { supabase };
