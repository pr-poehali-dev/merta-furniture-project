import { useMemo } from "react";

interface Props {
  type: string;
  material: string;
  style: string;
  width: number;
  height: number;
  depth: number;
}

// Реальные цвета материалов — отчётливо разные
const MATERIAL_COLORS: Record<string, { face: string; top: string; side: string; handle: string; gloss: boolean }> = {
  ldsp:       { face: "#dfd3b8", top: "#c8b99a", side: "#b5a07f", handle: "#7a6a55", gloss: false },
  mdf:        { face: "#c8c8c8", top: "#adadad", side: "#929292", handle: "#555555", gloss: false },
  massiv:     { face: "#b87333", top: "#8f5320", side: "#6e3d13", handle: "#3d2008", gloss: false },
  mdf_kraska: { face: "#f5f5f5", top: "#e0e0e0", side: "#c5c5c5", handle: "#888888", gloss: true  },
  default:    { face: "#d9cec0", top: "#bfb09e", side: "#a89880", handle: "#6b5c47", gloss: false },
};

function getC(material: string) {
  return MATERIAL_COLORS[material] ?? MATERIAL_COLORS.default;
}

// Изометрические константы (30° проекция)
const ISO_X = 0.866; // cos(30°)
const ISO_Y = 0.5;   // sin(30°)

// Строит изометрический прямоугольный параллелепипед
// ox, oy — левый нижний угол фронтальной грани
// W — ширина (по X), H — высота (по Y), D — глубина (уходит вправо-вверх)
function IsoBox({
  ox, oy, W, H, D,
  face, top, side,
  stroke = "#00000033",
  sw = 0.8,
  opacity = 1,
}: {
  ox: number; oy: number; W: number; H: number; D: number;
  face: string; top: string; side: string;
  stroke?: string; sw?: number; opacity?: number;
}) {
  const dx = D * ISO_X;
  const dy = D * ISO_Y;

  // 8 вершин
  const A = [ox,     oy];          // фронт нижний левый
  const B = [ox + W, oy];          // фронт нижний правый
  const C = [ox + W, oy - H];      // фронт верхний правый
  const Dv= [ox,     oy - H];      // фронт верхний левый
  const E = [ox + dx,     oy - dy];           // зад нижний левый
  const F = [ox + W + dx, oy - dy];           // зад нижний правый
  const G = [ox + W + dx, oy - H - dy];       // зад верхний правый
  const Hv= [ox + dx,     oy - H - dy];       // зад верхний левый

  const pt = (v: number[]) => `${v[0]},${v[1]}`;

  return (
    <g opacity={opacity}>
      {/* Фронтальная грань */}
      <polygon points={`${pt(A)} ${pt(B)} ${pt(C)} ${pt(Dv)}`} fill={face} stroke={stroke} strokeWidth={sw} />
      {/* Верхняя грань */}
      <polygon points={`${pt(Dv)} ${pt(C)} ${pt(G)} ${pt(Hv)}`} fill={top} stroke={stroke} strokeWidth={sw} />
      {/* Правая боковая грань */}
      <polygon points={`${pt(B)} ${pt(F)} ${pt(G)} ${pt(C)}`} fill={side} stroke={stroke} strokeWidth={sw} />
    </g>
  );
}

