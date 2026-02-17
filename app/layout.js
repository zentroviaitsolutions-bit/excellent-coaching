import { Inter } from "next/font/google";
import "./globals.css";

// ✅ Page view tracking component (Client Component)
import PageViewTracker from "@/app/components/PageViewTracker";
import AnnouncementBanner from "@/app/components/AnnouncementBanner";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "Excellent Coaching Baheri | Best Coaching Center for Kids",
    template: "%s | Excellent Coaching Baheri",
  },

  description:
    "Excellent Coaching is the best kids coaching center in Baheri offering expert teachers, small batch sizes, maths and English tuition, and personalized learning programs to unlock every child’s potential.",

  keywords: [
    "Best coaching center in Baheri",
    "Kids coaching classes Baheri",
    "Maths tuition Baheri",
    "English coaching Baheri",
    "Tuition center near me",
    "School coaching for kids",
  ],

  authors: [{ name: "Excellent Coaching Baheri" }],
  creator: "Excellent Coaching",
  publisher: "Excellent Coaching",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Best Coaching Center for Kids in Baheri",
    description:
      "Join Baheri’s trusted coaching center with expert faculty, personalized attention, and result-oriented learning.",
    url: "https://yourdomain.com",
    siteName: "Excellent Coaching Baheri",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Excellent Coaching Baheri Classroom",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Excellent Coaching Baheri",
    description:
      "Top kids coaching center in Baheri with expert teachers and small batches.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
  },

  category: "education",

  other: {
    "geo.region": "IN-UP",
    "geo.placename": "Baheri",
  },
};

/* ✅ VIEWPORT MUST BE EXPORTED SEPARATELY IN NEXT 16 */
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        {/* ✅ (IMPORTANT) This tracks every route change & inserts into Supabase table: page_views */}
        {/* ✅ Keep this ABOVE {children} so it mounts for all pages */}
        <PageViewTracker />
         <AnnouncementBanner />

        {/* ✅ Structured data for Google (SEO) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "Excellent Coaching",
              url: "https://yourdomain.com",
              logo: "https://yourdomain.com/logo.png",
              description:
                "Best coaching center for kids in Baheri offering maths and English tuition with expert teachers.",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Baheri",
                addressRegion: "Uttar Pradesh",
                addressCountry: "India",
              },
              areaServed: "Baheri and surrounding areas",
            }),
          }}
        />

        {/* ✅ All pages render here */}

        {children}
      </body>
    </html>
  );
}
