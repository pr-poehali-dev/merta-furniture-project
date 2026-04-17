import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

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

export default function Calculator() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const calcTypeObj = CALC_TYPES.find((t) => t.id === calcType);
  const calcStyleObj = (CALC_STYLES[calcType] || CALC_STYLES.kitchen)?.find((s) => s.id === calcStyle);
  const calcMaterialObj = CALC_MATERIALS.find((m) => m.id === calcMaterial);
  const calcFacadeObj = (CALC_FACADES[calcType] || CALC_FACADES.kitchen)?.find((f) => f.id === calcFacade);
  const availableExtras = EXTRAS_BY_TYPE[calcType] || [];
  const hasFacadeStep = !!CALC_FACADES[calcType];
  const stepLabels = ["Тип мебели", "Стиль", "Материал", ...(hasFacadeStep ? ["Фасад"] : []), "Размеры и опции"];

  const formatPrice = (n: number) =>
    n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

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

      {/* ── CALCULATOR BODY ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-16">
        {!calcDone ? (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Form */}
            <div className="lg:col-span-2 pb-24 lg:pb-0">
              {/* Progress */}
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
                      <div className={`w-8 md:w-14 h-px mx-2 flex-shrink-0 ${i < calcStep ? "bg-[#111]" : "bg-[#ddd]"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* STEP 0 */}
              {calcStep === 0 && (
                <div>
                  <p className="text-sm text-[#555] mb-6">Выберите тип мебели, которую хотите заказать</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CALC_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setCalcType(t.id); setCalcStyle(""); setCalcFacade(""); setCalcStep(1); }}
                        className={`flex flex-col items-center gap-3 p-4 md:p-5 border-2 transition-all duration-200 hover:border-[#111] group ${
                          calcType === t.id ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white text-[#111]"
                        }`}
                      >
                        <Icon name={t.icon} size={26} className={calcType === t.id ? "text-white" : "text-[#666] group-hover:text-[#111]"} fallback="Package" />
                        <span className="text-[11px] tracking-wider uppercase font-semibold">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 1 */}
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
                        <span className="text-[14px] font-semibold mb-1">{s.label}</span>
                        <span className={`text-[10px] tracking-wider ${calcStyle === s.id ? "text-white/50" : "text-[#999]"}`}>коэф. {s.coef.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCalcStep(0)} className="mt-6 flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors">
                    <Icon name="ArrowLeft" size={14} /> Назад
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {calcStep === 2 && (
                <div>
                  <p className="text-sm text-[#555] mb-6">Из какого материала изготовить корпус?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CALC_MATERIALS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setCalcMaterial(m.id); setCalcStep(3); }}
                        className={`flex items-center justify-between p-3 sm:p-5 border-2 transition-all duration-200 hover:border-[#111] text-left ${
                          calcMaterial === m.id ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white"
                        }`}
                      >
                        <div>
                          <p className="text-[14px] font-semibold mb-0.5">{m.label}</p>
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

              {/* STEP 3 — фасад */}
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
                        <p className="text-[14px] font-semibold">{f.label}</p>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCalcStep(2)} className="mt-6 flex items-center gap-2 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors">
                    <Icon name="ArrowLeft" size={14} /> Назад
                  </button>
                </div>
              )}

              {/* STEP 3 or 4 — размеры */}
              {calcStep === (hasFacadeStep ? 4 : 3) && (
                <div className="space-y-7">
                  <p className="text-sm text-[#555]">Укажите размеры и дополнительные опции</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { label: "Ширина", value: calcWidth, set: setCalcWidth, min: 60, max: 400, step: 10 },
                      { label: "Высота", value: calcHeight, set: setCalcHeight, min: 60, max: 280, step: 5 },
                      { label: "Глубина", value: calcDepth, set: setCalcDepth, min: 30, max: 90, step: 5 },
                    ].map(({ label, value, set, min, max, step }) => (
                      <div key={label} className="bg-white border border-[#e8e8e8] p-5">
                        <div className="flex justify-between mb-3">
                          <p className="text-[11px] tracking-widest uppercase font-semibold">{label}</p>
                          <span className="text-sm font-semibold">{value} см</span>
                        </div>
                        <input type="range" min={min} max={max} step={step} value={value}
                          onChange={(e) => set(Number(e.target.value))} className="w-full" />
                        <div className="flex justify-between text-[10px] text-[#bbb] mt-1">
                          <span>{min} см</span><span>{max} см</span>
                        </div>
                      </div>
                    ))}
                  </div>

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
                            <span className="text-[13px]">{e.label}</span>
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
                      className="flex-1 bg-[#111] text-white py-4 text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors"
                    >
                      Рассчитать стоимость
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — live summary */}
            <div className="hidden lg:block bg-[#111] text-white p-8 self-start sticky top-20">
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
                ].filter(Boolean).map((row) => {
                  const [label, value] = row as [string, string | undefined];
                  return value ? (
                    <div key={label} className="flex justify-between text-[12px]">
                      <span className="text-white/40">{label}</span>
                      <span>{value}</span>
                    </div>
                  ) : null;
                })}
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

          {/* Mobile price bar */}
          {calcType && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/40">Стоимость</p>
                <p className="font-display text-2xl font-light">{formatPrice(calcPrice())}</p>
              </div>
              <p className="text-white/30 text-[10px]">уточняется при замере</p>
            </div>
          )}
          </>
        ) : (
          /* ── RESULT ── */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#111] text-white p-5 md:p-10 lg:p-14">
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-5">Итоговая стоимость</p>
              <div className="font-display text-4xl sm:text-6xl md:text-7xl font-light leading-none mb-2">
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
                {calcExtras.map((eid) => {
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
              <div className="bg-white border border-[#e8e8e8] p-5 sm:p-8 flex-1">
                <Icon name="CheckCircle" size={32} className="text-[#111] mb-4" />
                <h3 className="font-display text-2xl font-light mb-4">Что входит в стоимость?</h3>
                <ul className="space-y-3 text-[13px] text-[#555]">
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
                className="border border-[#ddd] py-3.5 text-[11px] tracking-widest uppercase hover:border-[#111] hover:bg-[#111] hover:text-white transition-colors"
              >
                Рассчитать другую мебель
              </button>
            </div>
          </div>
        )}
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