// ─── КУХНЯ ───────────────────────────────────────────────────────────────────
function KitchenSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  // Нижний ящичный блок: ширина W, высота ~0.38H, глубина D
  const bh = H * 0.38;
  const uh = H * 0.32; // верхние шкафы
  const gap = H * 0.08; // пространство между

  // Столешница чуть шире
  const tw = W + 4;
  const th = H * 0.04;

  // Центрируем
  const ox = (200 - W) / 2;
  const oy = 175;

  const topFace = c.gloss ? "#ffffff" : c.face;

  return (
    <svg viewBox="0 0 200 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={180} rx={W * 0.45} ry={5} fill="rgba(0,0,0,0.13)" />

      {/* Нижний блок */}
      <IsoBox ox={ox} oy={oy} W={W} H={bh} D={D} face={c.face} top={c.top} side={c.side} />

      {/* Столешница */}
      <IsoBox ox={ox - 2} oy={oy - bh} W={tw} H={th} D={D + 2} face={c.handle} top={c.gloss ? "#eee" : "#7a5c35"} side={c.side} />

      {/* Верхние шкафы — чуть уже */}
      <IsoBox ox={ox + W * 0.05} oy={oy - bh - th - gap * H} W={W * 0.9} H={uh} D={D * 0.7}
        face={c.face} top={c.top} side={c.side}
      />

      {/* Разделители нижнего блока */}
      {[0.33, 0.66].map((t, i) => (
        <line key={i}
          x1={ox + W * t} y1={oy}
          x2={ox + W * t} y2={oy - bh}
          stroke={c.side} strokeWidth="0.8"
        />
      ))}

      {/* Ручки нижнего */}
      {[0.16, 0.5, 0.83].map((t, i) => (
        <line key={i}
          x1={ox + W * t - 6} y1={oy - bh * 0.45}
          x2={ox + W * t + 6} y2={oy - bh * 0.45}
          stroke={c.handle} strokeWidth="1.5" strokeLinecap="round"
        />
      ))}

      {/* Ручки верхних */}
      {[0.3, 0.7].map((t, i) => (
        <line key={i}
          x1={ox + W * 0.05 + W * 0.9 * t - 5} y1={oy - bh - th - gap * H - uh * 0.6}
          x2={ox + W * 0.05 + W * 0.9 * t + 5} y2={oy - bh - th - gap * H - uh * 0.6}
          stroke={c.handle} strokeWidth="1.5" strokeLinecap="round"
        />
      ))}

      {/* Мойка (только если достаточно широко) */}
      {W > 50 && (
        <ellipse
          cx={ox + W * 0.25} cy={oy - bh - th * 0.5}
          rx={W * 0.14} ry={th * 1.5}
          fill="rgba(160,200,220,0.5)" stroke={c.side} strokeWidth="0.6"
        />
      )}
    </svg>
  );
}

// ─── ШКАФ-КУПЕ ───────────────────────────────────────────────────────────────
function WardrobeSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  const ox = (200 - W) / 2;
  const oy = 175;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={182} rx={W * 0.45} ry={5} fill="rgba(0,0,0,0.13)" />

      {/* Корпус */}
      <IsoBox ox={ox} oy={oy} W={W} H={H} D={D} face={c.face} top={c.top} side={c.side} />

      {/* Вертикальный разделитель дверей */}
      <line x1={ox + W / 2} y1={oy} x2={ox + W / 2} y2={oy - H} stroke={c.side} strokeWidth="1.5" />

      {/* Зеркало на левой двери */}
      <rect
        x={ox + W * 0.04} y={oy - H * 0.92}
        width={W * 0.42} height={H * 0.82}
        fill="rgba(180,215,235,0.28)" stroke={c.top} strokeWidth="0.7"
      />

      {/* Правая дверь — рисунок под дерево / глянец */}
      {c.gloss ? (
        <rect
          x={ox + W * 0.52} y={oy - H * 0.92}
          width={W * 0.44} height={H * 0.82}
          fill="rgba(255,255,255,0.18)" stroke={c.top} strokeWidth="0.7"
        />
      ) : (
        <>
          <line x1={ox + W * 0.56} y1={oy - H * 0.9} x2={ox + W * 0.58} y2={oy - H * 0.08} stroke={c.top} strokeWidth="0.6" opacity="0.5" />
          <line x1={ox + W * 0.66} y1={oy - H * 0.9} x2={ox + W * 0.68} y2={oy - H * 0.08} stroke={c.top} strokeWidth="0.6" opacity="0.5" />
        </>
      )}

      {/* Ручки */}
      {[0.44, 0.92].map((t, i) => (
        <line key={i}
          x1={ox + W * t} y1={oy - H * 0.46}
          x2={ox + W * t} y2={oy - H * 0.54}
          stroke={c.handle} strokeWidth="2" strokeLinecap="round"
        />
      ))}

      {/* Плинтус */}
      <IsoBox ox={ox + W * 0.02} oy={oy} W={W * 0.96} H={H * 0.04} D={D * 0.95}
        face={c.side} top={c.side} side={c.handle}
      />
    </svg>
  );
}

