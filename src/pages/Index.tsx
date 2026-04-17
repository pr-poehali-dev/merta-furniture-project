import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: "Кухня Nord",
    category: "Кухни",
    material: "МДФ",
    price: 185000,
    img: "https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/e74cff74-26e5-49f8-99d3-ac9c89aa17f1.jpg",
    tag: "Хит",
  },
  {
    id: 2,
    name: "Шкаф-купе Atlas",
    category: "Шкафы",
    material: "ЛДСП",
    price: 64000,
    img: "https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/5f94a626-e3c2-4f82-af58-e90a0b5e423b.jpg",
    tag: null,
  },
  {
    id: 3,
    name: "Диван Mono",
    category: "Диваны",
    material: "Массив",
    price: 97000,
    img: "https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/4f4e3f83-87fe-434b-a91c-117e40dba3fd.jpg",
    tag: "Новинка",
  },
  {
    id: 4,
    name: "Спальня Arco",
    category: "Спальни",
    material: "МДФ",
    price: 142000,
    img: "https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/5f94a626-e3c2-4f82-af58-e90a0b5e423b.jpg",
    tag: null,
  },
  {
    id: 5,
    name: "Кухня Loft",
    category: "Кухни",
    material: "Массив",
    price: 230000,
    img: "https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/e74cff74-26e5-49f8-99d3-ac9c89aa17f1.jpg",
    tag: "Премиум",
  },
  {
    id: 6,
    name: "Шкаф Forma",
    category: "Шкафы",
    material: "МДФ",
    price: 78000,
    img: "https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/5f94a626-e3c2-4f82-af58-e90a0b5e423b.jpg",
    tag: null,
  },
];

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

interface CartItem {
  product: (typeof PRODUCTS)[0];
  qty: number;
}

