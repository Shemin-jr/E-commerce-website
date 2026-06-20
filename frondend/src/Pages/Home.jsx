import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaFutbol, FaShieldAlt, FaTshirt, FaTrophy } from "react-icons/fa";
import API from "../api/api";

const heroSlides = [
  {
    id: 1,
    image:
      "https://www.soccerbible.com/media/173148/real18-min.jpg?_gl=1*pdno7q*_up*MQ..*_ga*NDgxOTYzNDc3LjE3NzQ4Nzk5NzI.*_ga_Y4X5CXH0G7*czE3NzQ4Nzk5NjkkbzEkZzAkdDE3NzQ4Nzk5NjkkajYwJGwwJGgyNDgxNTQ1NDk.",
  },
  {
    id: 2,
    image: "https://www.soccerbible.com/media/173149/real17-min.jpg",
  },
  {
    id: 3,
    image: "https://www.soccerbible.com/media/173147/real19-min.jpg",
  },
];

function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await API.get("/products", { params: { limit: 4 } });
        setFeatured(res.data?.products || []);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08111b] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.08]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,27,0.94),rgba(8,17,27,0.88))]" />
      <div className="relative z-10">
        <section className="relative overflow-hidden border-b border-white/10">
          <motion.div
            className="absolute inset-0 flex"
            animate={{ x: `-${activeSlide * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {heroSlides.map((slide) => (
              <div
                key={slide.id}
                className="h-full w-full shrink-0 basis-full bg-cover bg-center"
                style={{
                  backgroundImage: `url('${slide.image}')`,
                  backgroundPosition: "center top",
                }}
              />
            ))}
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,17,36,0.82),rgba(6,17,36,0.52),rgba(6,17,36,0.88))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.16),transparent_28%)]" />

          <div className="relative mx-auto grid min-h-[78vh] max-w-7xl gap-12 px-6 py-24 md:px-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >

              <h1 className="text-5xl font-black uppercase italic leading-[0.9] tracking-tight text-white md:text-7xl">
                Jersey Style
                <span className="block text-sky-300">For The Matchday Look.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                Wear the Game — Premium Jerseys Inspired by Passion, Built for Champions.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-sky-400 px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-sky-300"
                >
                  Shop Jerseys <FaArrowRight />
                </button>
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white/12"
                >
                  View Jersey Collection
                </button>
              </div>

              <div className="mt-10 flex items-center gap-3">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition ${activeSlide === index ? "w-10 bg-sky-300" : "w-2.5 bg-white/40"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>

            <div className="relative hidden lg:block" />
          </div>
        </section>

        {/* <section className="bg-[#0c1825] py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-12 flex items-center gap-4">
            <FaTrophy className="text-3xl text-emerald-300" />
            <h2 className="text-3xl font-black uppercase tracking-tight md:text-5xl">
              Featured Products
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-[380px] animate-pulse rounded-[1.8rem] bg-white/6" />
              ))}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {featured.map((product) => (
                <motion.div
                  key={product._id}
                  whileHover={{ y: -6 }}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group cursor-pointer overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#08111b]"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-[linear-gradient(180deg,#102235,#08111b)] p-8">
                    <img
                      src={product.image}
                      alt={product.team}
                      className="max-h-full object-contain transition duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="space-y-4 p-6">
                    <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
                      {product.category || "Jersey"}
                    </p>
                    <h3 className="min-h-[56px] text-2xl font-black uppercase leading-tight text-white">
                      {product.team}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-white">Rs. {product.price}</span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-slate-950">
                        View <FaArrowRight />
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section> */}

        {/* <section className="bg-[#08111b] py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:px-10 lg:grid-cols-3">
          {[
            {
              icon: FaFutbol,
              title: "Football First",
              text: "A general football theme without country-specific sections.",
            },
            {
              icon: FaTshirt,
              title: "Jersey Focus",
              text: "The homepage keeps the attention on football shirts and products.",
            },
            {
              icon: FaShieldAlt,
              title: "Clean Design",
              text: "Simple sections, strong background image, and an easy shopping flow.",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -6 }}
              className="rounded-[1.8rem] border border-white/10 bg-[#0c1825] p-8"
            >
              <item.icon className="text-3xl text-emerald-300" />
              <h3 className="mt-6 text-2xl font-black uppercase text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section> */}
      </div>
    </div>
  );
}

export default Home;
