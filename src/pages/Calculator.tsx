import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import FurnitureCalculator from "@/components/FurnitureCalculator";

export default function Calculator() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/#catalog", label: "Каталог" },
    { href: "/#recommendations", label: "Рекомендации" },
    { href: "/calculator", label: "Калькулятор" },
    { href: "/#about", label: "О нас" },
    { href: "/#contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f7] font-body text-[#111] page-enter overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? "navbar-scrolled" : "navbar-transparent bg-white border-b border-[#eee]"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className={`font-display text-2xl font-semibold tracking-widest transition-colors duration-500 ${scrolled ? "text-white" : "text-[#111]"}`}
          >
            MERTA
          </button>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`text-[11px] tracking-widest uppercase font-body transition-colors duration-300 ${
                  l.href === "/calculator"
                    ? scrolled ? "text-white font-semibold" : "text-[#111] font-semibold"
                    : scrolled ? "text-[#aaa] hover:text-white" : "text-[#555] hover:text-[#111]"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/79181300668"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-2 px-4 py-2 text-[10px] tracking-widest uppercase border transition-colors duration-300 ${
                scrolled
                  ? "border-white/30 text-white hover:bg-white hover:text-[#111]"
                  : "border-[#111] text-[#111] hover:bg-[#111] hover:text-white"
              }`}
            >
              <Icon name="MessageCircle" size={14} />
              WhatsApp
            </a>
            <button
              className={`md:hidden transition-colors ${scrolled ? "text-white" : "text-[#111]"}`}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Icon name={mobileOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-[#0f0f0f] mobile-menu-open">
            <div className="flex flex-col py-5 px-6 gap-5">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-white text-sm tracking-widest uppercase">
                  {l.label}
                </a>
              ))}
              <a
                href="https://wa.me/79181300668"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/60 text-sm tracking-widest uppercase"
              >
                <Icon name="MessageCircle" size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── HEADER ── */}
      <div className="pt-16 bg-[#111] text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-10 md:py-20">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 text-[11px] tracking-widest uppercase mb-8 transition-colors"
          >
            <Icon name="ArrowLeft" size={14} /> На главную
          </button>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">Онлайн-расчёт</p>
          <h1 className="font-display text-[clamp(2rem,6vw,5rem)] font-light leading-none">
            Калькулятор цены
          </h1>
          <p className="text-white/50 mt-4 text-[15px] max-w-xl">
            Пройдите несколько шагов и получите ориентировочную стоимость вашей мебели. Итоговая цена уточняется при бесплатном замере.
          </p>
        </div>
      </div>

      {/* ── CALCULATOR ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-16">
        <FurnitureCalculator />
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] text-white py-10 mt-10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-xl tracking-widest">MERTA</p>
          <p className="text-white/25 text-[11px] tracking-wider">© 2024 Merta. Все права защищены.</p>
          <div className="flex items-center gap-6">
            <a href="https://instagram.com/kuhni_merta" target="_blank" rel="noopener noreferrer" className="text-white/35 hover:text-white transition-colors">
              <Icon name="Instagram" size={18} />
            </a>
            <a href="tel:+79181300668" className="text-white/35 hover:text-white transition-colors">
              <Icon name="Phone" size={18} />
            </a>
            <a href="mailto:vadimvodinov28@gmail.com" className="text-white/35 hover:text-white transition-colors">
              <Icon name="Mail" size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