export default function Index() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const lastScrollY = useRef(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Catalog filters
  const [filterCategory, setFilterCategory] = useState("Все");
  const [filterMaterial, setFilterMaterial] = useState("Все");
  const [filterMaxPrice, setFilterMaxPrice] = useState(300000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFiltersCount = (filterCategory !== "Все" ? 1 : 0) + (filterMaterial !== "Все" ? 1 : 0) + (filterMaxPrice < 300000 ? 1 : 0);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Calculator — step-by-step
  const [calcStep, setCalcStep] = useState(0);
  const [calcType, setCalcType] = useState("");
  const [calcStyle, setCalcStyle] = useState("");
  const [calcMaterial, setCalcMaterial] = useState("");
  const [calcFacade, setCalcFacade] = useState("");
  const [calcWidth, setCalcWidth] = useState(200);
  const [calcHeight, setCalcHeight] = useState(220);
  const [calcDepth, setCalcDepth] = useState(60);
  const [calcExtras, setCalcExtras] = useState<string[]>([]);
  const [calcDone, setCalcDone] = useState(false);

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
      setScrolled(y > 60);
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
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

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

  const addToCart = (product: (typeof PRODUCTS)[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { product, qty: 1 }];
    });
  };
  const removeFromCart = (id: number) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Calculator config
  const CALC_TYPES = [
    { id: "kitchen", label: "Кухня", icon: "ChefHat", base: 95000 },
    { id: "wardrobe", label: "Шкаф-купе", icon: "Package", base: 55000 },
    { id: "bedroom", label: "Спальня", icon: "Bed", base: 85000 },
    { id: "sofa", label: "Диван", icon: "Sofa", base: 65000 },
    { id: "hallway", label: "Прихожая", icon: "DoorOpen", base: 45000 },
    { id: "office", label: "Кабинет", icon: "Monitor", base: 70000 },
    { id: "bathroom", label: "Тумба в ванную", icon: "Droplets", base: 25000 },
    { id: "childroom", label: "Детская", icon: "Star", base: 80000 },
  ];
  const CALC_STYLES: Record<string, { id: string; label: string; coef: number }[]> = {
    kitchen: [
      { id: "modern", label: "Современный", coef: 1.0 },
      { id: "classic", label: "Классический", coef: 1.15 },
      { id: "loft", label: "Лофт", coef: 1.1 },
      { id: "minimalism", label: "Минимализм", coef: 0.95 },
      { id: "scandinavian", label: "Скандинавский", coef: 1.05 },
    ],
    wardrobe: [
      { id: "sliding", label: "Раздвижной", coef: 1.0 },
      { id: "swing", label: "Распашной", coef: 0.9 },
      { id: "corner", label: "Угловой", coef: 1.25 },
      { id: "builtin", label: "Встроенный", coef: 1.1 },
    ],
    bedroom: [
      { id: "modern", label: "Современный", coef: 1.0 },
      { id: "classic", label: "Классический", coef: 1.2 },
      { id: "minimalism", label: "Минимализм", coef: 0.95 },
      { id: "provence", label: "Прованс", coef: 1.15 },
    ],
    sofa: [
      { id: "straight", label: "Прямой", coef: 1.0 },
      { id: "corner", label: "Угловой", coef: 1.3 },
      { id: "modular", label: "Модульный", coef: 1.4 },
      { id: "ottoman", label: "С оттоманкой", coef: 1.15 },
    ],
    hallway: [
      { id: "modern", label: "Современный", coef: 1.0 },
      { id: "classic", label: "Классический", coef: 1.1 },
      { id: "compact", label: "Компактный", coef: 0.85 },
    ],
    office: [
      { id: "executive", label: "Руководитель", coef: 1.2 },
      { id: "home", label: "Домашний", coef: 1.0 },
      { id: "open", label: "Open space", coef: 1.1 },
    ],
    bathroom: [
      { id: "pedestal", label: "Напольная", coef: 1.0 },
      { id: "hanging", label: "Подвесная", coef: 1.1 },
      { id: "corner", label: "Угловая", coef: 1.15 },
    ],
    childroom: [
      { id: "baby", label: "Малыш (0–3)", coef: 0.9 },
      { id: "junior", label: "Школьник (4–12)", coef: 1.0 },
      { id: "teen", label: "Подросток (13+)", coef: 1.05 },
      { id: "bunk", label: "Двухъярусная", coef: 1.2 },
    ],
  };
  const CALC_MATERIALS = [
    { id: "ldsp", label: "ЛДСП", desc: "Бюджетно и практично", coef: 1.0 },
    { id: "mdf", label: "МДФ", desc: "Оптимальное качество", coef: 1.45 },
    { id: "massiv", label: "Массив дерева", desc: "Премиум, долговечность", coef: 2.4 },
    { id: "mdf_kraska", label: "МДФ + Эмаль", desc: "Глянцевое покрытие", coef: 1.7 },
  ];
  const CALC_FACADES: Record<string, { id: string; label: string; coef: number }[]> = {
    kitchen: [
      { id: "glossy", label: "Глянец", coef: 1.2 },
      { id: "matte", label: "Матовый", coef: 1.1 },
      { id: "wood", label: "Под дерево", coef: 1.15 },
      { id: "texture", label: "Текстурный", coef: 1.25 },
      { id: "glass", label: "Со стеклом", coef: 1.35 },
    ],
    wardrobe: [
      { id: "mirror", label: "Зеркальный", coef: 1.3 },
      { id: "glossy", label: "Глянец", coef: 1.2 },
      { id: "matte", label: "Матовый", coef: 1.0 },
      { id: "wood", label: "Под дерево", coef: 1.1 },
    ],
    bedroom: [
      { id: "matte", label: "Матовый", coef: 1.0 },
      { id: "glossy", label: "Глянец", coef: 1.15 },
      { id: "wood", label: "Под дерево", coef: 1.1 },
    ],
    sofa: [
      { id: "fabric", label: "Ткань", coef: 1.0 },
      { id: "velvet", label: "Велюр", coef: 1.2 },
      { id: "leather", label: "Экокожа", coef: 1.35 },
      { id: "chenille", label: "Шенилл", coef: 1.15 },
    ],
  };
  const EXTRAS_BY_TYPE: Record<string, { id: string; label: string; price: number }[]> = {
    kitchen: [
      { id: "sink", label: "Мойка встроенная", price: 12000 },
      { id: "island", label: "Кухонный остров", price: 35000 },
      { id: "light", label: "Подсветка LED", price: 8000 },
      { id: "soft", label: "Доводчики", price: 5000 },
      { id: "waste", label: "Ящик для мусора", price: 3500 },
      { id: "column", label: "Колонна-пенал", price: 18000 },
    ],
    wardrobe: [
      { id: "mirror", label: "Зеркало внутри", price: 7000 },
      { id: "light", label: "Подсветка", price: 5000 },
      { id: "trouser", label: "Брючница", price: 3000 },
      { id: "safe", label: "Встроенный сейф", price: 12000 },
    ],
    bedroom: [
      { id: "dresser", label: "Комод", price: 22000 },
      { id: "nightstand", label: "Тумбочки (2 шт)", price: 14000 },
      { id: "mirror", label: "Зеркало", price: 8000 },
      { id: "light", label: "Подсветка изголовья", price: 6000 },
    ],
    sofa: [
      { id: "storage", label: "Ящик для белья", price: 5000 },
      { id: "mechanism", label: "Механизм раскладки", price: 8000 },
      { id: "armrests", label: "Регул. подлокотники", price: 6000 },
    ],
    hallway: [
      { id: "mirror", label: "Зеркало", price: 7000 },
      { id: "shoe", label: "Тумба для обуви", price: 12000 },
      { id: "hooks", label: "Крючки и вешалки", price: 2500 },
    ],
    office: [
      { id: "monitor", label: "Подставка под монитор", price: 4000 },
      { id: "bookcase", label: "Книжный шкаф", price: 18000 },
      { id: "safe", label: "Сейф встроенный", price: 14000 },
    ],
    bathroom: [
      { id: "mirror", label: "Зеркало-шкаф", price: 9000 },
      { id: "shelf", label: "Полка над раковиной", price: 3500 },
    ],
    childroom: [
      { id: "desk", label: "Письменный стол", price: 16000 },
      { id: "shelf", label: "Полка-стеллаж", price: 8000 },
      { id: "light", label: "Ночник встроенный", price: 4000 },
      { id: "board", label: "Магнитная доска", price: 5500 },
    ],
  };

  const calcTypeObj = CALC_TYPES.find((t) => t.id === calcType);
  const calcStyleObj = (CALC_STYLES[calcType] || CALC_STYLES.kitchen)?.find((s) => s.id === calcStyle);
  const calcMaterialObj = CALC_MATERIALS.find((m) => m.id === calcMaterial);
  const calcFacadeObj = (CALC_FACADES[calcType] || CALC_FACADES.kitchen)?.find((f) => f.id === calcFacade);
  const availableExtras = EXTRAS_BY_TYPE[calcType] || [];
  const hasFacadeStep = !!CALC_FACADES[calcType];

  const TOTAL_STEPS = hasFacadeStep ? 5 : 4; // type, style, material, [facade], sizes

  const calcPrice = () => {
    if (!calcTypeObj) return 0;
    const base = calcTypeObj.base;
    const area = (calcWidth * calcHeight) / 10000;
    const styleCoef = calcStyleObj?.coef ?? 1.0;
    const matCoef = calcMaterialObj?.coef ?? 1.0;
    const facadeCoef = calcFacadeObj?.coef ?? 1.0;
    const depthCoef = calcDepth > 65 ? 1.12 : 1.0;
    const extrasTotal = calcExtras.reduce((sum, eid) => {
      const e = availableExtras.find((x) => x.id === eid);
      return sum + (e?.price ?? 0);
    }, 0);
    return Math.round(base + area * styleCoef * matCoef * facadeCoef * depthCoef * 78000 + extrasTotal);
  };

  const toggleExtra = (id: string) =>
    setCalcExtras((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const calcReset = () => {
    setCalcStep(0); setCalcType(""); setCalcStyle(""); setCalcMaterial("");
    setCalcFacade(""); setCalcWidth(200); setCalcHeight(220); setCalcDepth(60);
    setCalcExtras([]); setCalcDone(false);
  };

  // Step labels
  const stepLabels = ["Тип мебели", "Стиль", "Материал", ...(hasFacadeStep ? ["Фасад"] : []), "Размеры и опции"];

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
      <nav className={`fixed top-0 left-0 right-0 z-50 navbar-slide ${scrolled ? "navbar-scrolled" : "navbar-transparent"} ${navVisible ? "translate-y-0" : "-translate-y-full"}`}>
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
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center gap-1 transition-colors duration-500 ${scrolled ? "text-white" : "text-[#111]"}`}
            >
              <Icon name="ShoppingBag" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#111] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
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
              <button
                onClick={() => addToCart(p)}
                className="w-full border border-[#111] py-2.5 text-[10px] tracking-widest uppercase hover:bg-[#111] hover:text-white transition-colors duration-300"
              >
                В корзину
              </button>
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
                <div key={p.id} className="product-card bg-white group cursor-pointer">
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
                    <p className="font-body font-semibold text-sm mb-3">от {formatPrice(p.price)}</p>
                    <button
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-center gap-1.5 text-[10px] tracking-wider uppercase border border-[#111] py-2 hover:bg-[#111] hover:text-white transition-colors duration-300"
                    >
                      <Icon name="Plus" size={11} /> В корзину
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="calculator" className="py-12 md:py-24 bg-[#f9f9f7]">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="mb-8 md:mb-12">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Онлайн-расчёт</p>
            <h2 className="font-display text-[clamp(2rem,5vw,4rem)] font-light">Калькулятор цены</h2>
          </div>

          {!calcDone ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: steps form */}
              <div className="lg:col-span-2">
                {/* Progress bar */}
                <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
                  {stepLabels.map((label, i) => (
                    <div key={i} className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => i < calcStep && setCalcStep(i)}
                        className={`flex items-center gap-2 transition-colors ${i < calcStep ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-colors flex-shrink-0 ${
                          i < calcStep ? "bg-[#111] border-[#111] text-white"
                          : i === calcStep ? "border-[#111] text-[#111] bg-white"
                          : "border-[#ddd] text-[#bbb] bg-white"
                        }`}>
                          {i < calcStep ? <Icon name="Check" size={12} /> : i + 1}
                        </div>
                        <span className={`hidden sm:inline text-[10px] tracking-wider uppercase whitespace-nowrap ${i === calcStep ? "text-[#111] font-semibold" : i < calcStep ? "text-[#555]" : "text-[#bbb]"}`}>
                          {label}
                        </span>
                      </button>
                      {i < stepLabels.length - 1 && (
                        <div className={`w-8 md:w-12 h-px mx-2 flex-shrink-0 ${i < calcStep ? "bg-[#111]" : "bg-[#ddd]"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* STEP 0 — тип мебели */}
                {calcStep === 0 && (
                  <div>
                    <p className="text-sm text-[#555] mb-6">Выберите тип мебели, которую хотите заказать</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {CALC_TYPES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setCalcType(t.id); setCalcStyle(""); setCalcFacade(""); setCalcStep(1); }}
                          className={`flex flex-col items-center gap-3 p-4 border-2 transition-all duration-200 hover:border-[#111] group ${
                            calcType === t.id ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white text-[#111]"
                          }`}
                        >
                          <Icon name={t.icon} size={24} className={calcType === t.id ? "text-white" : "text-[#555] group-hover:text-[#111]"} fallback="Package" />
                          <span className="text-[11px] tracking-wider uppercase font-semibold">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 1 — стиль */}
                {calcStep === 1 && (
                  <div>
                    <p className="text-sm text-[#555] mb-6">Выберите стиль для вашей {calcTypeObj?.label.toLowerCase()}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(CALC_STYLES[calcType] || CALC_STYLES.kitchen).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => { setCalcStyle(s.id); setCalcStep(2); }}
                          className={`flex flex-col items-start p-5 border-2 transition-all duration-200 hover:border-[#111] text-left ${
                            calcStyle === s.id ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white"
                          }`}
                        >
                          <span className="text-[13px] font-semibold mb-1">{s.label}</span>
                          <span className={`text-[10px] tracking-wider ${calcStyle === s.id ? "text-white/50" : "text-[#999]"}`}>
                            коэф. {s.coef.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setCalcStep(0)} className="mt-6 flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors">
                      <Icon name="ArrowLeft" size={14} /> Назад
                    </button>
                  </div>
                )}

                {/* STEP 2 — материал */}
                {calcStep === 2 && (
                  <div>
                    <p className="text-sm text-[#555] mb-6">Из какого материала изготовить корпус?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CALC_MATERIALS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setCalcMaterial(m.id); setCalcStep(hasFacadeStep ? 3 : 3); }}
                          className={`flex items-center justify-between p-5 border-2 transition-all duration-200 hover:border-[#111] text-left ${
                            calcMaterial === m.id ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white"
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-semibold mb-0.5">{m.label}</p>
                            <p className={`text-[11px] ${calcMaterial === m.id ? "text-white/50" : "text-[#999]"}`}>{m.desc}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ml-4 ${
                            calcMaterial === m.id ? "border-white bg-white" : "border-[#ddd]"
                          }`}>
                            {calcMaterial === m.id && <Icon name="Check" size={14} className="text-[#111]" />}
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setCalcStep(1)} className="mt-6 flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors">
                      <Icon name="ArrowLeft" size={14} /> Назад
                    </button>
                  </div>
                )}

                {/* STEP 3 — фасад (если есть) */}
                {calcStep === 3 && hasFacadeStep && (
                  <div>
                    <p className="text-sm text-[#555] mb-6">Выберите тип фасада</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(CALC_FACADES[calcType] || []).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => { setCalcFacade(f.id); setCalcStep(4); }}
                          className={`p-5 border-2 transition-all duration-200 hover:border-[#111] text-left ${
                            calcFacade === f.id ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white"
                          }`}
                        >
                          <p className="text-[13px] font-semibold">{f.label}</p>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setCalcStep(2)} className="mt-6 flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors">
                      <Icon name="ArrowLeft" size={14} /> Назад
                    </button>
                  </div>
                )}

                {/* STEP 3 or 4 — размеры и опции */}
                {calcStep === (hasFacadeStep ? 4 : 3) && (
                  <div className="space-y-7">
                    <p className="text-sm text-[#555]">Укажите размеры и дополнительные опции</p>

                    {/* Размеры */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {[
                        { label: "Ширина", value: calcWidth, set: setCalcWidth, min: 60, max: 400, step: 10, unit: "см" },
                        { label: "Высота", value: calcHeight, set: setCalcHeight, min: 60, max: 280, step: 5, unit: "см" },
                        { label: "Глубина", value: calcDepth, set: setCalcDepth, min: 30, max: 90, step: 5, unit: "см" },
                      ].map(({ label, value, set, min, max, step, unit }) => (
                        <div key={label} className="bg-white border border-[#e8e8e8] p-5">
                          <div className="flex justify-between mb-3">
                            <p className="text-[11px] tracking-widest uppercase font-semibold">{label}</p>
                            <span className="text-sm font-semibold text-[#111]">{value} {unit}</span>
                          </div>
                          <input type="range" min={min} max={max} step={step} value={value}
                            onChange={(e) => set(Number(e.target.value))} className="w-full" />
                          <div className="flex justify-between text-[10px] text-[#bbb] mt-1">
                            <span>{min} {unit}</span><span>{max} {unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Доп. опции */}
                    {availableExtras.length > 0 && (
                      <div>
                        <p className="text-[11px] tracking-widest uppercase font-semibold mb-4">Дополнительные опции</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableExtras.map((e) => (
                            <button
                              key={e.id}
                              onClick={() => toggleExtra(e.id)}
                              className={`flex items-center justify-between p-4 border transition-colors text-left ${
                                calcExtras.includes(e.id) ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white hover:border-[#111]"
                              }`}
                            >
                              <span className="text-[12px]">{e.label}</span>
                              <span className={`text-[11px] font-semibold ml-4 whitespace-nowrap ${calcExtras.includes(e.id) ? "text-white/70" : "text-[#555]"}`}>
                                +{formatPrice(e.price)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setCalcStep(hasFacadeStep ? 3 : 2)} className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors">
                        <Icon name="ArrowLeft" size={14} /> Назад
                      </button>
                      <button
                        onClick={() => setCalcDone(true)}
                        className="flex-1 bg-[#111] text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors"
                      >
                        Рассчитать стоимость
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: live summary */}
              <div className="bg-[#111] text-white p-8 self-start sticky top-20">
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3">Предварительная стоимость</p>
                <div className="font-display text-4xl font-light mb-1">
                  {calcType ? formatPrice(calcPrice()) : "—"}
                </div>
                {calcType && <p className="text-white/30 text-[11px] mb-6">уточняется при замере</p>}

                <div className="space-y-2.5 border-t border-white/10 pt-5">
                  {[
                    ["Тип", calcTypeObj?.label],
                    ["Стиль", calcStyleObj?.label],
                    ["Материал", calcMaterialObj?.label],
                    ...(hasFacadeStep ? [["Фасад", calcFacadeObj?.label]] : []),
                    calcType ? ["Размер", `${calcWidth}×${calcHeight}×${calcDepth} см`] : null,
                  ].filter(Boolean).map(([label, value]) => value && (
                    <div key={label} className="flex justify-between text-[12px]">
                      <span className="text-white/40">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                  {calcExtras.length > 0 && (
                    <div className="border-t border-white/10 pt-2.5 mt-2.5">
                      <p className="text-white/40 text-[11px] mb-2">Опции:</p>
                      {calcExtras.map((eid) => {
                        const ex = availableExtras.find((x) => x.id === eid);
                        return ex ? (
                          <div key={eid} className="flex justify-between text-[11px] text-white/60">
                            <span>{ex.label}</span>
                            <span>+{formatPrice(ex.price)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── RESULT ── */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#111] text-white p-10 md:p-14">
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-5">Итоговая стоимость</p>
                <div className="font-display text-6xl md:text-7xl font-light leading-none mb-2">
                  {formatPrice(calcPrice())}
                </div>
                <p className="text-white/30 text-sm mb-10">Цена ориентировочная, уточняется при замере</p>

                <div className="space-y-3 border-t border-white/10 pt-8 mb-10">
                  {[
                    ["Тип мебели", calcTypeObj?.label ?? "—"],
                    ["Стиль", calcStyleObj?.label ?? "—"],
                    ["Материал", calcMaterialObj?.label ?? "—"],
                    ...(hasFacadeStep ? [["Фасад", calcFacadeObj?.label ?? "—"]] : []),
                    ["Размеры (Ш×В×Г)", `${calcWidth}×${calcHeight}×${calcDepth} см`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-white/40">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                  {calcExtras.length > 0 && calcExtras.map((eid) => {
                    const ex = availableExtras.find((x) => x.id === eid);
                    return ex ? (
                      <div key={eid} className="flex justify-between text-sm text-white/60">
                        <span>+ {ex.label}</span>
                        <span>+{formatPrice(ex.price)}</span>
                      </div>
                    ) : null;
                  })}
                </div>

                <a
                  href={`https://wa.me/79181300668?text=${encodeURIComponent(
                    `Здравствуйте! Хочу заказать бесплатный замер.\n\n` +
                    `Тип мебели: ${calcTypeObj?.label ?? "—"}\n` +
                    `Стиль: ${calcStyleObj?.label ?? "—"}\n` +
                    `Материал: ${calcMaterialObj?.label ?? "—"}\n` +
                    (hasFacadeStep ? `Фасад: ${calcFacadeObj?.label ?? "—"}\n` : "") +
                    `Размеры: ${calcWidth}×${calcHeight}×${calcDepth} см\n` +
                    (calcExtras.length > 0 ? `Опции: ${calcExtras.map(eid => availableExtras.find(x => x.id === eid)?.label).filter(Boolean).join(", ")}\n` : "") +
                    `\nПримерная стоимость: ${formatPrice(calcPrice())}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-[#111] py-3.5 text-[11px] tracking-widest uppercase hover:bg-[#f0f0f0] transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="MessageCircle" size={15} />
                  Заказать бесплатный замер
                </a>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-white border border-[#e8e8e8] p-8 flex-1">
                  <Icon name="CheckCircle" size={32} className="text-[#111] mb-4" />
                  <h3 className="font-display text-2xl font-light mb-3">Что входит в стоимость?</h3>
                  <ul className="space-y-2.5 text-[13px] text-[#555]">
                    {[
                      "Выезд замерщика бесплатно",
                      "Разработка 3D-проекта",
                      "Изготовление на нашем производстве",
                      "Доставка и подъём",
                      "Профессиональная сборка",
                      "Гарантия 2 года на изделие",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Icon name="Check" size={14} className="text-[#111] mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={calcReset}
                  className="border border-[#ddd] py-3.5 text-[11px] tracking-widest uppercase hover:border-[#111] transition-colors"
                >
                  Рассчитать другую мебель
                </button>
              </div>
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
                Компания Merta основана Вадиновым Степаном Николаевичем. Мы создаём мебель, которая отражает личность своего владельца — строгие линии, честные материалы, долгий срок службы.
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
              value: "Вадинов Степан Николаевич",
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

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />

          {/* Desktop: right drawer | Mobile: bottom sheet */}
          <div className="absolute bg-white flex flex-col bottom-0 left-0 right-0 rounded-t-xl cart-open-mobile sm:bottom-0 sm:top-auto sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 sm:rounded-xl cart-open shadow-2xl">
            {/* Handle — only mobile */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 flex-shrink-0">
              <div className="w-8 h-1 bg-[#ddd] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-[#eee] flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-light">Корзина</h3>
                {cartCount > 0 && (
                  <span className="bg-[#111] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-[10px] tracking-wider uppercase text-[#bbb] hover:text-[#e33] transition-colors">
                    Очистить
                  </button>
                )}
                <button onClick={() => setCartOpen(false)} className="p-1 -mr-1">
                  <Icon name="X" size={18} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="px-4 py-3 sm:px-5">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#ccc] gap-3 py-8">
                  <Icon name="ShoppingBag" size={32} />
                  <p className="text-[11px] tracking-widest uppercase">Корзина пуста</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-center border-b border-[#f5f5f5] pb-3">
                      <img src={item.product.img} alt={item.product.name} className="w-12 h-12 object-cover bg-[#eee] flex-shrink-0 rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{item.product.name}</p>
                        <p className="text-[10px] text-[#999] mt-0.5">{item.product.category}</p>
                        <p className="text-sm font-semibold mt-0.5">{formatPrice(item.product.price * item.qty)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-[#ccc] hover:text-[#111] transition-colors p-1.5 -mr-1 flex-shrink-0">
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="px-4 py-3 sm:px-5 sm:py-4 border-t border-[#eee] flex-shrink-0 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] tracking-widest uppercase text-[#999]">Итого</span>
                  <span className="font-display text-lg">{formatPrice(cartTotal)}</span>
                </div>
                <button className="w-full bg-[#111] text-white py-3 text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors">
                  Оформить заказ
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}