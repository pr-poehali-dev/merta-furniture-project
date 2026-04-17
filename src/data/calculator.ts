// ─── ТИПЫ ────────────────────────────────────────────────────────────────────

export type FillItem = { id: string; label: string; icon: string; price: number; max: number };

export interface CalcState {
  type: string;
  shape: string;
  width: number;
  height: number;
  depth: number;
  material: string;
  color: string;
  facade: string;
  texture: string;
  filling: Record<string, number>; // id → количество
  extras: string[];
}

// ─── ТИП МЕБЕЛИ ──────────────────────────────────────────────────────────────

export const FURNITURE_TYPES = [
  { id: "kitchen",  label: "Кухня",        icon: "ChefHat",   base: 95000  },
  { id: "wardrobe", label: "Шкаф-купе",    icon: "Package",   base: 55000  },
  { id: "bedroom",  label: "Спальня",      icon: "Bed",       base: 85000  },
  { id: "sofa",     label: "Диван",        icon: "Sofa",      base: 65000  },
  { id: "hallway",  label: "Прихожая",     icon: "DoorOpen",  base: 45000  },
  { id: "office",   label: "Кабинет",      icon: "Monitor",   base: 70000  },
  { id: "bathroom", label: "Ванная тумба", icon: "Droplets",  base: 25000  },
  { id: "childroom",label: "Детская",      icon: "Star",      base: 80000  },
];

// ─── ФОРМЫ ────────────────────────────────────────────────────────────────────

export const SHAPES: Record<string, { id: string; label: string; icon: string; coef: number }[]> = {
  kitchen: [
    { id: "linear",  label: "Прямая",   icon: "Minus",        coef: 1.0  },
    { id: "corner",  label: "Угловая",  icon: "CornerDownRight", coef: 1.3 },
    { id: "u-shape", label: "П-образная",icon: "AlignCenter", coef: 1.55 },
    { id: "island",  label: "С островом",icon: "Square",      coef: 1.7  },
  ],
  wardrobe: [
    { id: "sliding", label: "Раздвижной", icon: "MoveHorizontal", coef: 1.0 },
    { id: "swing",   label: "Распашной",  icon: "DoorOpen",        coef: 0.9 },
    { id: "corner",  label: "Угловой",    icon: "CornerDownRight", coef: 1.3 },
    { id: "builtin", label: "Встроенный", icon: "LayoutTemplate",  coef: 1.1 },
  ],
  bedroom: [
    { id: "single",  label: "Одна кровать", icon: "Minus",         coef: 1.0 },
    { id: "double",  label: "Двуспальная",  icon: "AlignCenter",   coef: 1.2 },
    { id: "full",    label: "Спальный гарнитур", icon: "LayoutGrid", coef: 1.5 },
  ],
  sofa: [
    { id: "straight", label: "Прямой",      icon: "Minus",          coef: 1.0 },
    { id: "corner",   label: "Угловой",     icon: "CornerDownRight", coef: 1.3 },
    { id: "modular",  label: "Модульный",   icon: "LayoutGrid",     coef: 1.4 },
    { id: "ottoman",  label: "С оттоманкой",icon: "MoveHorizontal", coef: 1.15 },
  ],
  hallway: [
    { id: "compact", label: "Компактная", icon: "Minus",          coef: 0.85 },
    { id: "full",    label: "Полная",     icon: "AlignCenter",    coef: 1.0  },
    { id: "corner",  label: "Угловая",   icon: "CornerDownRight", coef: 1.2  },
  ],
  office: [
    { id: "home",      label: "Домашний",     icon: "Home",         coef: 1.0  },
    { id: "executive", label: "Руководитель", icon: "Briefcase",    coef: 1.2  },
    { id: "open",      label: "Open space",   icon: "LayoutGrid",   coef: 1.1  },
  ],
  bathroom: [
    { id: "pedestal", label: "Напольная", icon: "AlignBottom", coef: 1.0  },
    { id: "hanging",  label: "Подвесная", icon: "AlignTop",    coef: 1.1  },
    { id: "corner",   label: "Угловая",   icon: "CornerDownRight", coef: 1.15 },
  ],
  childroom: [
    { id: "junior",   label: "Школьник",      icon: "BookOpen",    coef: 1.0  },
    { id: "teen",     label: "Подросток",     icon: "Laptop",      coef: 1.05 },
    { id: "bunk",     label: "Двухъярусная",  icon: "AlignCenter", coef: 1.2  },
    { id: "baby",     label: "Малыш 0–3",     icon: "Star",        coef: 0.9  },
  ],
};

// ─── РАЗМЕРЫ (диапазоны по типу) ─────────────────────────────────────────────

