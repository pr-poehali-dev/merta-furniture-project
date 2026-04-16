import { useState, useEffect } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Catalog filters
  const [filterCategory, setFilterCategory] = useState("Все");
  const [filterMaterial, setFilterMaterial] = useState("Все");
  const [filterMaxPrice, setFilterMaxPrice] = useState(300000);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Calculator
  const [calcWidth, setCalcWidth] = useState(200);
  const [calcHeight, setCalcHeight] = useState(220);
  const [calcDepth, setCalcDepth] = useState(60);
  const [calcMaterial, setCalcMaterial] = useState("МДФ");
  const [calcType, setCalcType] = useState("Кухня");

  const navLinks = [
    { href: "#home", label: "Главная" },
    { href: "#catalog", label: "Каталог" },
    { href: "#recommendations", label: "Рекомендации" },
    { href: "#calculator", label: "Калькулятор" },
    { href: "#about", label: "О нас" },
    { href: "#contacts", label: "Контакты" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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

  const calcPrice = () => {
    const area = (calcWidth * calcHeight) / 10000;
    const materialCoef =
      calcMaterial === "Массив" ? 3.2 : calcMaterial === "МДФ" ? 2.0 : 1.5;
    const typeCoef =
      calcType === "Кухня"
        ? 1.4
        : calcType === "Шкаф"
        ? 1.0
        : calcType === "Спальня"
        ? 1.2
        : 1.1;
    const depthCoef = calcDepth > 60 ? 1.15 : 1.0;
    return Math.round(area * materialCoef * typeCoef * depthCoef * 85000);
  };

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
    <div className="min-h-screen bg-[#f9f9f7] font-body text-[#111]">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? "navbar-scrolled" : "navbar-transparent"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          <button
            onClick={() => scrollTo("#home")}
            className={`font-display text-2xl font-semibold tracking-widest transition-colors duration-500 ${scrolled ? "text-white" : "text-[#111]"}`}
          >
            MERTA
          </button>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className={`text-[11px] tracking-widest uppercase font-body transition-colors duration-500 ${
                  scrolled ? "text-[#aaa] hover:text-white" : "text-[#555] hover:text-[#111]"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
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

        <div className="relative z-10 flex flex-col items-start justify-center flex-1 max-w-7xl mx-auto px-5 md:px-10 pt-28 pb-20">
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
              onClick={() => scrollTo("#calculator")}
              className="border border-white text-white px-8 py-3.5 text-[11px] tracking-widest uppercase hover:bg-white hover:text-[#111] transition-colors duration-300"
            >
              Рассчитать стоимость
            </button>
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
            <span key={i} className="text-[10px] tracking-[0.3em] uppercase mx-10 opacity-70">
              {item} <span className="mx-5 opacity-30">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── RECOMMENDATIONS ── */}
      <section id="recommendations" className="py-24 max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Редакция выбирает</p>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light">Рекомендации</h2>
          </div>
          <button
            onClick={() => scrollTo("#catalog")}
            className="hidden md:flex items-center gap-2 text-[11px] tracking-widest uppercase border-b border-[#111] pb-0.5 hover:opacity-40 transition-opacity"
          >
            Весь каталог <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RECOMMENDATIONS.map((p) => (
            <div key={p.id} className="product-card group cursor-pointer">
              <div className="overflow-hidden aspect-[4/3] bg-[#eee] mb-4">
                <img src={p.img} alt={p.name} className="card-img w-full h-full object-cover" />
              </div>
              <p className="text-[10px] tracking-widest uppercase text-[#999] mb-1">{p.category} · {p.material}</p>
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-display text-2xl font-light">{p.name}</h3>
                <p className="font-body text-sm font-semibold whitespace-nowrap ml-4">от {formatPrice(p.price)}</p>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="w-full border border-[#111] py-2.5 text-[11px] tracking-widest uppercase hover:bg-[#111] hover:text-white transition-colors duration-300"
              >
                В корзину
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section id="catalog" className="bg-[#f2f2f0] py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="mb-14">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Наши изделия</p>
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light">Каталог</h2>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 md:p-8 mb-10 border border-[#e8e8e8]">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#bbb] mb-6">Фильтр товаров</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-[11px] tracking-widest uppercase mb-3 font-semibold">Тип мебели</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterCategory(c)}
                      className={`px-3 py-1.5 text-[11px] tracking-wider border transition-colors ${
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
                      className={`px-3 py-1.5 text-[11px] tracking-wider border transition-colors ${
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
          </div>

          {/* Products */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[#bbb]">
              <Icon name="PackageOpen" size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-[11px] tracking-widest uppercase">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="p-5">
                    <p className="text-[10px] tracking-widest uppercase text-[#999] mb-1">{p.category} · {p.material}</p>
                    <h3 className="font-display text-2xl font-light mb-3">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="font-body font-semibold text-sm">от {formatPrice(p.price)}</p>
                      <button
                        onClick={() => addToCart(p)}
                        className="flex items-center gap-1.5 text-[11px] tracking-wider uppercase border border-[#111] px-3 py-1.5 hover:bg-[#111] hover:text-white transition-colors duration-300"
                      >
                        <Icon name="Plus" size={12} /> В корзину
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="calculator" className="py-24 max-w-7xl mx-auto px-5 md:px-10">
        <div className="mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Онлайн-расчёт</p>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light">Калькулятор цены</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Type */}
            <div>
              <p className="text-[11px] tracking-widest uppercase mb-3 font-semibold">Тип мебели</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Кухня", "Шкаф", "Спальня", "Диван"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCalcType(t)}
                    className={`py-2.5 text-[11px] tracking-wider border transition-colors ${
                      calcType === t ? "bg-[#111] text-white border-[#111]" : "border-[#ddd] hover:border-[#111]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <p className="text-[11px] tracking-widest uppercase mb-3 font-semibold">Материал</p>
              <div className="grid grid-cols-3 gap-2">
                {["МДФ", "ЛДСП", "Массив"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setCalcMaterial(m)}
                    className={`py-2.5 text-[11px] tracking-wider border transition-colors ${
                      calcMaterial === m ? "bg-[#111] text-white border-[#111]" : "border-[#ddd] hover:border-[#111]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Width */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[11px] tracking-widest uppercase font-semibold">Ширина</p>
                <span className="text-sm text-[#555]">{calcWidth} см</span>
              </div>
              <input type="range" min={60} max={400} step={10} value={calcWidth} onChange={(e) => setCalcWidth(Number(e.target.value))} />
              <div className="flex justify-between text-[10px] text-[#bbb] mt-1"><span>60 см</span><span>400 см</span></div>
            </div>

            {/* Height */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[11px] tracking-widest uppercase font-semibold">Высота</p>
                <span className="text-sm text-[#555]">{calcHeight} см</span>
              </div>
              <input type="range" min={60} max={280} step={5} value={calcHeight} onChange={(e) => setCalcHeight(Number(e.target.value))} />
              <div className="flex justify-between text-[10px] text-[#bbb] mt-1"><span>60 см</span><span>280 см</span></div>
            </div>

            {/* Depth */}
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-[11px] tracking-widest uppercase font-semibold">Глубина</p>
                <span className="text-sm text-[#555]">{calcDepth} см</span>
              </div>
              <input type="range" min={30} max={90} step={5} value={calcDepth} onChange={(e) => setCalcDepth(Number(e.target.value))} />
              <div className="flex justify-between text-[10px] text-[#bbb] mt-1"><span>30 см</span><span>90 см</span></div>
            </div>
          </div>

          {/* Result */}
          <div className="flex flex-col">
            <div className="bg-[#111] text-white p-8 md:p-12 flex-1 flex flex-col justify-between min-h-[420px]">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">Ориентировочная стоимость</p>
                <div className="font-display text-5xl md:text-6xl font-light leading-none">
                  {formatPrice(calcPrice())}
                </div>
                <p className="text-white/30 text-xs mt-3">Итоговая цена уточняется при замере</p>
              </div>

              <div className="mt-10 space-y-3 border-t border-white/10 pt-8">
                {[
                  ["Тип", calcType],
                  ["Материал", calcMaterial],
                  ["Ширина × Высота × Глубина", `${calcWidth} × ${calcHeight} × ${calcDepth} см`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-white/40">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>

              <button className="mt-8 bg-white text-[#111] py-3.5 text-[11px] tracking-widest uppercase hover:bg-[#f0f0f0] transition-colors">
                Заказать бесплатный замер
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="bg-[#111] text-white py-24">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">Наша история</p>
              <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light leading-tight mb-8">
                О компании<br /><em>Merta</em>
              </h2>
              <p className="text-white/55 leading-relaxed mb-5 text-[15px]">
                Компания Merta основана Вадиновым Степаном Николаевичем. Мы создаём мебель, которая отражает личность своего владельца — строгие линии, честные материалы, долгий срок службы.
              </p>
              <p className="text-white/55 leading-relaxed mb-10 text-[15px]">
                Каждый предмет изготавливается по индивидуальным параметрам на нашем производстве. Мы работаем с МДФ, ЛДСП и натуральным массивом дерева, подбирая материал под задачу и бюджет.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[["7+", "Лет опыта"], ["1200+", "Объектов"], ["100%", "Гарантия"]].map(([num, label]) => (
                  <div key={label}>
                    <p className="font-display text-4xl font-light mb-1">{num}</p>
                    <p className="text-white/35 text-[10px] tracking-wider uppercase">{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden aspect-square">
              <img
                src="https://cdn.poehali.dev/projects/1bc0b21f-3ead-42a5-8908-be46fa1704ea/files/5f94a626-e3c2-4f82-af58-e90a0b5e423b.jpg"
                alt="Merta мастерская"
                className="w-full h-full object-cover opacity-60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="py-16 bg-[#f2f2f0]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-5">Следите за нами</p>
          <a
            href="https://instagram.com/kuhni_merta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-display text-3xl md:text-4xl font-light hover:opacity-40 transition-opacity"
          >
            <Icon name="Instagram" size={30} />
            @kuhni_merta
          </a>
        </div>
      </section>

      {/* ── CONTACTS ── */}
      <section id="contacts" className="py-24 max-w-7xl mx-auto px-5 md:px-10">
        <div className="mb-14">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Напишите нам</p>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light">Контакты</h2>
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
              <div className="w-8 h-px bg-[#111] mb-3" />
              <p className="text-[10px] tracking-widest uppercase text-[#999]">{label}</p>
              {href ? (
                <a href={href} className="font-display text-xl font-light hover:opacity-40 transition-opacity break-all">
                  {value}
                </a>
              ) : (
                <p className="font-display text-xl font-light">{value}</p>
              )}
            </div>
          ))}
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
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white cart-open flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#eee]">
              <h3 className="font-display text-2xl font-light">Корзина</h3>
              <button onClick={() => setCartOpen(false)}>
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#ccc] gap-4">
                  <Icon name="ShoppingBag" size={40} />
                  <p className="text-[11px] tracking-widest uppercase">Корзина пуста</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-start border-b border-[#f0f0f0] pb-4">
                      <img src={item.product.img} alt={item.product.name} className="w-16 h-16 object-cover bg-[#eee] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-lg font-light truncate">{item.product.name}</p>
                        <p className="text-[10px] text-[#999] tracking-wider">{item.product.category} · {item.product.material}</p>
                        <p className="text-sm font-semibold mt-1">{formatPrice(item.product.price * item.qty)}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-[#ccc] hover:text-[#111] transition-colors flex-shrink-0">
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[#eee]">
                <div className="flex justify-between mb-4">
                  <span className="text-[11px] tracking-widest uppercase">Итого</span>
                  <span className="font-display text-xl">{formatPrice(cartTotal)}</span>
                </div>
                <button className="w-full bg-[#111] text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors">
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
