"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Gallery({ isPage = false }) {
  const router = useRouter();

  const [galleryItems, setGalleryItems] = useState([]);
  const [videos, setVideos] = useState([]);
  const [lightbox, setLightbox] = useState({
    open: false,
    type: "image",
    index: 0,
  });

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from("gallery").select("*");

      const images = data?.filter((item) => item.type === "image") || [];
      const vids =
        data?.filter((item) => item.type === "video").map((v) => ({
          ...v,
          id: extractYouTubeId(v.media_url),
        })) || [];

      setGalleryItems(images);
      setVideos(vids);
    };

    fetchGallery();
  }, []);

  const extractYouTubeId = (url) => {
    const regExp = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&#]+)/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  };

  const list = lightbox.type === "image" ? galleryItems : videos;

  const openImage = (i) => setLightbox({ open: true, type: "image", index: i });
  const openVideo = (i) => setLightbox({ open: true, type: "video", index: i });
  const close = () => setLightbox({ ...lightbox, open: false });

  const next = () =>
    setLightbox((p) => ({ ...p, index: (p.index + 1) % list.length }));

  const prev = () =>
    setLightbox((p) => ({ ...p, index: (p.index - 1 + list.length) % list.length }));

  return (
    <>
      {/* SECTION */}
      <section
        id="gallery"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-yellow-50/50 via-orange-50/50 to-pink-50/50"
      >
        <div className="max-w-7xl mx-auto">

          {/* HEADING ONLY ON HOMEPAGE */}
          {!isPage && (
            <div className="text-center mb-16">
              <h2 className="text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Events Gallery
              </h2>
              <p className="text-gray-600 mt-3">
                Happy moments from our coaching journey
              </p>
            </div>
          )}

          {/* IMAGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
  {galleryItems.map((item, i) => (
    <motion.div
      key={item.id}
      onClick={() => openImage(i)}
      whileHover={{ scale: 1.04 }}
      className="cursor-pointer"
    >
      <div className="rounded-3xl overflow-hidden shadow-lg bg-white">
        <img
          src={item.media_url}
          alt={item.title || "Gallery image"}
          className="w-full h-auto object-contain bg-white"
        />
      </div>
    </motion.div>
  ))}
</div>


          {/* VIDEOS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {videos.map((v, i) => (
    <motion.div
      key={v.id}
      onClick={() => openVideo(i)}
      whileHover={{ scale: 1.04 }}
      className="cursor-pointer"
    >
      <div className="rounded-3xl overflow-hidden shadow-lg bg-black">
        <img
          src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
          alt="Video thumbnail"
          className="w-full h-auto object-contain"
        />
      </div>
    </motion.div>
  ))}
</div>



          {/* BUTTON ONLY ON HOMEPAGE */}
          {!isPage && (
            <div className="text-center mt-16">
              <button
                onClick={() => router.push("/gallery")}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
              >
                View Full Gallery →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox.open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={close}
          >
            <motion.div
              className="relative w-[90vw] h-[90vh] bg-black rounded-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 text-white"
              >
                <X />
              </button>

              {lightbox.type === "image" ? (
                <img
                  src={galleryItems[lightbox.index].media_url}
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  className="w-full h-full rounded-xl"
                  src={`https://www.youtube.com/embed/${videos[lightbox.index].id}`}
                  allowFullScreen
                />
              )}

              <button
                onClick={prev}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={next}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer"
              >
                <ChevronRight size={32} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



