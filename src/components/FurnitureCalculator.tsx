import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import FurniturePreview from "@/components/FurniturePreview";
import {
  FURNITURE_TYPES, SHAPES, SIZE_RANGES, MATERIALS, COLORS, FACADES,
  TEXTURES, FILLING, EXTRAS, calcPrice,
  type CalcState,
} from "@/data/calculator";

// ─── ШАГИ ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "type",     label: "Тип",       icon: "LayoutGrid"   },
  { id: "shape",    label: "Форма",     icon: "CornerDownRight" },
  { id: "size",     label: "Размеры",   icon: "Maximize2"    },
  { id: "material", label: "Материал",  icon: "Layers"       },
  { id: "color",    label: "Цвет",      icon: "Palette"      },
  { id: "facade",   label: "Фасад",     icon: "Square"       },
  { id: "filling",  label: "Наполнение",icon: "Package"      },
  { id: "result",   label: "Итог",      icon: "CheckCircle"  },
];

const INIT: CalcState = {
  type: "", shape: "",
  width: 200, height: 220, depth: 60,
  material: "", color: "", facade: "", texture: "smooth",
  filling: {}, extras: [],
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });
}

// ─── ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ───────────────────────────────────────────────

function CardBtn({ active, onClick, children, className = "" }: {
  active: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative border-2 transition-all duration-200 text-left group
        ${active
          ? "border-[#111] bg-[#111] text-white"
          : "border-[#e5e5e5] bg-white text-[#111] hover:border-[#bbb]"
        } ${className}`}
    >
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] tracking-[0.25em] uppercase text-[#999] mb-4 font-semibold">{children}</p>;
}

function SliderField({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="bg-white border border-[#e8e8e8] p-4">
      <div className="flex justify-between mb-3">
        <span className="text-[11px] tracking-widest uppercase font-semibold text-[#555]">{label}</span>
        <span className="text-sm font-bold text-[#111]">{value} {unit}</span>
      </div>
      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))} className="w-full" />
        <div className="flex justify-between text-[10px] text-[#bbb] mt-1">
          <span>{min}</span>
          <span className="text-[#888] font-medium">{Math.round(pct)}%</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────

export default function FurnitureCalculator() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<CalcState>(INIT);
  const [done, setDone] = useState(false);

  const upd = useCallback((patch: Partial<CalcState>) => setS(prev => ({ ...prev, ...patch })), []);

  const typeObj     = FURNITURE_TYPES.find(t => t.id === s.type);
  const shapes      = s.type ? (SHAPES[s.type] ?? []) : [];
  const shapeObj    = shapes.find(sh => sh.id === s.shape);
  const ranges      = SIZE_RANGES[s.type] ?? SIZE_RANGES.default;
  const matObj      = MATERIALS.find(m => m.id === s.material);
  const colors      = s.material ? (COLORS[s.material] ?? COLORS.default) : [];
  const colorObj    = colors.find(c => c.id === s.color);
  const facades     = s.type ? (FACADES[s.type] ?? FACADES.default) : FACADES.default;
  const facadeObj   = facades.find(f => f.id === s.facade);
  const fillingDefs = s.type ? (FILLING[s.type] ?? FILLING.default) : [];
  const extrasDefs  = s.type ? (EXTRAS[s.type] ?? []) : [];

  const totalFilling = Object.entries(s.filling).reduce((sum, [id, qty]) => {
    return sum + (fillingDefs.find(f => f.id === id)?.price ?? 0) * qty;
  }, 0);
  const totalExtras = s.extras.reduce((sum, eid) => {
    return sum + (extrasDefs.find(e => e.id === eid)?.price ?? 0);
  }, 0);

  const price = calcPrice(s);

  const goNext = () => setStep(p => Math.min(p + 1, STEPS.length - 1));
  const goPrev = () => setStep(p => Math.max(p - 1, 0));

  // Выбор типа — сбрасываем зависимые поля
  const pickType = (id: string) => {
    const ranges = SIZE_RANGES[id] ?? SIZE_RANGES.default;
    upd({
      type: id, shape: "",
      width:  Math.round((ranges.w[0] + ranges.w[1]) / 2 / 10) * 10,
      height: Math.round((ranges.h[0] + ranges.h[1]) / 2 / 5)  * 5,
      depth:  Math.round((ranges.d[0] + ranges.d[1]) / 2 / 5)  * 5,
      material: "", color: "", facade: "", filling: {}, extras: [],
    });
    setStep(1);
  };

  const pickMaterial = (id: string) => {
    const firstColor = (COLORS[id] ?? COLORS.default)[0]?.id ?? "";
    upd({ material: id, color: firstColor });
  };

  const setFilling = (id: string, qty: number) => {
    setS(prev => {
      const next = { ...prev.filling };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return { ...prev, filling: next };
    });
  };

  const toggleExtra = (id: string) => {
    setS(prev => ({
      ...prev,
      extras: prev.extras.includes(id)
        ? prev.extras.filter(e => e !== id)
        : [...prev.extras, id],
    }));
  };

  // Валидация перед переходом
  const canGoNext = () => {
    if (step === 0) return !!s.type;
    if (step === 1) return !!s.shape;
    if (step === 3) return !!s.material;
    if (step === 4) return !!s.color;
    if (step === 5) return !!s.facade;
    return true;
  };

  // ─── PREVIEW ────────────────────────────────────────────────────────────────

  const previewMat = s.material || "default";
  const previewColor = colorObj?.hex ?? undefined;

  // ─── РЕЗУЛЬТАТ ──────────────────────────────────────────────────────────────

  if (done) {
    const waText = encodeURIComponent(
      `Здравствуйте! Хочу заказать ${typeObj?.label ?? "мебель"}.\n` +
      `Форма: ${shapeObj?.label ?? "—"}\n` +
      `Размеры: ${s.width}×${s.height}×${s.depth} см\n` +
      `Материал: ${matObj?.label ?? "—"}, цвет: ${colorObj?.label ?? "—"}\n` +
      `Фасад: ${facadeObj?.label ?? "—"}\n` +
      `Ориентировочная стоимость: ${fmt(price)}`
    );

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white border border-[#e8e8e8]">
        {/* Левая — тёмная, цена */}
        <div className="bg-[#111] text-white p-8 md:p-12">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">Итоговая стоимость</p>
          <div className="font-display text-5xl md:text-6xl font-light leading-none mb-2">{fmt(price)}</div>
          <p className="text-white/30 text-xs mb-8">Цена ориентировочная, уточняется при замере</p>

          <div className="space-y-2 border-t border-white/10 pt-6 mb-8 text-sm">
            {[
              ["Тип",      typeObj?.label],
              ["Форма",    shapeObj?.label],
              ["Размеры",  `${s.width}×${s.height}×${s.depth} см`],
              ["Материал", matObj?.label],
              ["Цвет",     colorObj?.label],
              ["Фасад",    facadeObj?.label],
            ].filter(([,v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-white/40">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
            {totalFilling > 0 && (
              <div className="flex justify-between">
                <span className="text-white/40">Наполнение</span>
                <span className="font-medium">+{fmt(totalFilling)}</span>
              </div>
            )}
            {totalExtras > 0 && (
              <div className="flex justify-between">
                <span className="text-white/40">Опции</span>
                <span className="font-medium">+{fmt(totalExtras)}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <a href={`https://wa.me/79181300668?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-white text-[#111] py-3.5 text-[11px] tracking-widest uppercase font-semibold hover:bg-[#f0f0f0] transition-colors"
            >
              <Icon name="MessageCircle" size={15} />
              Заказать через WhatsApp
            </a>
            <a href="tel:+79181300668"
              className="flex items-center justify-center gap-2 w-full border border-white/20 py-3.5 text-[11px] tracking-widest uppercase hover:border-white/50 transition-colors"
            >
              <Icon name="Phone" size={15} />
              Позвонить
            </a>
            <button onClick={() => { setDone(false); setStep(0); setS(INIT); }}
              className="w-full text-white/30 py-2 text-[10px] tracking-widest uppercase hover:text-white/60 transition-colors"
            >
              Начать заново
            </button>
          </div>
        </div>

        {/* Правая — превью + что входит */}
        <div className="flex flex-col">
          <div className="bg-[#f5f5f3] p-8 flex-1 flex items-center justify-center">
            <div className="w-full max-w-xs">
              <FurniturePreview
                type={s.type} material={previewMat}
                color={previewColor}
                style={s.shape}
                facade={s.facade}
                texture={s.texture}
                filling={s.filling}
                extras={s.extras}
                width={s.width} height={s.height} depth={s.depth}
              />
            </div>
          </div>
          <div className="p-6 border-t border-[#e8e8e8]">
            <p className="text-[10px] tracking-widest uppercase font-semibold text-[#999] mb-3">Что входит</p>
            <ul className="space-y-2 text-[13px] text-[#555]">
              {["Выезд замерщика бесплатно","Изготовление на заказ","Доставка по городу","Профессиональная сборка","Гарантия 2 года"].map(t => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="Check" size={14} className="text-[#111] flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ─── ОСНОВНОЙ КОНСТРУКТОР ────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
      {/* ── ЛЕВАЯ: форма ─────────────────────────────────────────── */}
      <div className="lg:col-span-2 bg-white border border-[#e8e8e8]">

        {/* Прогресс */}
        <div className="border-b border-[#f0f0f0] px-6 py-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {STEPS.slice(0, -1).map((st, i) => {
              const done  = i < step;
              const cur   = i === step;
              const avail = i <= step;
              return (
                <div key={st.id} className="flex items-center flex-shrink-0">
                  <button
                    disabled={!avail}
                    onClick={() => avail && setStep(i)}
                    className={`flex flex-col items-center gap-1 transition-colors px-1 ${avail ? "cursor-pointer" : "cursor-default opacity-40"}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all
                      ${done ? "bg-[#111] border-[#111] text-white"
                      : cur  ? "border-[#111] text-[#111] bg-white"
                             : "border-[#ddd] text-[#bbb] bg-white"}`}
                    >
                      {done ? <Icon name="Check" size={11} /> : i+1}
                    </div>
                    <span className={`hidden md:block text-[9px] tracking-wider uppercase whitespace-nowrap ${cur ? "text-[#111] font-bold" : done ? "text-[#555]" : "text-[#bbb]"}`}>
                      {st.label}
                    </span>
                  </button>
                  {i < STEPS.length - 2 && (
                    <div className={`w-6 md:w-10 h-px mx-1 flex-shrink-0 transition-colors ${done ? "bg-[#111]" : "bg-[#ddd]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Контент шага */}
        <div className="p-6 md:p-8 min-h-[360px]">

          {/* ШАГ 0: Тип */}
          {step === 0 && (
            <div>
              <SectionTitle>Выберите тип мебели</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FURNITURE_TYPES.map(t => (
                  <CardBtn key={t.id} active={s.type === t.id} onClick={() => pickType(t.id)}
                    className="flex flex-col items-center gap-2.5 p-4"
                  >
                    <Icon name={t.icon as "Home"} size={24} fallback="Package"
                      className={s.type === t.id ? "text-white" : "text-[#888]"} />
                    <span className="text-[11px] tracking-wider uppercase font-semibold text-center">{t.label}</span>
                    <span className={`text-[10px] ${s.type === t.id ? "text-white/50" : "text-[#bbb]"}`}>
                      от {fmt(t.base)}
                    </span>
                  </CardBtn>
                ))}
              </div>
            </div>
          )}

          {/* ШАГ 1: Форма */}
          {step === 1 && (
            <div>
              <SectionTitle>Форма {typeObj?.label.toLowerCase()}</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {shapes.map(sh => (
                  <CardBtn key={sh.id} active={s.shape === sh.id}
                    onClick={() => { upd({ shape: sh.id }); goNext(); }}
                    className="flex flex-col gap-2 p-5"
                  >
                    <Icon name={sh.icon as "Home"} size={22} fallback="Square"
                      className={s.shape === sh.id ? "text-white" : "text-[#888]"} />
                    <span className="text-[13px] font-semibold">{sh.label}</span>
                    <span className={`text-[10px] ${s.shape === sh.id ? "text-white/50" : "text-[#999]"}`}>
                      коэф. ×{sh.coef.toFixed(2)}
                    </span>
                  </CardBtn>
                ))}
              </div>
            </div>
          )}

          {/* ШАГ 2: Размеры */}
          {step === 2 && (
            <div className="space-y-6">
              <SectionTitle>Укажите размеры</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SliderField label="Ширина"  value={s.width}  min={ranges.w[0]} max={ranges.w[1]} step={5}  unit="см" onChange={v => upd({ width: v  })} />
                <SliderField label="Высота"  value={s.height} min={ranges.h[0]} max={ranges.h[1]} step={5}  unit="см" onChange={v => upd({ height: v })} />
                <SliderField label="Глубина" value={s.depth}  min={ranges.d[0]} max={ranges.d[1]} step={5}  unit="см" onChange={v => upd({ depth: v  })} />
              </div>
              <div className="p-4 bg-[#f9f9f7] border border-[#ebebeb] flex items-center gap-3">
                <Icon name="Info" size={16} className="text-[#999] flex-shrink-0" />
                <p className="text-[12px] text-[#777]">Точные размеры уточнит замерщик. Здесь указываете приблизительные.</p>
              </div>
            </div>
          )}

          {/* ШАГ 3: Материал */}
          {step === 3 && (
            <div>
              <SectionTitle>Материал корпуса</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MATERIALS.map(m => (
                  <CardBtn key={m.id} active={s.material === m.id}
                    onClick={() => { pickMaterial(m.id); goNext(); }}
                    className="flex items-center justify-between p-5"
                  >
                    <div>
                      <p className="font-semibold text-[14px] mb-0.5">{m.label}</p>
                      <p className={`text-[11px] ${s.material === m.id ? "text-white/50" : "text-[#999]"}`}>{m.desc}</p>
                    </div>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center ml-4
                      ${s.material === m.id ? "border-white bg-white" : "border-[#ddd]"}`}>
                      {s.material === m.id && <Icon name="Check" size={14} className="text-[#111]" />}
                    </div>
                  </CardBtn>
                ))}
              </div>
            </div>
          )}

          {/* ШАГ 4: Цвет */}
          {step === 4 && (
            <div>
              <SectionTitle>Цвет — {matObj?.label}</SectionTitle>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
                {colors.map(c => (
                  <button key={c.id} onClick={() => upd({ color: c.id })}
                    className={`flex flex-col items-center gap-2 p-3 border-2 transition-all
                      ${s.color === c.id ? "border-[#111]" : "border-[#e5e5e5] hover:border-[#bbb]"}`}
                  >
                    <div className="w-10 h-10 rounded-full border border-[#00000018] shadow-sm"
                      style={{ background: c.hex }} />
                    <span className={`text-[10px] text-center leading-tight ${s.color === c.id ? "font-bold text-[#111]" : "text-[#777]"}`}>
                      {c.label}
                    </span>
                    {s.color === c.id && (
                      <Icon name="Check" size={12} className="text-[#111]" />
                    )}
                  </button>
                ))}
              </div>
              <SectionTitle>Текстура</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {TEXTURES.map(t => (
                  <CardBtn key={t.id} active={s.texture === t.id}
                    onClick={() => upd({ texture: t.id })}
                    className="flex flex-col gap-1 p-4"
                  >
                    <span className="text-[13px] font-semibold">{t.label}</span>
                    <span className={`text-[10px] ${s.texture === t.id ? "text-white/50" : "text-[#999]"}`}>
                      ×{t.coef.toFixed(2)}
                    </span>
                  </CardBtn>
                ))}
              </div>
            </div>
          )}

          {/* ШАГ 5: Фасад */}
          {step === 5 && (
            <div>
              <SectionTitle>Тип фасада</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {facades.map(f => (
                  <CardBtn key={f.id} active={s.facade === f.id}
                    onClick={() => { upd({ facade: f.id }); goNext(); }}
                    className="flex items-start justify-between p-5"
                  >
                    <div>
                      <p className="font-semibold text-[14px] mb-1">{f.label}</p>
                      <p className={`text-[12px] ${s.facade === f.id ? "text-white/50" : "text-[#999]"}`}>{f.desc}</p>
                    </div>
                    <span className={`text-[10px] ml-4 flex-shrink-0 mt-0.5 ${s.facade === f.id ? "text-white/60" : "text-[#bbb]"}`}>
                      ×{f.coef.toFixed(2)}
                    </span>
                  </CardBtn>
                ))}
              </div>
            </div>
          )}

          {/* ШАГ 6: Наполнение */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <SectionTitle>Внутреннее наполнение</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fillingDefs.map(f => {
                    const qty = s.filling[f.id] ?? 0;
                    return (
                      <div key={f.id}
                        className={`flex items-center justify-between p-4 border transition-colors
                          ${qty > 0 ? "border-[#111] bg-[#fafafa]" : "border-[#e5e5e5] bg-white"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon name={f.icon as "Home"} size={16} fallback="Square"
                            className={qty > 0 ? "text-[#111]" : "text-[#aaa]"} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium truncate">{f.label}</p>
                            <p className="text-[11px] text-[#999]">+{fmt(f.price)} / шт</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <button
                            onClick={() => setFilling(f.id, Math.max(0, qty - 1))}
                            className="w-7 h-7 border border-[#e0e0e0] flex items-center justify-center text-[#555] hover:border-[#111] transition-colors"
                          >−</button>
                          <span className="w-6 text-center text-[13px] font-bold">{qty}</span>
                          <button
                            onClick={() => setFilling(f.id, Math.min(f.max, qty + 1))}
                            className="w-7 h-7 border border-[#e0e0e0] flex items-center justify-center text-[#555] hover:border-[#111] transition-colors"
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {extrasDefs.length > 0 && (
                <div>
                  <SectionTitle>Дополнительные опции</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {extrasDefs.map(e => (
                      <button key={e.id}
                        onClick={() => toggleExtra(e.id)}
                        className={`flex items-center justify-between p-4 border text-left transition-colors
                          ${s.extras.includes(e.id) ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white hover:border-[#aaa]"}`}
                      >
                        <span className="text-[13px]">{e.label}</span>
                        <span className={`text-[11px] font-semibold ml-4 flex-shrink-0 ${s.extras.includes(e.id) ? "text-white/60" : "text-[#777]"}`}>
                          +{fmt(e.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Навигация */}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#f0f0f0]">
            {step > 0 && (
              <button onClick={goPrev}
                className="flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors"
              >
                <Icon name="ArrowLeft" size={14} /> Назад
              </button>
            )}
            <div className="flex-1" />
            {step < 6 ? (
              <button
                onClick={goNext}
                disabled={!canGoNext()}
                className={`flex items-center gap-2 px-8 py-3 text-[11px] tracking-widest uppercase font-semibold transition-colors
                  ${canGoNext()
                    ? "bg-[#111] text-white hover:bg-[#333]"
                    : "bg-[#e5e5e5] text-[#aaa] cursor-not-allowed"}`}
              >
                Далее <Icon name="ArrowRight" size={14} />
              </button>
            ) : (
              <button
                onClick={() => setDone(true)}
                className="flex items-center gap-2 px-8 py-3 bg-[#111] text-white text-[11px] tracking-widest uppercase font-semibold hover:bg-[#333] transition-colors"
              >
                Рассчитать <Icon name="Calculator" size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── ПРАВАЯ: превью + цена ─────────────────────────────────── */}
      <div className="bg-[#111] text-white self-start lg:sticky lg:top-20">
        {/* 3D превью */}
        <div className="border-b border-white/10 px-5 pt-5 pb-3">
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-3">Предварительный вид</p>
          <FurniturePreview
            type={s.type} material={previewMat}
            color={previewColor}
            style={s.shape}
            facade={s.facade}
            texture={s.texture}
            filling={s.filling}
            extras={s.extras}
            width={s.width} height={s.height} depth={s.depth}
          />
        </div>

        {/* Цена и параметры */}
        <div className="p-5 md:p-6">
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/30 mb-2">Стоимость</p>
          <div className="font-display text-3xl font-light mb-1">
            {s.type ? fmt(price) : "—"}
          </div>
          {s.type && <p className="text-white/25 text-[10px] mb-5">ориентировочно</p>}

          <div className="space-y-2 text-[12px]">
            {[
              s.type     && ["Тип",      typeObj?.label],
              s.shape    && ["Форма",    shapeObj?.label],
              s.type     && ["Размеры",  `${s.width}×${s.height}×${s.depth} см`],
              s.material && ["Материал", matObj?.label],
              s.color    && ["Цвет",     colorObj?.label],
              s.facade   && ["Фасад",    facadeObj?.label],
            ].filter(Boolean).map((row) => (
              <div key={String((row as string[])[0])} className="flex justify-between">
                <span className="text-white/35">{(row as string[])[0]}</span>
                <span className="text-white/80 text-right">{(row as string[])[1]}</span>
              </div>
            ))}

            {Object.entries(s.filling).filter(([,q]) => q > 0).length > 0 && (
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                {Object.entries(s.filling).filter(([,q]) => q > 0).map(([id, qty]) => {
                  const def = fillingDefs.find(f => f.id === id);
                  return def ? (
                    <div key={id} className="flex justify-between text-[11px]">
                      <span className="text-white/30">{def.label} ×{qty}</span>
                      <span className="text-white/50">+{fmt(def.price * qty)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}

            {s.extras.length > 0 && (
              <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                {s.extras.map(eid => {
                  const ex = extrasDefs.find(e => e.id === eid);
                  return ex ? (
                    <div key={eid} className="flex justify-between text-[11px]">
                      <span className="text-white/30">{ex.label}</span>
                      <span className="text-white/50">+{fmt(ex.price)}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}