// ─── ДИВАН ───────────────────────────────────────────────────────────────────
function SofaSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  // H — высота спинки, D — глубина сиденья
  const armW = W * 0.1;
  const seatH = H * 0.38;
  const backH = H * 0.55;
  const legH = H * 0.12;
  const ox = (200 - W) / 2;
  const oy = 175;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.4} cy={181} rx={W * 0.42} ry={5} fill="rgba(0,0,0,0.12)" />

      {/* Ножки */}
      {[ox + armW * 0.5, ox + W - armW * 0.5].map((x, i) => (
        <IsoBox key={i} ox={x - 3} oy={oy} W={6} H={legH} D={5}
          face={c.handle} top={c.side} side={c.handle}
        />
      ))}

      {/* Сиденье */}
      <IsoBox ox={ox} oy={oy - legH} W={W} H={seatH} D={D}
        face={c.face} top={c.top} side={c.side}
      />

      {/* Спинка */}
      <IsoBox ox={ox} oy={oy - legH - seatH} W={W} H={backH} D={D * 0.28}
        face={c.face} top={c.top} side={c.side}
      />

      {/* Подлокотники */}
      <IsoBox ox={ox} oy={oy - legH} W={armW} H={seatH + backH * 0.7} D={D}
        face={c.side} top={c.top} side={c.handle}
      />
      <IsoBox ox={ox + W - armW} oy={oy - legH} W={armW} H={seatH + backH * 0.7} D={D}
        face={c.side} top={c.top} side={c.handle}
      />

      {/* Подушки на сиденье */}
      {[0.18, 0.52, 0.82].filter((_, i) => W > 70 || i < 2).map((t, i) => (
        <IsoBox key={i}
          ox={ox + armW + (W - 2 * armW) * (t - 0.13)} oy={oy - legH - seatH}
          W={(W - 2 * armW) * 0.28} H={seatH * 0.3} D={D * 0.88}
          face={c.top} top={c.face} side={c.side} opacity={0.85}
        />
      ))}
    </svg>
  );
}

// ─── СПАЛЬНЯ ─────────────────────────────────────────────────────────────────
function BedroomSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  const headH = H * 0.55;   // изголовье
  const frameH = H * 0.18;  // рама кровати
  const mattH = H * 0.2;    // матрас
  const legH = H * 0.07;
  const ox = (200 - W) / 2;
  const oy = 175;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={181} rx={W * 0.46} ry={5} fill="rgba(0,0,0,0.12)" />

      {/* Ножки */}
      {[ox + 4, ox + W - 10].map((x, i) => (
        <IsoBox key={i} ox={x} oy={oy} W={6} H={legH} D={5}
          face={c.handle} top={c.side} side={c.handle}
        />
      ))}

      {/* Рама кровати */}
      <IsoBox ox={ox} oy={oy - legH} W={W} H={frameH} D={D}
        face={c.face} top={c.top} side={c.side}
      />

      {/* Матрас */}
      <IsoBox ox={ox + W * 0.03} oy={oy - legH - frameH} W={W * 0.94} H={mattH} D={D * 0.94}
        face="#f0eeea" top="#e8e6e0" side="#d5d2ca"
      />

      {/* Подушки */}
      {[0.08, 0.54].filter((_, i) => W > 50 || i === 0).map((t, i) => (
        <IsoBox key={i}
          ox={ox + W * (0.06 + t * 0.88)} oy={oy - legH - frameH - mattH}
          W={W * 0.38} H={mattH * 0.55} D={D * 0.32}
          face="#ffffff" top="#f0f0f0" side="#ddd"
        />
      ))}

      {/* Изголовье */}
      <IsoBox ox={ox} oy={oy - legH - frameH - mattH} W={W} H={headH} D={D * 0.18}
        face={c.face} top={c.top} side={c.side}
      />

      {/* Декор на изголовье — мягкая обивка */}
      <rect
        x={ox + W * 0.06} y={oy - legH - frameH - mattH - headH * 0.88}
        width={W * 0.88} height={headH * 0.78}
        rx="3"
        fill={c.gloss ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.06)"}
        stroke={c.top} strokeWidth="0.7"
      />
    </svg>
  );
}