export const SIZE_RANGES: Record<string, { w:[number,number]; h:[number,number]; d:[number,number] }> = {
  kitchen:  { w:[150,500], h:[200,260], d:[45,70]  },
  wardrobe: { w:[100,400], h:[180,280], d:[45,80]  },
  bedroom:  { w:[140,240], h:[60,120],  d:[160,220]},
  sofa:     { w:[150,350], h:[80,110],  d:[80,120] },
  hallway:  { w:[80,250],  h:[180,250], d:[35,55]  },
  office:   { w:[100,280], h:[72,90],   d:[60,90]  },
  bathroom: { w:[40,120],  h:[50,90],   d:[40,60]  },
  childroom:{ w:[120,220], h:[180,220], d:[45,70]  },
  default:  { w:[80,400],  h:[60,280],  d:[30,90]  },
};

// ─── МАТЕРИАЛЫ ────────────────────────────────────────────────────────────────

export const MATERIALS = [
  { id: "ldsp",       label: "ЛДСП",          desc: "Бюджетно и практично",  coef: 1.0  },
  { id: "mdf",        label: "МДФ",           desc: "Оптимальное качество",  coef: 1.45 },
  { id: "massiv",     label: "Массив дерева", desc: "Премиум, долговечность",coef: 2.4  },
  { id: "mdf_kraska", label: "МДФ + Эмаль",  desc: "Глянцевое покрытие",    coef: 1.7  },
];

// ─── ЦВЕТА ───────────────────────────────────────────────────────────────────

export const COLORS: Record<string, { id: string; label: string; hex: string; coef: number }[]> = {
  ldsp: [
    { id: "white",   label: "Белый",         hex: "#f5f5f5", coef: 1.0 },
    { id: "beige",   label: "Беж",           hex: "#e8d8b8", coef: 1.0 },
    { id: "oak",     label: "Дуб сонома",    hex: "#c8a064", coef: 1.0 },
    { id: "wenge",   label: "Венге",         hex: "#4a3020", coef: 1.0 },
    { id: "grey",    label: "Серый",         hex: "#9a9a9a", coef: 1.0 },
    { id: "walnut",  label: "Орех",          hex: "#7a4e28", coef: 1.0 },
  ],
  mdf: [
    { id: "white",   label: "Белый",         hex: "#f5f5f5", coef: 1.0 },
    { id: "grey",    label: "Серый",         hex: "#9a9a9a", coef: 1.0 },
    { id: "anthracite", label: "Антрацит",   hex: "#3a3a3a", coef: 1.0 },
    { id: "cream",   label: "Кремовый",      hex: "#f0e8d0", coef: 1.0 },
  ],
  massiv: [
    { id: "natural", label: "Натуральный",   hex: "#c07d3a", coef: 1.0 },
    { id: "light",   label: "Светлый дуб",   hex: "#d4aa70", coef: 1.0 },
    { id: "dark",    label: "Тёмный орех",   hex: "#5c3210", coef: 1.0 },
    { id: "ebony",   label: "Эбонит",        hex: "#2a1a0a", coef: 1.1 },
  ],
  mdf_kraska: [
    { id: "white",   label: "Белый глянец",  hex: "#f8f8f8", coef: 1.0 },
    { id: "black",   label: "Чёрный",        hex: "#1a1a1a", coef: 1.0 },
    { id: "sage",    label: "Шалфей",        hex: "#8a9e7c", coef: 1.0 },
    { id: "dusty",   label: "Пыльная роза",  hex: "#c8968c", coef: 1.0 },
    { id: "navy",    label: "Тёмно-синий",   hex: "#2a3e5e", coef: 1.0 },
    { id: "caramel", label: "Карамель",      hex: "#c89048", coef: 1.0 },
  ],
  default: [
    { id: "white",   label: "Белый",         hex: "#f5f5f5", coef: 1.0 },
    { id: "beige",   label: "Беж",           hex: "#e8d8b8", coef: 1.0 },
    { id: "grey",    label: "Серый",         hex: "#9a9a9a", coef: 1.0 },
    { id: "wenge",   label: "Венге",         hex: "#4a3020", coef: 1.0 },
  ],
};

// ─── ФАСАДЫ ───────────────────────────────────────────────────────────────────

