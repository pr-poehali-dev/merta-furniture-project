import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";


// ─── DATA ────────────────────────────────────────────────────────────────────

import { PRODUCTS } from "@/data/products";

const RECOMMENDATIONS = [PRODUCTS[0], PRODUCTS[2], PRODUCTS[4]];
const CATEGORIES = ["Все", "Кухни", "Шкафы", "Спальни", "Диваны"];
const MATERIALS = ["Все", "МДФ", "ЛДСП", "Массив"];

const TICKER_ITEMS = [
  "КУХНИ ПОД ЗАКАЗ",
  "ШКАФЫ-КУПЕ",
  "ДИВАНЫ ПРЕМИУМ",
  "СПАЛЬНЫЕ ГАРНИТУРЫ",
  "БЕСПЛАТНЫЙ ЗАМЕР",
  "ДОСТАВКА ПО ГОРОДУ",
  "СБОРКА В ПОДАРОК",
];


export default function Index() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const lastScrollY = useRef(0);
  const scrolled = scrollY > 60;
  const navOpacity = Math.min(scrollY / 120, 1);
  const [mobileOpen, setMobileOpen] = useState(false);



  // Catalog filters
  const [filterCategory, setFilterCategory] = useState("Все");
  const [filterMaterial, setFilterMaterial] = useState("Все");
  const [filterMaxPrice, setFilterMaxPrice] = useState(300000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFiltersCount = (filterCategory !== "Все" ? 1 : 0) + (filterMaterial !== "Все" ? 1 : 0) + (filterMaxPrice < 300000 ? 1 : 0);


  const navLinks = [
    { href: "#home", label: "Главная" },
    { href: "#catalog", label: "Каталог" },
    { href: "#recommendations", label: "Рекомендации" },
    { href: "#calculator", label: "Калькулятор" },
    { href: "#about", label: "О нас" },
    { href: "#contacts", label: "Контакты" },
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      if (y > lastScrollY.current + 8 && y > 120) {
        setNavVisible(false);
      } else if (y < lastScrollY.current - 8 || y < 80) {
        setNavVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  useEffect(() => {
    const ids = ["home", "catalog", "recommendations", "calculator", "about", "contacts"];
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const filtered = PRODUCTS.filter((p) => {
    const catOk = filterCategory === "Все" || p.category === filterCategory;
    const matOk = filterMaterial === "Все" || p.material === filterMaterial;
    const priceOk = p.price <= filterMaxPrice;
    return catOk && matOk && priceOk;
  });


  const formatPrice = (n: number) =>
    n.toLocaleString("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    });

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f7] font-body text-[#111] page-enter overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 navbar-slide ${navVisible ? "translate-y-0" : "-translate-y-full"}`}
        style={{ background: `rgba(15, 15, 15, ${navOpacity})`, backdropFilter: `blur(${navOpacity * 12}px)` }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <button
            onClick={() => scrollTo("#home")}
            className={`font-display text-2xl font-semibold tracking-widest transition-colors duration-500 ${scrolled ? "text-white" : "text-[#111]"}`}
          >
            MERTA
          </button>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => {
              const isActive = activeSection === l.href.replace("#", "");
              return (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className={`relative text-[11px] tracking-widest uppercase font-body transition-colors duration-300 ${
                    isActive
                      ? scrolled ? "text-white" : "text-[#111]"
                      : scrolled ? "text-[#666] hover:text-white" : "text-[#999] hover:text-[#111]"
                  }`}
                >
                  {l.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-current transition-all duration-300 ${isActive ? "w-full" : "w-0"}`} />
                </button>
              );
            })}
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
              className={`md:hidden transition-colors duration-500 ${scrolled ? "text-white" : "text-[#111]"}`}
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
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-left text-white text-sm tracking-widest uppercase"
                >
                  {l.label}
                </button>
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

      {/* ── HERO ── */}
      <section id="home" className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/e74cff74-26e5-49f8-99d3-ac9c89aa17f1.jpg"
            alt="Merta"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.42)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-[#f9f9f7]" />
        </div>

        <div className="relative z-10 flex flex-col items-start justify-center flex-1 max-w-7xl mx-auto px-5 md:px-10 pt-20 md:pt-28 pb-12 md:pb-20">
          <p className="hero-animate hero-animate-delay-1 text-white/60 text-[10px] tracking-[0.35em] uppercase mb-6">
            Мебель с характером
          </p>
          <h1 className="hero-animate hero-animate-delay-2 font-display text-white text-[clamp(3rem,8vw,7rem)] font-light leading-none mb-8 max-w-3xl">
            Пространство,<br />
            <em>созданное</em><br />
            для вас
          </h1>
          <div className="hero-animate hero-animate-delay-3 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => scrollTo("#catalog")}
              className="bg-white text-[#111] px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-[#111] hover:text-white transition-colors duration-300"
            >
              Каталог
            </button>
            <button
              onClick={() => navigate("/calculator")}
              className="border border-white text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-white hover:text-[#111] transition-colors duration-300"
            >
              Рассчитать стоимость
            </button>
            <a
              href="https://instagram.com/kuhni_merta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/50 text-white/80 px-8 py-3.5 text-[11px] tracking-widest uppercase hover:border-white hover:text-white transition-colors duration-300"
            >
              <Icon name="Instagram" size={15} />
              @kuhni_merta
            </a>
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-[9px] tracking-widest uppercase">Прокрутить</span>
            <Icon name="ChevronDown" size={16} className="animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="bg-[#111] text-white py-3 overflow-hidden select-none">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-[11px] tracking-[0.3em] uppercase mx-5 md:mx-10 text-white font-medium">
              {item} <span className="mx-5 opacity-50">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── RECOMMENDATIONS ── */}
      <section id="recommendations" className="py-12 md:py-24 max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-end justify-between mb-8 md:mb-14">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Редакция выбирает</p>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-light">Рекомендации</h2>
          </div>
          <button
            onClick={() => scrollTo("#catalog")}
            className="hidden md:flex items-center gap-2 text-[11px] tracking-widest uppercase border-b border-[#111] pb-0.5 hover:opacity-40 transition-opacity"
          >
            Весь каталог <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {RECOMMENDATIONS.map((p) => (
            <div key={p.id} className="product-card group cursor-pointer">
              <div className="overflow-hidden aspect-[4/3] bg-[#eee] mb-4">
                <img src={p.img} alt={p.name} className="card-img w-full h-full object-cover" />
              </div>
              <p className="text-[10px] tracking-widest uppercase text-[#999] mb-1 truncate">{p.category}</p>
              <div className="flex flex-col mb-3">
                <h3 className="font-display text-lg md:text-2xl font-light leading-tight">{p.name}</h3>
                <p className="font-body text-sm font-semibold mt-1">от {formatPrice(p.price)}</p>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="catalog" className="bg-[#f2f2f0] py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="mb-8 md:mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Наши изделия</p>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-light">Каталог</h2>
          </div>

          {/* Filters */}
          <div className="bg-white mb-6 md:mb-10 border border-[#e8e8e8]">
            {/* Mobile toggle */}
            <button
              className="md:hidden w-full flex items-center justify-between px-5 py-4"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <div className="flex items-center gap-3">
                <Icon name="SlidersHorizontal" size={16} />
                <span className="text-[11px] tracking-widest uppercase font-semibold">Фильтры</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#111] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <Icon name={filtersOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-[#999]" />
            </button>

            {/* Active filter chips on mobile when collapsed */}
            {!filtersOpen && activeFiltersCount > 0 && (
              <div className="md:hidden flex flex-wrap gap-2 px-5 pb-4">
                {filterCategory !== "Все" && (
                  <button
                    onClick={() => setFilterCategory("Все")}
                    className="flex items-center gap-1.5 bg-[#111] text-white text-[10px] tracking-wider px-3 py-1.5"
                  >
                    {filterCategory} <Icon name="X" size={10} />
                  </button>
                )}
                {filterMaterial !== "Все" && (
                  <button
                    onClick={() => setFilterMaterial("Все")}
                    className="flex items-center gap-1.5 bg-[#111] text-white text-[10px] tracking-wider px-3 py-1.5"
                  >
                    {filterMaterial} <Icon name="X" size={10} />
                  </button>
                )}
                {filterMaxPrice < 300000 && (
                  <button
                    onClick={() => setFilterMaxPrice(300000)}
                    className="flex items-center gap-1.5 bg-[#111] text-white text-[10px] tracking-wider px-3 py-1.5"
                  >
                    до {formatPrice(filterMaxPrice)} <Icon name="X" size={10} />
                  </button>
                )}
              </div>
            )}

            {/* Filter content */}
            <div className={`${filtersOpen ? "block" : "hidden"} md:block p-5 md:p-8 border-t border-[#e8e8e8] md:border-t-0`}>
              <p className="hidden md:block text-[10px] tracking-[0.3em] uppercase text-[#bbb] mb-6">Фильтр товаров</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
                <div>
                  <p className="text-[11px] tracking-widest uppercase mb-3 font-semibold">Тип мебели</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFilterCategory(c)}
                        className={`px-3 py-2 text-[11px] tracking-wider border transition-colors ${
                          filterCategory === c
                            ? "bg-[#111] text-white border-[#111]"
                            : "border-[#ddd] text-[#555] hover:border-[#111]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] tracking-widest uppercase mb-3 font-semibold">Материал</p>
                  <div className="flex flex-wrap gap-2">
                    {MATERIALS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setFilterMaterial(m)}
                        className={`px-3 py-2 text-[11px] tracking-wider border transition-colors ${
                          filterMaterial === m
                            ? "bg-[#111] text-white border-[#111]"
                            : "border-[#ddd] text-[#555] hover:border-[#111]"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] tracking-widest uppercase mb-3 font-semibold">
                    Цена до:{" "}
                    <span className="font-normal text-[#555]">{formatPrice(filterMaxPrice)}</span>
                  </p>
                  <input
                    type="range"
                    min={30000}
                    max={300000}
                    step={5000}
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
                    className="w-full mt-3"
                  />
                  <div className="flex justify-between text-[10px] text-[#bbb] mt-1">
                    <span>30 000 ₽</span>
                    <span>300 000 ₽</span>
                  </div>
                </div>
              </div>

              {/* Reset + Apply on mobile */}
              {activeFiltersCount > 0 && (
                <div className="md:hidden flex gap-3 mt-5 pt-5 border-t border-[#eee]">
                  <button
                    onClick={() => { setFilterCategory("Все"); setFilterMaterial("Все"); setFilterMaxPrice(300000); }}
                    className="flex-1 border border-[#ddd] py-2.5 text-[11px] tracking-widest uppercase hover:border-[#111] transition-colors"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="flex-1 bg-[#111] text-white py-2.5 text-[11px] tracking-widest uppercase"
                  >
                    Показать
                  </button>
                </div>
              )}
              {activeFiltersCount === 0 && (
                <button
                  className="md:hidden w-full mt-5 bg-[#111] text-white py-2.5 text-[11px] tracking-widest uppercase"
                  onClick={() => setFiltersOpen(false)}
                >
                  Показать
                </button>
              )}
            </div>
          </div>

          {/* Products */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#bbb]">
              <Icon name="PackageOpen" size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-[11px] tracking-widest uppercase">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="product-card bg-white group cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                  <div className="overflow-hidden aspect-[4/3] bg-[#eee] relative">
                    <img src={p.img} alt={p.name} className="card-img w-full h-full object-cover" />
                    {p.tag && (
                      <span className="absolute top-3 left-3 bg-[#111] text-white text-[9px] tracking-widest uppercase px-2.5 py-1">
                        {p.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-5 flex flex-col">
                    <p className="text-[10px] tracking-widest uppercase text-[#999] mb-1 truncate">{p.category}</p>
                    <h3 className="font-display text-base md:text-2xl font-light mb-1 leading-tight">{p.name}</h3>
                    <p className="font-body font-semibold text-sm">от {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="bg-white text-[#111] py-12 md:py-24 border-t border-[#eee]">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-6">Наша история</p>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight mb-8">
                О компании<br /><em>Merta</em>
              </h2>
              <p className="text-[#444] leading-relaxed mb-5 text-[15px]">
                Компания Merta основана Водиновым Степаном Николаевичем. Мы создаём мебель, которая отражает личность своего владельца — строгие линии, честные материалы, долгий срок службы.
              </p>
              <p className="text-[#444] leading-relaxed mb-10 text-[15px]">
                Каждый предмет изготавливается по индивидуальным параметрам на нашем производстве. Мы работаем с МДФ, ЛДСП и натуральным массивом дерева, подбирая материал под задачу и бюджет.
              </p>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {[["7+", "Лет опыта"], ["1200+", "Объектов"], ["100%", "Гарантия"]].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-display text-2xl md:text-4xl font-light mb-1 text-[#111]">{num}</p>
                    <p className="text-[#999] text-[10px] tracking-wider uppercase">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden aspect-square">
              <img
                src="https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/5f94a626-e3c2-4f82-af58-e90a0b5e423b.jpg"
                alt="Merta мастерская"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM / WHATSAPP ── */}
      <section className="py-12 md:py-16 bg-[#f2f2f0]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-8">Связаться с нами</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/79181300668"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#111] text-white px-8 py-4 font-display text-xl font-light hover:bg-[#333] transition-colors duration-300"
            >
              <Icon name="MessageCircle" size={22} />
              Написать в WhatsApp
            </a>
            <a
              href="https://instagram.com/kuhni_merta"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 border border-[#bbb] text-[#111] px-8 py-4 font-display text-xl font-light hover:border-[#111] hover:bg-[#111] hover:text-white transition-colors duration-300"
            >
              <Icon name="Instagram" size={22} />
              @kuhni_merta
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACTS ── */}
      <section id="contacts" className="py-12 md:py-24 bg-[#111]">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="mb-8 md:mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3">Напишите нам</p>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light text-white">Контакты</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              label: "Основатель",
              value: "Водинов Степан Николаевич",
              href: undefined,
            },
            {
              label: "Телефон",
              value: "+7 918 130 06 68",
              href: "tel:+79181300668",
            },
            {
              label: "Почта",
              value: "vadimvodinov28@gmail.com",
              href: "mailto:vadimvodinov28@gmail.com",
            },
          ].map(({ label, value, href }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="w-8 h-px bg-white/30 mb-3" />
              <p className="text-[10px] tracking-widest uppercase text-white/40">{label}</p>
              {href ? (
                <a href={href} className="font-display text-xl font-light text-white hover:opacity-40 transition-opacity break-all">
                  {value}
                </a>
              ) : (
                <p className="font-display text-xl font-light text-white">{value}</p>
              )}
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111] text-white py-10">
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