// ─── ПРИХОЖАЯ ────────────────────────────────────────────────────────────────
function HalwaySVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  const ox = (200 - W) / 2;
  const oy = 175;
  const shelfH = H * 0.06;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={181} rx={W * 0.44} ry={5} fill="rgba(0,0,0,0.12)" />

      {/* Нижний ящик для обуви */}
      <IsoBox ox={ox} oy={oy} W={W} H={H * 0.22} D={D}
        face={c.face} top={c.top} side={c.side}
      />
      {/* Корпус */}
      <IsoBox ox={ox} oy={oy - H * 0.22} W={W} H={H * 0.62} D={D * 0.7}
        face={c.face} top={c.top} side={c.side}
      />
      {/* Полки */}
      {[0.35, 0.65].map((t, i) => (
        <IsoBox key={i} ox={ox + W * 0.03} oy={oy - H * 0.22 - H * 0.62 * t} W={W * 0.94} H={shelfH} D={D * 0.66}
          face={c.top} top={c.top} side={c.side}
        />
      ))}
      {/* Зеркало */}
      <rect x={ox + W * 0.15} y={oy - H} width={W * 0.7} height={H * 0.13}
        fill="rgba(180,215,235,0.3)" stroke={c.top} strokeWidth="0.8"
      />
      {/* Крючки */}
      {[0.2, 0.45, 0.7].map((t, i) => (
        <g key={i}>
          <circle cx={ox + W * t} cy={oy - H * 0.88} r={2.5} fill={c.handle} />
          <line x1={ox + W * t} y1={oy - H * 0.88} x2={ox + W * t + 3} y2={oy - H * 0.78}
            stroke={c.handle} strokeWidth="1.5" strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}

// ─── КАБИНЕТ ─────────────────────────────────────────────────────────────────
function OfficeSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  const deskH = H * 0.1;
  const deskD = D * 0.85;
  const legH = H * 0.48;
  const cabinetW = W * 0.35;
  const ox = (200 - W) / 2;
  const oy = 175;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={181} rx={W * 0.44} ry={5} fill="rgba(0,0,0,0.12)" />

      {/* Тумба-шкаф */}
      <IsoBox ox={ox} oy={oy} W={cabinetW} H={legH + deskH} D={deskD}
        face={c.face} top={c.top} side={c.side}
      />
      {/* Ножки стола */}
      <IsoBox ox={ox + W - 8} oy={oy} W={6} H={legH} D={5}
        face={c.handle} top={c.side} side={c.handle}
      />
      {/* Столешница */}
      <IsoBox ox={ox} oy={oy - legH} W={W} H={deskH} D={deskD}
        face={c.top} top={c.gloss ? "#eee" : "#7a5c35"} side={c.side}
      />
      {/* Надстройка */}
      <IsoBox ox={ox + W * 0.55} oy={oy - legH - deskH} W={W * 0.42} H={H * 0.38} D={D * 0.35}
        face={c.face} top={c.top} side={c.side}
      />
      {/* Ручки тумбы */}
      {[0.35, 0.7].map((t, i) => (
        <circle key={i} cx={ox + cabinetW * 0.5} cy={oy - (legH + deskH) * t} r={3}
          fill="none" stroke={c.handle} strokeWidth="1.2"
        />
      ))}
      {/* Монитор */}
      <rect x={ox + W * 0.3} y={oy - legH - deskH - H * 0.32}
        width={W * 0.22} height={H * 0.26}
        rx="2" fill="rgba(30,30,40,0.7)" stroke={c.side} strokeWidth="0.8"
      />
      <rect x={ox + W * 0.37} y={oy - legH - deskH - H * 0.06}
        width={W * 0.08} height={H * 0.05}
        fill={c.side}
      />
    </svg>
  );
}

// ─── ВАННАЯ ──────────────────────────────────────────────────────────────────
function BathroomSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  const ox = (200 - W) / 2;
  const oy = 175;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={181} rx={W * 0.42} ry={5} fill="rgba(0,0,0,0.12)" />

      {/* Корпус тумбы */}
      <IsoBox ox={ox} oy={oy} W={W} H={H * 0.55} D={D}
        face={c.face} top={c.top} side={c.side}
      />
      {/* Столешница с раковиной */}
      <IsoBox ox={ox - 2} oy={oy - H * 0.55} W={W + 4} H={H * 0.06} D={D + 3}
        face="#e0e0e0" top="#f0f0f0" side="#ccc"
      />
      {/* Раковина */}
      <ellipse
        cx={ox + W * 0.5} cy={oy - H * 0.55 - H * 0.02}
        rx={W * 0.28} ry={W * 0.12}
        fill="rgba(200,230,245,0.6)" stroke="#bbb" strokeWidth="0.8"
      />
      {/* Зеркало-шкаф */}
      <IsoBox ox={ox + W * 0.05} oy={oy - H * 0.61} W={W * 0.9} H={H * 0.38} D={D * 0.22}
        face="rgba(180,215,235,0.4)" top={c.top} side={c.side}
      />
      {/* Ручки */}
      <line x1={ox + W * 0.4} y1={oy - H * 0.35} x2={ox + W * 0.6} y2={oy - H * 0.35}
        stroke={c.handle} strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