export const FACADES: Record<string, { id: string; label: string; desc: string; coef: number }[]> = {
  kitchen: [
    { id: "matte",   label: "Матовый",       desc: "Нейтральный, практичный", coef: 1.0  },
    { id: "glossy",  label: "Глянцевый",     desc: "Яркий, легко чистить",    coef: 1.15 },
    { id: "wood",    label: "Под дерево",    desc: "Тёплый натуральный вид",  coef: 1.1  },
    { id: "glass",   label: "Со стеклом",    desc: "Витрина, открытость",     coef: 1.35 },
    { id: "texture", label: "Текстурный",    desc: "Рельефная поверхность",   coef: 1.2  },
  ],
  wardrobe: [
    { id: "mirror",  label: "Зеркальный",    desc: "Визуально расширяет",     coef: 1.3  },
    { id: "matte",   label: "Матовый",       desc: "Без отпечатков",          coef: 1.0  },
    { id: "glossy",  label: "Глянцевый",     desc: "Блестящий, современный",  coef: 1.15 },
    { id: "wood",    label: "Под дерево",    desc: "Тёплый, уютный",         coef: 1.1  },
  ],
  bedroom: [
    { id: "matte",   label: "Матовый",       desc: "Минималистичный",         coef: 1.0  },
    { id: "glossy",  label: "Глянцевый",     desc: "Элегантный",              coef: 1.15 },
    { id: "wood",    label: "Под дерево",    desc: "Уютный, тёплый",         coef: 1.1  },
  ],
  sofa: [
    { id: "fabric",  label: "Ткань",         desc: "Мягко, дышащий",          coef: 1.0  },
    { id: "velvet",  label: "Велюр",         desc: "Роскошный, мягкий",       coef: 1.2  },
    { id: "leather", label: "Экокожа",       desc: "Легко чистить",           coef: 1.35 },
    { id: "chenille",label: "Шенилл",        desc: "Приятный, прочный",       coef: 1.15 },
  ],
  hallway: [
    { id: "matte",   label: "Матовый",       desc: "Практичный",              coef: 1.0  },
    { id: "glossy",  label: "Глянцевый",     desc: "Стильный",                coef: 1.1  },
    { id: "wood",    label: "Под дерево",    desc: "Натуральный вид",         coef: 1.05 },
  ],
  default: [
    { id: "matte",   label: "Матовый",       desc: "Универсальный",           coef: 1.0  },
    { id: "glossy",  label: "Глянцевый",     desc: "Современный",             coef: 1.1  },
  ],
};

// ─── ТЕКСТУРЫ ─────────────────────────────────────────────────────────────────

export const TEXTURES = [
  { id: "smooth",  label: "Гладкий",     coef: 1.0  },
  { id: "brushed", label: "Брашированный", coef: 1.08 },
  { id: "aged",    label: "Состаренный", coef: 1.12 },
  { id: "emboss",  label: "Тиснение",    coef: 1.15 },
];

// ─── ВНУТРЕННЕЕ НАПОЛНЕНИЕ ────────────────────────────────────────────────────

export const FILLING: Record<string, FillItem[]> = {
  kitchen: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1800,  max: 12 },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 3500,  max: 8  },
    { id: "pullout",  label: "Выдвижная корзина",  icon: "Package",      price: 4200,  max: 4  },
    { id: "divider",  label: "Разделитель ящика",  icon: "Columns",      price: 800,   max: 8  },
    { id: "pantry",   label: "Пенал-кладовая",     icon: "AlignLeft",    price: 14000, max: 2  },
  ],
  wardrobe: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1500,  max: 15 },
    { id: "rail",     label: "Штанга для одежды",  icon: "Minus",        price: 1200,  max: 6  },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 3200,  max: 6  },
    { id: "shoerack", label: "Полка для обуви",    icon: "Grid",         price: 2200,  max: 5  },
    { id: "tie",      label: "Галстукница",        icon: "AlignLeft",    price: 1800,  max: 2  },
    { id: "safe",     label: "Встроенный сейф",    icon: "Lock",         price: 12000, max: 1  },
  ],
  bedroom: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1500,  max: 8  },
    { id: "drawer",   label: "Ящик под кроватью",  icon: "Square",       price: 4000,  max: 4  },
    { id: "nightstand",label: "Тумбочка",          icon: "Square",       price: 7000,  max: 2  },
    { id: "dresser",  label: "Комод",              icon: "AlignCenter",  price: 22000, max: 1  },
  ],
  sofa: [
    { id: "storage",  label: "Ящик для белья",     icon: "Package",      price: 5000,  max: 1  },
    { id: "pocket",   label: "Боковой карман",     icon: "Square",       price: 1200,  max: 2  },
    { id: "cupholder",label: "Подстаканник",       icon: "Circle",       price: 800,   max: 4  },
  ],
  hallway: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1500,  max: 8  },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 2800,  max: 4  },
    { id: "hook",     label: "Крючок",             icon: "ArrowUpRight", price: 300,   max: 10 },
    { id: "shoerack", label: "Полка для обуви",    icon: "Grid",         price: 2000,  max: 4  },
  ],
  office: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1500,  max: 10 },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 3000,  max: 6  },
    { id: "cabinet",  label: "Тумба с замком",     icon: "Lock",         price: 8000,  max: 2  },
    { id: "wire",     label: "Органайзер кабелей", icon: "Zap",          price: 1200,  max: 2  },
  ],
  bathroom: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1200,  max: 6  },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 2800,  max: 4  },
    { id: "basket",   label: "Корзина под раковину",icon: "Package",     price: 2000,  max: 1  },
  ],
  childroom: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1400,  max: 10 },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 2800,  max: 6  },
    { id: "rail",     label: "Штанга",             icon: "Minus",        price: 1000,  max: 2  },
    { id: "basket",   label: "Выдвижная корзина",  icon: "Package",      price: 2500,  max: 3  },
    { id: "board",    label: "Доска для рисования",icon: "Edit",         price: 5500,  max: 1  },
  ],
  default: [
    { id: "shelf",    label: "Полка",              icon: "Minus",        price: 1500,  max: 10 },
    { id: "drawer",   label: "Ящик",               icon: "Square",       price: 3000,  max: 6  },
  ],
};

