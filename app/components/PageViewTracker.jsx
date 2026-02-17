"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/*
❌ WHAT WAS WRONG BEFORE?

You were using:

  const [status, setStatus] = useState("booting");

  return <div>PV: {status}</div>

Problem:
- Server rendered: "PV: booting"
- Client immediately changed it to: "PV: ok" or "PV: error"
- React hydration expected the same HTML as server
- DOM didn't match
- ❌ Hydration error occurred

Error looked like:
"A tree hydrated but some attributes of the server rendered HTML didn't match the client properties"

Hydration errors often point to random elements (like your button),
but the real issue was this component updating UI during hydration.
*/


// ✅ SAFE session generator
function getOrCreateSessionId() {
  const key = "pv_session_id";
  let id = null;

  try {
    // localStorage only runs in browser (safe inside useEffect)
    id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
  } catch {
    // fallback (very rare case)
    id = `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  return id;
}

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // ✅ All browser logic must be inside useEffect
    // so it runs AFTER hydration

    const session_id = getOrCreateSessionId();

    (async () => {
      await supabase.from("page_views").insert([
        { path: pathname || "/", session_id },
      ]);
    })();

  }, [pathname]);

  /*
  ✅ IMPORTANT FIX

  We return NULL.

  Why?

  Tracking components should NOT render UI.
  They should only perform side-effects.

  Now:
  - Server renders nothing
  - Client first render renders nothing
  - No mismatch
  - No hydration error
  */

  return null;
}


