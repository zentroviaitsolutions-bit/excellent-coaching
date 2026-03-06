"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Gallery({ isPage = false }) {
  const router = useRouter();

  const [galleryItems, setGalleryItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lightbox, setLightbox] = useState({
    open: false,
    type: "image",
    index: 0,
  });

  /* ------------------- YOUTUBE ID EXTRACTOR ------------------- */

  const extractYouTubeId = (url) => {
    if (!url) return "";

    try {
      const parsedUrl = new URL(url);

      // youtu.be/ID
      if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.slice(1);
      }

      // youtube.com/watch?v=ID
      if (parsedUrl.searchParams.get("v")) {
        return parsedUrl.searchParams.get("v");
      }

      // youtube.com/shorts/ID
      if (parsedUrl.pathname.includes("/shorts/")) {
        return parsedUrl.pathname.split("/shorts/")[1];
      }

      // youtube.com/embed/ID
      if (parsedUrl.pathname.includes("/embed/")) {
        return parsedUrl.pathname.split("/embed/")[1];
      }

      return "";
    } catch (err) {
      return "";
    }
  };

  /* ------------------- FETCH GALLERY ------------------- */

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Gallery fetch error:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const images = data.filter((item) => item.type === "image");

        const vids = data
          .filter((item) => item.type === "video")
          .map((v) => ({
            ...v,
            youtubeId: extractYouTubeId(v.media_url),
          }))
          .filter((v) => v.youtubeId); // remove invalid links

        setGalleryItems(images);
        setVideos(vids);
      }

      setLoading(false);
    };

    fetchGallery();
  }, []);

  /* ------------------- LIGHTBOX ------------------- */

  const list =
    lightbox.type === "image" ? galleryItems : videos;

  const openImage = (i) =>
    setLightbox({ open: true, type: "image", index: i });

  const openVideo = (i) =>
    setLightbox({ open: true, type: "video", index: i });

  const close = useCallback(() => {
    setLightbox({ open: false, type: "image", index: 0 });
  }, []);

  const next = useCallback(() => {
    if (!list.length) return;
    setLightbox((p) => ({
      ...p,
      index: (p.index + 1) % list.length,
    }));
  }, [list.length]);

  const prev = useCallback(() => {
    if (!list.length) return;
    setLightbox((p) => ({
      ...p,
      index: (p.index - 1 + list.length) % list.length,
    }));
  }, [list.length]);

  /* ------------------- KEYBOARD SUPPORT ------------------- */

  useEffect(() => {
    if (!lightbox.open) return;

    document.body.style.overflow = "hidden";

    const handleKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightbox.open, close, next, prev]);

  /* ------------------- UI ------------------- */

  return (
    <>
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">

          {!isPage && (
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Events Gallery
              </h2>
              <p className="text-gray-600 mt-3">
                Happy moments from our coaching journey
              </p>
            </div>
          )}

          {loading && (
            <p className="text-center text-gray-500">
              Loading gallery...
            </p>
          )}

          {/* ---------------- IMAGES ---------------- */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {galleryItems.map((item, i) => (
              <motion.div
                key={item.id}
                onClick={() => openImage(i)}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
                  <img
                    src={item.media_url}
                    alt={item.title || "Gallery image"}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* ---------------- VIDEOS ---------------- */}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <motion.div
                key={v.id}
                onClick={() => openVideo(i)}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black">
                  <img
                    src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-64 object-cover opacity-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white text-3xl">
                    ▶
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!isPage && (
            <div className="text-center mt-16">
              <button
                onClick={() => router.push("/gallery")}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
              >
                View Full Gallery →
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ---------------- LIGHTBOX ---------------- */}

      <AnimatePresence>
        {lightbox.open && list.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-[95vw] h-[90vh] bg-black rounded-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 text-white"
              >
                <X size={30} />
              </button>

              {lightbox.type === "image" ? (
                <img
                  src={galleryItems[lightbox.index]?.media_url}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <iframe
                    title="YouTube video player"
                    className="aspect-[9/16] w-full max-w-md"
                    src={`https://www.youtube.com/embed/${videos[lightbox.index]?.youtubeId}`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              )}

              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
              >
                <ChevronLeft size={40} />
              </button>

              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
              >
                <ChevronRight size={40} />
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
