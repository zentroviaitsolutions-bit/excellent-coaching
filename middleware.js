// import { createServerClient } from "@supabase/ssr";
// import { NextResponse } from "next/server";

// export async function middleware(req) {
//   const res = NextResponse.next();

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         get(name) {
//           return req.cookies.get(name)?.value;
//         },
//         set(name, value, options) {
//           res.cookies.set({ name, value, ...options });
//         },
//         remove(name, options) {
//           res.cookies.set({ name, value: "", ...options });
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
//   const isLoginPage = req.nextUrl.pathname.startsWith("/admin/login");

//   // 🚫 not logged in → send to login + remember page
//   if (isAdminRoute && !isLoginPage && !user) {
//     const redirectUrl = req.nextUrl.clone();
//     redirectUrl.pathname = "/admin/login";
//     redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
//     return NextResponse.redirect(redirectUrl);
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const pathname = req.nextUrl.pathname;

  // ✅ 1) Maintenance mode check (PUBLIC ONLY)
  // skip: admin, maintenance page itself, next static files, favicon, api routes
  const isSkippable =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico";

  if (!isSkippable) {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single();

    if (settings?.maintenance_mode) {
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.redirect(url);
    }
  }

  // ✅ 2) Admin auth protection
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname.startsWith("/admin/login");

  if (isAdminRoute && !isLoginPage && !user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/:path*"], // ✅ run middleware on all routes
};