// ─── ДЕТСКАЯ ─────────────────────────────────────────────────────────────────
function ChildroomSVG({ W, H, D, c }: { W: number; H: number; D: number; c: ReturnType<typeof getC> }) {
  const bedW = W * 0.55;
  const deskW = W * 0.4;
  const ox = (200 - W) / 2;
  const oy = 175;

  return (
    <svg viewBox="0 0 200 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" style={{ transition: "all 0.4s ease" }}>
      <ellipse cx={ox + W / 2 + D * ISO_X * 0.5} cy={181} rx={W * 0.44} ry={5} fill="rgba(0,0,0,0.12)" />

      {/* Кровать */}
      <IsoBox ox={ox} oy={oy} W={bedW} H={H * 0.17} D={D * 0.85}
        face={c.face} top={c.top} side={c.side}
      />
      <IsoBox ox={ox + bedW * 0.04} oy={oy - H * 0.17} W={bedW * 0.92} H={H * 0.14} D={D * 0.82}
        face="#f0eeea" top="#e8e6e0" side="#d5d2ca"
      />
      <IsoBox ox={ox} oy={oy - H * 0.17 - H * 0.14} W={bedW} H={H * 0.32} D={D * 0.15}
        face={c.face} top={c.top} side={c.side}
      />

      {/* Стол */}
      <IsoBox ox={ox + bedW + W * 0.04} oy={oy - H * 0.42} W={deskW} H={H * 0.07} D={D * 0.55}
        face={c.top} top="#999" side={c.side}
      />
      {/* Ножки стола */}
      {[0, deskW - 5].map((dx, i) => (
        <IsoBox key={i} ox={ox + bedW + W * 0.04 + dx} oy={oy} W={5} H={H * 0.42} D={4}
          face={c.handle} top={c.side} side={c.handle}
        />
      ))}
      {/* Полка над столом */}
      <IsoBox ox={ox + bedW + W * 0.04} oy={oy - H * 0.7} W={deskW} H={H * 0.05} D={D * 0.3}
        face={c.face} top={c.top} side={c.side}
      />
    </svg>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
export default function FurniturePreview({ type, material, style, width, height, depth }: Props) {
  const c = useMemo(() => getC(material), [material]);

  // Нормализуем размеры в пиксели SVG (viewBox 200)
  // Диапазоны: W 60–400, H 60–280, D 30–90
  const W = useMemo(() => {
    if (type === "sofa")   return Math.min(Math.max((width  / 300) * 130, 55), 148);
    if (type === "bedroom") return Math.min(Math.max((width  / 200) * 110, 70), 148);
    return Math.min(Math.max((width  / 240) * 120, 55), 150);
  }, [width, type]);

  const H = useMemo(() => {
    if (type === "sofa")   return Math.min(Math.max((depth  / 90) * 60,  38),  82);
    if (type === "bedroom") return Math.min(Math.max((height / 220) * 95, 55), 130);
    return Math.min(Math.max((height / 220) * 110, 50), 145);
  }, [height, depth, type]);

  const D = useMemo(() => {
    if (type === "sofa")   return Math.min(Math.max((depth  / 90)  * 32, 18),  44);
    return Math.min(Math.max((depth  / 65)  * 28, 14),  40);
  }, [depth, type]);

  if (!type) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-white/20">
        <svg viewBox="0 0 64 64" className="w-10 h-10 opacity-20">
          <rect x="8" y="18" width="48" height="38" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <rect x="16" y="8" width="32" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <line x1="8" y1="36" x2="56" y2="36" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <p className="text-[9px] tracking-widest uppercase">Выберите тип</p>
      </div>
    );
  }

  const svgProps = { W, H, D, c };

  return (
    <div style={{ transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
      <div className="aspect-[4/3] flex items-center justify-center">
        {type === "kitchen"   && <KitchenSVG   {...svgProps} />}
        {type === "wardrobe"  && <WardrobeSVG  {...svgProps} />}
        {type === "sofa"      && <SofaSVG      {...svgProps} />}
        {type === "bedroom"   && <BedroomSVG   {...svgProps} />}
        {type === "hallway"   && <HalwaySVG    {...svgProps} />}
        {type === "office"    && <OfficeSVG    {...svgProps} />}
        {type === "bathroom"  && <BathroomSVG  {...svgProps} />}
        {type === "childroom" && <ChildroomSVG {...svgProps} />}
      </div>

      {/* Легенда материала */}
      {material && (
        <div className="flex items-center gap-2 px-1 mt-1">
          <div className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/10"
            style={{ background: c.face }}
          />
          <span className="text-[9px] text-white/30 tracking-widest uppercase truncate">
            {{
              ldsp: "ЛДСП",
              mdf: "МДФ",
              massiv: "Массив дерева",
              mdf_kraska: "МДФ эмаль",
            }[material] ?? material}
          </span>
          <span className="ml-auto text-[9px] text-white/20 tabular-nums">
            {width}×{height}×{depth}
          </span>
        </div>
      )}
    </div>
  );
}