// ─── ДОП. ОПЦИИ ───────────────────────────────────────────────────────────────

export const EXTRAS: Record<string, { id: string; label: string; price: number }[]> = {
  kitchen: [
    { id: "led",      label: "Подсветка LED",        price: 8000  },
    { id: "soft",     label: "Доводчики на все",      price: 5000  },
    { id: "island",   label: "Кухонный остров",       price: 35000 },
    { id: "waste",    label: "Ящик для мусора",       price: 3500  },
  ],
  wardrobe: [
    { id: "light",    label: "Подсветка",             price: 5000  },
    { id: "trouser",  label: "Брючница",              price: 3000  },
    { id: "mirror",   label: "Зеркало полное",        price: 7000  },
  ],
  bedroom: [
    { id: "light",    label: "Подсветка изголовья",   price: 6000  },
    { id: "mirror",   label: "Зеркало",               price: 8000  },
  ],
  sofa: [
    { id: "mechanism",label: "Механизм раскладки",    price: 8000  },
    { id: "armrests", label: "Рег. подлокотники",     price: 6000  },
  ],
  hallway: [
    { id: "light",    label: "Подсветка",             price: 4000  },
    { id: "mirror",   label: "Зеркало",               price: 7000  },
  ],
  office: [
    { id: "light",    label: "Подсветка рабочего места", price: 4500 },
    { id: "bookcase", label: "Книжный шкаф",          price: 18000 },
  ],
  bathroom: [
    { id: "mirror",   label: "Зеркало-шкаф",          price: 9000  },
    { id: "light",    label: "Подсветка",              price: 3500  },
  ],
  childroom: [
    { id: "light",    label: "Ночник встроенный",      price: 4000  },
    { id: "board",    label: "Магнитная доска",        price: 5500  },
  ],
  default: [],
};

// ─── РАСЧЁТ ЦЕНЫ ─────────────────────────────────────────────────────────────

export function calcPrice(s: CalcState): number {
  const ft = FURNITURE_TYPES.find(t => t.id === s.type);
  if (!ft) return 0;

  const shape   = (SHAPES[s.type] ?? []).find(sh => sh.id === s.shape);
  const mat     = MATERIALS.find(m => m.id === s.material);
  const facade  = (FACADES[s.type] ?? FACADES.default).find(f => f.id === s.facade);
  const colors  = (COLORS[s.material] ?? COLORS.default);
  const color   = colors.find(c => c.id === s.color);
  const texture = TEXTURES.find(t => t.id === s.texture);

  const area = (s.width * s.height) / 10000;

  const base     = ft.base;
  const shapeC   = shape?.coef   ?? 1.0;
  const matC     = mat?.coef     ?? 1.0;
  const facadeC  = facade?.coef  ?? 1.0;
  const colorC   = color?.coef   ?? 1.0;
  const textureC = texture?.coef ?? 1.0;
  const depthC   = s.depth > 65 ? 1.1 : 1.0;

  // Сумма по наполнению
  const fillingItems = FILLING[s.type] ?? FILLING.default;
  const fillingTotal = Object.entries(s.filling).reduce((sum, [id, qty]) => {
    const item = fillingItems.find(f => f.id === id);
    return sum + (item?.price ?? 0) * qty;
  }, 0);

  // Доп. опции
  const extrasItems = EXTRAS[s.type] ?? EXTRAS.default ?? [];
  const extrasTotal = s.extras.reduce((sum, eid) => {
    const ex = extrasItems.find(e => e.id === eid);
    return sum + (ex?.price ?? 0);
  }, 0);

  const mainCost = Math.round(base + area * shapeC * matC * facadeC * colorC * textureC * depthC * 75000);
  return mainCost + fillingTotal + extrasTotal;
}
