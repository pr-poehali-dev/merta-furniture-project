import { useMemo } from "react";

interface Props {
  type: string;
  material: string;
  color?: string;
  style: string;
  facade?: string;   // matte | glossy | wood | glass | mirror | fabric | velvet | leather | ...
  texture?: string;  // smooth | brushed | aged | emboss
  filling?: Record<string, number>; // id → qty
  width: number;
  height: number;
  depth: number;
}

// ─── ПАЛИТРЫ МАТЕРИАЛОВ ───────────────────────────────────────────────────────
const MAT: Record<string, {
  f0: string; f1: string;
  t0: string; t1: string;
  s0: string; s1: string;
  edge: string;
  grain: boolean;
  gloss: boolean;
  handle: string;
}> = {
  ldsp: {
    f0:"#ede0cb", f1:"#c8b593",
    t0:"#d4c4a8", t1:"#b89e78",
    s0:"#bfaa88", s1:"#9e8660",
    edge:"#8a7255", grain:false, gloss:false,
    handle:"#6b5840",
  },
  mdf: {
    f0:"#d2cdc8", f1:"#a8a39e",
    t0:"#bcb8b2", t1:"#929089",
    s0:"#a09d98", s1:"#7e7c78",
    edge:"#6a6864", grain:false, gloss:false,
    handle:"#444",
  },
  massiv: {
    f0:"#c07d3a", f1:"#7a4a18",
    t0:"#a86828", t1:"#6b3e10",
    s0:"#8a5218", s1:"#562e08",
    edge:"#3d2008", grain:true, gloss:false,
    handle:"#2a1404",
  },
  mdf_kraska: {
    f0:"#f8f8f8", f1:"#d8d8d8",
    t0:"#e8e8e8", t1:"#c8c8c8",
    s0:"#d0d0d0", s1:"#b0b0b0",
    edge:"#aaa", grain:false, gloss:true,
    handle:"#777",
  },
  default: {
    f0:"#ddd3bc", f1:"#b8a882",
    t0:"#c8bb9e", t1:"#a49070",
    s0:"#b0a080", s1:"#8c7858",
    edge:"#7a6644", grain:false, gloss:false,
    handle:"#5c4c30",
  },
};
function getM(mat: string) { return MAT[mat] ?? MAT.default; }

// ─── SVG DEFS ─────────────────────────────────────────────────────────────────
function Defs({ id, m }: { id: string; m: ReturnType<typeof getM> }) {
  return (
    <defs>
      <linearGradient id={`gF${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={m.f0} />
        <stop offset="100%" stopColor={m.f1} />
      </linearGradient>
      <linearGradient id={`gT${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor={m.t0} />
        <stop offset="100%" stopColor={m.t1} />
      </linearGradient>
      <linearGradient id={`gS${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={m.s0} />
        <stop offset="100%" stopColor={m.s1} />
      </linearGradient>
      {m.gloss && (
        <linearGradient id={`gG${id}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%"   stopColor="white" stopOpacity="0.28" />
          <stop offset="55%"  stopColor="white" stopOpacity="0.06" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      )}
      <radialGradient id={`gSh${id}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="rgba(0,0,0,0.32)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </radialGradient>
      <filter id={`blur${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" />
      </filter>
    </defs>
  );
}

// ─── ИЗО-ПАРАЛЛЕЛЕПИПЕД ───────────────────────────────────────────────────────
function Box({
  id, px, py, W, H, D, m,
  faceOverride, topOverride, sideOverride,
  opacity = 1, noTop = false, noSide = false,
}: {
  id: string; px: number; py: number; W: number; H: number; D: number;
  m: ReturnType<typeof getM>;
  faceOverride?: string; topOverride?: string; sideOverride?: string;
  opacity?: number; noTop?: boolean; noSide?: boolean;
}) {
  const cx = D * 0.866;
  const cy = D * 0.5;
  const A  = `${px},${py}`;
  const B  = `${px+W},${py}`;
  const C  = `${px+W},${py-H}`;
  const Dv = `${px},${py-H}`;
  const F  = `${px+W+cx},${py-cy}`;
  const G  = `${px+W+cx},${py-H-cy}`;
  const Hv = `${px+cx},${py-H-cy}`;

  const fFill = faceOverride ?? `url(#gF${id})`;
  const tFill = topOverride  ?? `url(#gT${id})`;
  const sFill = sideOverride ?? `url(#gS${id})`;

  return (
    <g opacity={opacity}>
      <polygon points={`${A} ${B} ${C} ${Dv}`} fill={fFill} stroke={m.edge} strokeWidth="0.6" />
      {!noTop && <polygon points={`${Dv} ${C} ${G} ${Hv}`} fill={tFill} stroke={m.edge} strokeWidth="0.6" />}
      {!noSide && <polygon points={`${B} ${F} ${G} ${C}`} fill={sFill} stroke={m.edge} strokeWidth="0.6" />}
      {m.gloss && <polygon points={`${A} ${B} ${C} ${Dv}`} fill={`url(#gG${id})`} />}
      {m.grain && [0.2,0.4,0.6,0.78].map((t, i) => (
        <line key={i} x1={px+W*t} y1={py} x2={px+W*t} y2={py-H}
          stroke="rgba(0,0,0,0.07)" strokeWidth="0.7" />
      ))}
    </g>
  );
}

function Handle({ x, y, len = 18, vert = false, color }: {
  x:number; y:number; len?:number; vert?:boolean; color:string;
}) {
  const x2 = vert ? x : x+len;
  const y2 = vert ? y+len : y;
  return (
    <g>
      <line x1={x} y1={y} x2={x2} y2={y2} stroke="rgba(0,0,0,0.25)" strokeWidth="3" strokeLinecap="round" />
      <line x1={x} y1={y} x2={x2} y2={y2} stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

// ─── ВСПОМОГАТЕЛЬНЫЕ РЕНДЕРЫ ──────────────────────────────────────────────────

// Оверлей фасада поверх прямоугольника (px,py — верхний левый угол, W,H — размеры)
function FacadeOverlay({ px, py, W, H, facade }: {
  px:number; py:number; W:number; H:number; facade:string;
}) {
  switch (facade) {
    case "glossy":
      return (
        <g>
          <defs>
            <linearGradient id="gls" x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.32"/>
              <stop offset="60%" stopColor="white" stopOpacity="0.06"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
          </defs>
          <rect x={px} y={py} width={W} height={H} fill="url(#gls)" />
        </g>
      );
    case "mirror":
      return (
        <g>
          <rect x={px} y={py} width={W} height={H} fill="rgba(185,220,240,0.28)" />
          <rect x={px} y={py} width={W*0.18} height={H} fill="rgba(255,255,255,0.2)" />
        </g>
      );
    case "glass":
      return (
        <g>
          <rect x={px+W*0.08} y={py+H*0.06} width={W*0.84} height={H*0.88}
            fill="rgba(180,215,235,0.3)" stroke="rgba(150,190,215,0.5)" strokeWidth="0.8" rx="1"/>
          <rect x={px+W*0.08} y={py+H*0.06} width={W*0.16} height={H*0.88}
            fill="rgba(255,255,255,0.15)"/>
        </g>
      );
    case "wood":
      return (
        <g>
          {[0.15,0.32,0.5,0.67,0.84].map((t,i) => (
            <line key={i} x1={px+W*t} y1={py} x2={px+W*t} y2={py+H}
              stroke="rgba(0,0,0,0.09)" strokeWidth="0.9"/>
          ))}
        </g>
      );
    case "texture": case "emboss":
      return (
        <g>
          {Array.from({length: Math.floor(H/8)}).map((_,i) => (
            <line key={i} x1={px} y1={py+i*8+4} x2={px+W} y2={py+i*8+4}
              stroke="rgba(0,0,0,0.05)" strokeWidth="0.6"/>
          ))}
        </g>
      );
    case "fabric": case "chenille":
      return (
        <g>
          {Array.from({length: Math.floor(W/6)}).map((_,i) => (
            <line key={i} x1={px+i*6+3} y1={py} x2={px+i*6+3} y2={py+H}
              stroke="rgba(0,0,0,0.04)" strokeWidth="0.5"/>
          ))}
          {Array.from({length: Math.floor(H/6)}).map((_,i) => (
            <line key={i} x1={px} y1={py+i*6+3} x2={px+W} y2={py+i*6+3}
              stroke="rgba(0,0,0,0.04)" strokeWidth="0.5"/>
          ))}
        </g>
      );
    case "velvet":
      return (
        <g>
          <rect x={px} y={py} width={W} height={H} fill="rgba(255,255,255,0.06)"/>
          {Array.from({length: Math.floor(H/4)}).map((_,i) => (
            <line key={i} x1={px} y1={py+i*4+2} x2={px+W} y2={py+i*4+2}
              stroke="rgba(255,255,255,0.08)" strokeWidth="0.5"/>
          ))}
        </g>
      );
    case "leather":
      return (
        <g>
          <rect x={px} y={py} width={W} height={H} fill="rgba(255,255,255,0.04)"/>
          {[0.33,0.66].map((t,i) => (
            <line key={i} x1={px} y1={py+H*t} x2={px+W} y2={py+H*t}
              stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="4 3"/>
          ))}
        </g>
      );
    default: return null;
  }
}

// Текстурный оверлей по всему корпусу
function TextureLayer({ px, py, W, H, texture }: {
  px:number; py:number; W:number; H:number; texture:string;
}) {
  if (texture === "brushed") {
    return (
      <g>
        {Array.from({length: Math.floor(W/5)}).map((_,i) => (
          <line key={i} x1={px+i*5+2} y1={py} x2={px+i*5+2} y2={py+H}
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"/>
        ))}
      </g>
    );
  }
  if (texture === "aged") {
    return (
      <g>
        {[[0.2,0.1,0.35,0.6],[0.6,0.3,0.75,0.8],[0.4,0.7,0.55,0.9],[0.8,0.15,0.9,0.45]].map(([x1r,y1r,x2r,y2r],i) => (
          <line key={i}
            x1={px+W*x1r} y1={py+H*y1r} x2={px+W*x2r} y2={py+H*y2r}
            stroke="rgba(0,0,0,0.08)" strokeWidth="0.7" strokeLinecap="round"/>
        ))}
      </g>
    );
  }
  if (texture === "emboss") {
    return (
      <g>
        {Array.from({length: Math.floor(H/10)}).map((_,i) => (
          <rect key={i} x={px+2} y={py+i*10+2} width={W-4} height={6}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" rx="1"/>
        ))}
      </g>
    );
  }
  return null;
}

// Иконки наполнения внутри корпуса (видны как схематичные линии)
function FillingViz({ px, py, W, H, filling }: {
  px:number; py:number; W:number; H:number; filling: Record<string,number>;
}) {
  const items: React.ReactNode[] = [];
  let offsetY = 0;
  const totalQty = Object.values(filling).reduce((s,q) => s+q, 0);
  if (totalQty === 0) return null;

  // Полки — горизонтальные линии
  const shelves = filling["shelf"] ?? 0;
  for (let i = 0; i < Math.min(shelves, 6); i++) {
    const y = py + H*0.15 + (H*0.7/(Math.min(shelves,6)+1))*(i+1);
    items.push(
      <g key={`shelf-${i}`}>
        <line x1={px+2} y1={y} x2={px+W-2} y2={y}
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"/>
        <line x1={px+W-2} y1={y} x2={px+W-2+H*0.015} y2={y-H*0.01}
          stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      </g>
    );
    offsetY = y;
  }

  // Штанга — горизонтальная с кружочком
  const rails = filling["rail"] ?? 0;
  if (rails > 0) {
    const y = py + H * 0.28;
    items.push(
      <g key="rail">
        <line x1={px+W*0.1} y1={y} x2={px+W*0.9} y2={y}
          stroke="rgba(200,210,220,0.7)" strokeWidth="2" strokeLinecap="round"/>
        {[0.25,0.45,0.65].map((t,i) => (
          <g key={i}>
            <line x1={px+W*t} y1={y} x2={px+W*t} y2={y+H*0.15}
              stroke="rgba(200,210,220,0.5)" strokeWidth="0.8"/>
            <ellipse cx={px+W*t} cy={y+H*0.15} rx={2.5} ry={1.5}
              fill="none" stroke="rgba(200,210,220,0.5)" strokeWidth="0.7"/>
          </g>
        ))}
      </g>
    );
  }

  // Ящики — прямоугольники внизу
  const drawers = filling["drawer"] ?? 0;
  for (let i = 0; i < Math.min(drawers, 4); i++) {
    const dH = H * 0.12;
    const y = py + H - dH*(i+1) - i*2 - 2;
    items.push(
      <g key={`drawer-${i}`}>
        <rect x={px+3} y={y} width={W-6} height={dH-1} rx="1"
          fill="rgba(0,0,0,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
        <line x1={px+W*0.4} y1={y+dH*0.5} x2={px+W*0.6} y2={y+dH*0.5}
          stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
    );
  }

  // Крючки
  const hooks = filling["hook"] ?? 0;
  if (hooks > 0) {
    const count = Math.min(hooks, 5);
    for (let i = 0; i < count; i++) {
      const x = px + W*(0.15 + 0.7*i/(count-1||1));
      items.push(
        <g key={`hook-${i}`}>
          <circle cx={x} cy={py+H*0.12} r={2} fill="rgba(200,210,220,0.8)"/>
          <path d={`M${x},${py+H*0.12} Q${x+5},${py+H*0.22} ${x+3},${py+H*0.32}`}
            stroke="rgba(200,210,220,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        </g>
      );
    }
  }

  void offsetY;
  return <g>{items}</g>;
}

type SvgProps = { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string; facade?:string; texture?:string; filling?:Record<string,number> };

// ─── КУХНЯ ───────────────────────────────────────────────────────────────────
function KitchenSVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const BH = H*0.42; const UH = H*0.35; const TH = 6; const GAP = H*0.07;
  const UW = W*0.85; const UX = W*0.075;
  const ox = 20, oy = 175;
  const cx = D*0.866, cy = D*0.5;

  return (
    <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5+cx*0.4} cy={oy+4} rx={W*0.52} ry={7} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      {[0,1,2].map(i => (
        <Box key={i} id={id} m={m} px={ox+W/3*i} py={oy} W={W/3} H={BH} D={0} noTop noSide />
      ))}
      <polygon points={`${ox},${oy-BH} ${ox+W},${oy-BH} ${ox+W+cx},${oy-BH-cy} ${ox+cx},${oy-BH-cy}`}
        fill={`url(#gT${id})`} stroke={m.edge} strokeWidth="0.6" />
      <polygon points={`${ox+W},${oy} ${ox+W+cx},${oy-cy} ${ox+W+cx},${oy-BH-cy} ${ox+W},${oy-BH}`}
        fill={`url(#gS${id})`} stroke={m.edge} strokeWidth="0.6" />

      <Box id={id} m={m} px={ox-2} py={oy-BH} W={W+4} H={TH} D={D+3}
        faceOverride={m.grain?"#5a3a10":"#888"} topOverride={m.grain?"#7a5218":"#ccc"} sideOverride={m.grain?"#3d2008":"#aaa"} />

      <ellipse cx={ox+W*0.22} cy={oy-BH-TH*0.5} rx={W*0.12} ry={4}
        fill="rgba(140,190,215,0.55)" stroke="#8fb0c8" strokeWidth="0.8" />
      <path d={`M${ox+W*0.22},${oy-BH-TH-8} Q${ox+W*0.26},${oy-BH-TH-14} ${ox+W*0.3},${oy-BH-TH-8}`}
        stroke="#aaa" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      <Box id={id} m={m} px={ox+UX} py={oy-BH-TH-GAP} W={UW} H={UH} D={D*0.65} />
      <line x1={ox+UX+UW*0.5} y1={oy-BH-TH-GAP} x2={ox+UX+UW*0.5} y2={oy-BH-TH-GAP-UH}
        stroke={m.edge} strokeWidth="0.8" />

      {/* Фасад нижнего ряда */}
      {[0,1,2].map(i => (
        <FacadeOverlay key={i} px={ox+W/3*i+1} py={oy-BH+2} W={W/3-2} H={BH-4} facade={facade} />
      ))}
      {/* Текстура нижних фасадов */}
      <TextureLayer px={ox} py={oy-BH} W={W} H={BH} texture={texture} />

      {/* Ручки — без ручек если стеклянные */}
      {facade !== "glass" && [0.14,0.47,0.8].map((t,i) => <Handle key={i} x={ox+W*t} y={oy-BH*0.42} len={16} color={m.handle} />)}
      {facade !== "glass" && [0.2,0.72].map((t,i) => <Handle key={i} x={ox+UX+UW*t} y={oy-BH-TH-GAP-UH*0.65} len={14} color={m.handle} />)}

      {/* Фасад верхних шкафов */}
      <FacadeOverlay px={ox+UX+1} py={oy-BH-TH-GAP-UH+2} W={UW-2} H={UH-4} facade={facade} />
      <TextureLayer px={ox+UX} py={oy-BH-TH-GAP-UH} W={UW} H={UH} texture={texture} />

      {/* Наполнение нижних ящиков */}
      <FillingViz px={ox} py={oy-BH} W={W} H={BH} filling={filling} />

      <polygon points={`${ox},${oy-BH-TH} ${ox+W},${oy-BH-TH} ${ox+W},${oy-BH-TH-GAP} ${ox},${oy-BH-TH-GAP}`}
        fill="rgba(200,210,220,0.5)" stroke="rgba(150,160,170,0.4)" strokeWidth="0.5" />
      {[0.25,0.5,0.75].map((t,i) => (
        <line key={i} x1={ox+W*t} y1={oy-BH-TH} x2={ox+W*t} y2={oy-BH-TH-GAP}
          stroke="rgba(150,160,170,0.3)" strokeWidth="0.4" />
      ))}
    </svg>
  );
}

// ─── ШКАФ-КУПЕ ───────────────────────────────────────────────────────────────
function WardrobeSVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const ox = 18, oy = 175;
  const PH = H*0.04;

  return (
    <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5+D*0.866*0.4} cy={oy+4} rx={W*0.52} ry={7} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      <Box id={id} m={m} px={ox} py={oy} W={W} H={PH} D={D}
        faceOverride={m.s1} topOverride={m.s1} sideOverride={m.edge} />
      <Box id={id} m={m} px={ox} py={oy-PH} W={W} H={H-PH} D={D} />

      <Box id={id} m={m} px={ox} py={oy-PH} W={W} H={4} D={D+2}
        faceOverride="#999" topOverride="#bbb" sideOverride="#888" />
      <Box id={id} m={m} px={ox} py={oy-PH-(H-PH)+4} W={W} H={4} D={D*0.3}
        faceOverride="#999" topOverride="#bbb" sideOverride="#888" />

      {/* Левая дверь: зеркало или фасад */}
      {facade === "mirror" ? (
        <>
          <polygon
            points={`${ox+2},${oy-PH-4} ${ox+W*0.49},${oy-PH-4} ${ox+W*0.49},${oy-PH-(H-PH)+8} ${ox+2},${oy-PH-(H-PH)+8}`}
            fill="rgba(185,215,235,0.38)" stroke="rgba(180,210,230,0.7)" strokeWidth="0.8" />
          <polygon points={`${ox+2},${oy-PH-4} ${ox+W*0.18},${oy-PH-4} ${ox+W*0.14},${oy-PH-(H-PH)+8} ${ox+2},${oy-PH-(H-PH)+8}`}
            fill="rgba(255,255,255,0.22)" />
        </>
      ) : (
        <>
          <polygon
            points={`${ox+2},${oy-PH-4} ${ox+W*0.49},${oy-PH-4} ${ox+W*0.49},${oy-PH-(H-PH)+8} ${ox+2},${oy-PH-(H-PH)+8}`}
            fill={`url(#gF${id})`} stroke={m.edge} strokeWidth="0.5" />
          <FacadeOverlay px={ox+2} py={oy-PH-(H-PH)+8} W={W*0.47} H={(H-PH)-12} facade={facade} />
          <TextureLayer px={ox+2} py={oy-PH-(H-PH)+8} W={W*0.47} H={(H-PH)-12} texture={texture} />
        </>
      )}

      {/* Правая дверь: всегда с фасадом */}
      <polygon
        points={`${ox+W*0.51},${oy-PH-4} ${ox+W-2},${oy-PH-4} ${ox+W-2},${oy-PH-(H-PH)+8} ${ox+W*0.51},${oy-PH-(H-PH)+8}`}
        fill={`url(#gF${id})`} stroke={m.edge} strokeWidth="0.5" />
      <FacadeOverlay px={ox+W*0.51} py={oy-PH-(H-PH)+8} W={W*0.47} H={(H-PH)-12} facade={facade} />
      <TextureLayer px={ox+W*0.51} py={oy-PH-(H-PH)+8} W={W*0.47} H={(H-PH)-12} texture={texture} />

      {/* Ручки */}
      {facade !== "mirror" && <>
        <Handle x={ox+W*0.44} y={oy-PH-(H-PH)*0.52} len={12} vert color={m.handle} />
        <Handle x={ox+W*0.54} y={oy-PH-(H-PH)*0.52} len={12} vert color={m.handle} />
      </>}

      {/* Наполнение — показываем сквозь прозрачную дверь */}
      <FillingViz px={ox+2} py={oy-PH-(H-PH)+8} W={W*0.47} H={(H-PH)-12} filling={filling} />
    </svg>
  );
}

// ─── ДИВАН ───────────────────────────────────────────────────────────────────
function SofaSVG({ W, H, D, m, id, facade="fabric", texture="smooth", filling={} }: SvgProps) {
  const ox = 12, oy = 172;
  const armW = W*0.11; const seatH = H*0.36; const backH = H*0.5; const legH = H*0.14;
  const legColor = m.grain ? "#3d2008" : "#444";

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5+D*0.866*0.35} cy={oy+5} rx={W*0.5} ry={7} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      {[ox+armW*0.4, ox+W-armW*0.4-5].map((lx,i) => (
        <Box key={i} id={id} m={m} px={lx} py={oy} W={5} H={legH} D={4}
          faceOverride={legColor} topOverride={legColor} sideOverride={legColor} />
      ))}

      <Box id={id} m={m} px={ox} py={oy-legH} W={W} H={seatH} D={D} />
      {/* Текстура/фасад обивки сиденья */}
      <FacadeOverlay px={ox} py={oy-legH-seatH} W={W} H={seatH} facade={facade} />
      <TextureLayer  px={ox} py={oy-legH-seatH} W={W} H={seatH} texture={texture} />

      <Box id={id} m={m} px={ox} py={oy-legH-seatH} W={W} H={backH} D={D*0.25} />
      {/* Текстура/фасад спинки */}
      <FacadeOverlay px={ox} py={oy-legH-seatH-backH} W={W} H={backH} facade={facade} />
      <TextureLayer  px={ox} py={oy-legH-seatH-backH} W={W} H={backH} texture={texture} />

      <Box id={id} m={m} px={ox} py={oy-legH} W={armW} H={seatH+backH*0.72} D={D}
        faceOverride={m.f1} topOverride={m.t0} sideOverride={m.s1} />
      <Box id={id} m={m} px={ox+W-armW} py={oy-legH} W={armW} H={seatH+backH*0.72} D={D}
        faceOverride={m.f1} topOverride={m.t0} sideOverride={m.s1} />

      {(W > 80 ? [0.15,0.51,0.77] : [0.2,0.62]).map((t,i) => (
        <Box key={i} id={id} m={m}
          px={ox+armW+(W-2*armW)*t} py={oy-legH-seatH}
          W={(W-2*armW)*0.29} H={seatH*0.28} D={D*0.9}
          faceOverride={m.t0} topOverride={m.f0} sideOverride={m.s0} opacity={0.9} />
      ))}

      {(W > 80 ? [0.18,0.72] : [0.45]).map((t,i) => (
        <Box key={i} id={id} m={m}
          px={ox+armW+(W-2*armW)*t} py={oy-legH-seatH-backH*0.6}
          W={(W-2*armW)*0.22} H={backH*0.55} D={D*0.22}
          faceOverride={m.f0} topOverride={m.t0} sideOverride={m.s0} opacity={0.85} />
      ))}
    </svg>
  );
}

// ─── СПАЛЬНЯ ─────────────────────────────────────────────────────────────────
function BedroomSVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const ox = 14, oy = 170;
  const frameH = H*0.18; const mattH = H*0.2; const headH = H*0.55; const legH = H*0.07;
  const cx = D*0.866; const cy = D*0.5;

  return (
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5+cx*0.45} cy={oy+5} rx={W*0.5} ry={7} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      {[ox+4, ox+W-10].map((lx,i) => (
        <Box key={i} id={id} m={m} px={lx} py={oy} W={6} H={legH} D={5}
          faceOverride={m.s1} topOverride={m.s1} sideOverride={m.edge} />
      ))}

      <Box id={id} m={m} px={ox} py={oy-legH} W={W} H={frameH} D={D} />

      <Box id={id} m={m} px={ox+W*0.025} py={oy-legH-frameH} W={W*0.95} H={mattH} D={D*0.95}
        faceOverride="#eeeae4" topOverride="#f5f3ee" sideOverride="#d8d4cc" />
      {[0.25,0.5,0.75].map((t,i) => (
        <line key={i} x1={ox+W*0.025+W*0.95*t} y1={oy-legH-frameH}
          x2={ox+W*0.025+W*0.95*t} y2={oy-legH-frameH-mattH}
          stroke="rgba(0,0,0,0.06)" strokeWidth="0.7" />
      ))}

      <polygon points={`
        ${ox+W*0.025},${oy-legH-frameH-mattH}
        ${ox+W*0.975},${oy-legH-frameH-mattH}
        ${ox+W*0.975+cx*0.95},${oy-legH-frameH-mattH-cy*0.95}
        ${ox+W*0.025+cx*0.95},${oy-legH-frameH-mattH-cy*0.95}
      `} fill="#f0ece4" stroke="#d8d4cc" strokeWidth="0.6" />

      {(W > 80 ? [0.07,0.52] : [0.2]).map((t,i) => (
        <Box key={i} id={id} m={m}
          px={ox+W*0.04+W*0.9*t} py={oy-legH-frameH-mattH}
          W={W*0.38} H={mattH*0.6} D={D*0.3}
          faceOverride="#ffffff" topOverride="#f5f5f5" sideOverride="#ddd" />
      ))}

      <Box id={id} m={m} px={ox} py={oy-legH-frameH-mattH} W={W} H={headH} D={D*0.15} />
      {/* Фасад и текстура изголовья */}
      <FacadeOverlay px={ox+W*0.05} py={oy-legH-frameH-mattH-headH*0.9} W={W*0.9} H={headH*0.84} facade={facade} />
      <TextureLayer  px={ox+W*0.05} py={oy-legH-frameH-mattH-headH*0.9} W={W*0.9} H={headH*0.84} texture={texture} />
      <line x1={ox+W*0.05} y1={oy-legH-frameH-mattH-headH*0.5}
        x2={ox+W*0.95} y2={oy-legH-frameH-mattH-headH*0.5}
        stroke={m.edge} strokeWidth="0.5" strokeDasharray="3 3" />

      {[-W*0.2-4, W+4].map((dx,i) => (
        <Box key={i} id={id} m={m} px={ox+dx} py={oy-legH}
          W={W*0.18} H={mattH+frameH*0.5} D={D*0.55} opacity={0.9} />
      ))}
      {/* Ящики под кроватью */}
      <FillingViz px={ox} py={oy-legH} W={W} H={frameH} filling={filling} />
    </svg>
  );
}

// ─── ПРИХОЖАЯ ────────────────────────────────────────────────────────────────
function HallawaySVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const ox = 20, oy = 175;
  const shoeH = H*0.25; const bodyH = H*0.55;

  return (
    <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5} cy={oy+4} rx={W*0.48} ry={6} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      <Box id={id} m={m} px={ox} py={oy} W={W} H={shoeH} D={D} />
      <FacadeOverlay px={ox+1} py={oy-shoeH+1} W={W-2} H={shoeH-2} facade={facade} />
      <TextureLayer  px={ox+1} py={oy-shoeH+1} W={W-2} H={shoeH-2} texture={texture} />
      <Handle x={ox+W*0.38} y={oy-shoeH*0.45} len={W*0.24} color={m.handle} />

      <Box id={id} m={m} px={ox} py={oy-shoeH} W={W} H={bodyH} D={D*0.65} />
      <FacadeOverlay px={ox+1} py={oy-shoeH-bodyH+1} W={W-2} H={bodyH-2} facade={facade} />
      <TextureLayer  px={ox+1} py={oy-shoeH-bodyH+1} W={W-2} H={bodyH-2} texture={texture} />
      <FillingViz    px={ox+1} py={oy-shoeH-bodyH+1} W={W-2} H={bodyH-2} filling={filling} />
      {[0.3,0.62].map((t,i) => (
        <Box key={i} id={id} m={m} px={ox+W*0.03} py={oy-shoeH-bodyH*t}
          W={W*0.94} H={5} D={D*0.62}
          faceOverride={m.t0} topOverride={m.t1} sideOverride={m.s1} />
      ))}

      <polygon points={`${ox+W*0.1},${oy-shoeH-bodyH-H*0.04} ${ox+W*0.9},${oy-shoeH-bodyH-H*0.04} ${ox+W*0.9},${oy-shoeH-bodyH-H*0.2} ${ox+W*0.1},${oy-shoeH-bodyH-H*0.2}`}
        fill="rgba(185,215,235,0.4)" stroke="rgba(180,210,230,0.7)" strokeWidth="1" />
      <polygon points={`${ox+W*0.1},${oy-shoeH-bodyH-H*0.04} ${ox+W*0.22},${oy-shoeH-bodyH-H*0.04} ${ox+W*0.18},${oy-shoeH-bodyH-H*0.2} ${ox+W*0.1},${oy-shoeH-bodyH-H*0.2}`}
        fill="rgba(255,255,255,0.2)" />

      {[0.18,0.42,0.66,0.88].map((t,i) => (
        <g key={i}>
          <circle cx={ox+W*t} cy={oy-shoeH-bodyH-H*0.005} r={2.5} fill={m.handle} stroke={m.edge} strokeWidth="0.5" />
          <path d={`M${ox+W*t},${oy-shoeH-bodyH-H*0.005} Q${ox+W*t+6},${oy-shoeH-bodyH+H*0.04} ${ox+W*t+4},${oy-shoeH-bodyH+H*0.09}`}
            stroke={m.handle} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

// ─── КАБИНЕТ ─────────────────────────────────────────────────────────────────
function OfficeSVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const ox = 14, oy = 168;
  const deskH = H*0.09; const legH = H*0.48; const cabW = W*0.36; const cabH = legH+deskH;

  return (
    <svg viewBox="0 0 280 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5} cy={oy+5} rx={W*0.5} ry={7} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      <Box id={id} m={m} px={ox} py={oy} W={cabW} H={cabH} D={D*0.85} />
      {[0.3,0.65].map((t,i) => (
        <Handle key={i} x={ox+cabW*0.25} y={oy-cabH*t} len={cabW*0.5} color={m.handle} />
      ))}
      <Box id={id} m={m} px={ox+W-8} py={oy} W={7} H={legH} D={6}
        faceOverride={m.s1} topOverride={m.s0} sideOverride={m.edge} />
      <Box id={id} m={m} px={ox-2} py={oy-legH} W={W+4} H={deskH} D={D*0.85+2}
        faceOverride={m.grain?"#6b3e10":"#888"} topOverride={m.grain?"#8a5218":"#ccc"} sideOverride={m.grain?"#4a2a08":"#aaa"} />

      {/* Фасад тумбы */}
      <FacadeOverlay px={ox+1} py={oy-cabH+1} W={cabW-2} H={cabH-2} facade={facade} />
      <TextureLayer  px={ox+1} py={oy-cabH+1} W={cabW-2} H={cabH-2} texture={texture} />
      <FillingViz    px={ox+1} py={oy-cabH+1} W={cabW-2} H={cabH-2} filling={filling} />

      <Box id={id} m={m} px={ox+W*0.52} py={oy-legH-deskH} W={W*0.45} H={H*0.38} D={D*0.35} />
      <FacadeOverlay px={ox+W*0.52+1} py={oy-legH-deskH-H*0.38+1} W={W*0.44} H={H*0.38-2} facade={facade} />
      <Box id={id} m={m} px={ox+W*0.52+1} py={oy-legH-deskH-H*0.38*0.45} W={W*0.44} H={4} D={D*0.33}
        faceOverride={m.t0} topOverride={m.t1} sideOverride={m.s1} />

      <Box id={id} m={m} px={ox+W*0.17} py={oy-legH-deskH-H*0.36} W={W*0.28} H={H*0.3} D={3}
        faceOverride="#1a1c24" topOverride="#252830" sideOverride="#111" />
      <polygon points={`${ox+W*0.18},${oy-legH-deskH-H*0.34} ${ox+W*0.44},${oy-legH-deskH-H*0.34} ${ox+W*0.44},${oy-legH-deskH-H*0.06} ${ox+W*0.18},${oy-legH-deskH-H*0.06}`}
        fill="rgba(80,120,200,0.25)" />
      <Box id={id} m={m} px={ox+W*0.26} py={oy-legH-deskH} W={W*0.08} H={H*0.04} D={D*0.18}
        faceOverride="#222" topOverride="#333" sideOverride="#111" />
      <Box id={id} m={m} px={ox+W*0.12} py={oy-legH-deskH} W={W*0.28} H={3} D={D*0.38}
        faceOverride="#ccc" topOverride="#ddd" sideOverride="#aaa" />
    </svg>
  );
}

// ─── ВАННАЯ ──────────────────────────────────────────────────────────────────
function BathroomSVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const ox = 24, oy = 172;
  const cabH = H*0.52; const topH = 6;

  return (
    <svg viewBox="0 0 240 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5} cy={oy+4} rx={W*0.48} ry={6} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      <Box id={id} m={m} px={ox} py={oy} W={W} H={cabH} D={D} />
      <FacadeOverlay px={ox+1} py={oy-cabH+1} W={W-2} H={cabH-2} facade={facade} />
      <TextureLayer  px={ox+1} py={oy-cabH+1} W={W-2} H={cabH-2} texture={texture} />
      <FillingViz    px={ox+1} py={oy-cabH+1} W={W-2} H={cabH-2} filling={filling} />
      {[0.25,0.7].map((t,i) => <Handle key={i} x={ox+W*t-8} y={oy-cabH*0.45} len={16} color={m.handle} />)}

      <Box id={id} m={m} px={ox-3} py={oy-cabH} W={W+6} H={topH} D={D+4}
        faceOverride="#d5d5d5" topOverride="#ebebeb" sideOverride="#bbb" />

      <ellipse cx={ox+W*0.5} cy={oy-cabH-topH*0.3} rx={W*0.3} ry={W*0.13}
        fill="rgba(200,225,240,0.55)" stroke="#aac8dc" strokeWidth="1.2" />
      <ellipse cx={ox+W*0.5} cy={oy-cabH-topH*0.3} rx={W*0.22} ry={W*0.09}
        fill="rgba(150,200,225,0.4)" stroke="#9abcd0" strokeWidth="0.7" />
      <circle cx={ox+W*0.5} cy={oy-cabH-topH*0.3} r={2.5} fill="#888" />

      <Box id={id} m={m} px={ox+W*0.44} py={oy-cabH-topH-14} W={W*0.12} H={14} D={3}
        faceOverride="#c0c0c0" topOverride="#ddd" sideOverride="#aaa" />
      <path d={`M${ox+W*0.5},${oy-cabH-topH-12} Q${ox+W*0.62},${oy-cabH-topH-12} ${ox+W*0.62},${oy-cabH-topH-5}`}
        stroke="#bbb" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      <Box id={id} m={m} px={ox+W*0.06} py={oy-cabH-topH-H*0.05} W={W*0.88} H={H*0.38} D={D*0.2}
        faceOverride="rgba(185,215,235,0.45)" topOverride={m.t1} sideOverride={m.s1} />
      <polygon points={`${ox+W*0.06},${oy-cabH-topH-H*0.05} ${ox+W*0.22},${oy-cabH-topH-H*0.05} ${ox+W*0.18},${oy-cabH-topH-H*0.43} ${ox+W*0.06},${oy-cabH-topH-H*0.43}`}
        fill="rgba(255,255,255,0.18)" />
      <rect x={ox+W*0.06} y={oy-cabH-topH-H*0.05-H*0.38}
        width={W*0.88} height={H*0.38}
        fill="none" stroke={m.edge} strokeWidth="1.5" />
    </svg>
  );
}

// ─── ДЕТСКАЯ ─────────────────────────────────────────────────────────────────
function ChildroomSVG({ W, H, D, m, id, facade="matte", texture="smooth", filling={} }: SvgProps) {
  const ox = 14, oy = 172;
  const bedW = W*0.52; const deskW = W*0.38;
  const bedFrameH = H*0.17; const mattH = H*0.15; const headH = H*0.38; const legH = H*0.08;
  const deskH = H*0.08; const deskLegH = H*0.45;

  return (
    <svg viewBox="0 0 280 198" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5} cy={oy+5} rx={W*0.5} ry={7} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      {[ox+3, ox+bedW-9].map((lx,i) => (
        <Box key={i} id={id} m={m} px={lx} py={oy} W={6} H={legH} D={5}
          faceOverride={m.s1} topOverride={m.s1} sideOverride={m.edge} />
      ))}
      <Box id={id} m={m} px={ox} py={oy-legH} W={bedW} H={bedFrameH} D={D} />
      <FillingViz px={ox+1} py={oy-legH-bedFrameH+2} W={bedW-2} H={bedFrameH-4} filling={filling} />
      <Box id={id} m={m} px={ox+bedW*0.03} py={oy-legH-bedFrameH} W={bedW*0.94} H={mattH} D={D*0.94}
        faceOverride="#f5f0e8" topOverride="#fff" sideOverride="#ddd" />
      <Box id={id} m={m} px={ox+bedW*0.06} py={oy-legH-bedFrameH-mattH} W={bedW*0.38} H={mattH*0.55} D={D*0.28}
        faceOverride="#fff" topOverride="#f5f5f5" sideOverride="#ddd" />
      <Box id={id} m={m} px={ox} py={oy-legH-bedFrameH-mattH} W={bedW} H={headH} D={D*0.14} />
      <FacadeOverlay px={ox+bedW*0.05} py={oy-legH-bedFrameH-mattH-headH*0.9} W={bedW*0.9} H={headH*0.85} facade={facade} />
      <TextureLayer  px={ox+bedW*0.05} py={oy-legH-bedFrameH-mattH-headH*0.9} W={bedW*0.9} H={headH*0.85} texture={texture} />

      <Box id={id} m={m} px={ox+bedW+W*0.05} py={oy-deskLegH} W={deskW} H={deskH} D={D*0.58}
        faceOverride={m.t0} topOverride={m.t0} sideOverride={m.s1} />
      {[0, deskW-5].map((dx,i) => (
        <Box key={i} id={id} m={m} px={ox+bedW+W*0.05+dx} py={oy} W={5} H={deskLegH} D={4}
          faceOverride={m.s1} topOverride={m.s0} sideOverride={m.edge} />
      ))}
      <Box id={id} m={m} px={ox+bedW+W*0.05} py={oy-deskLegH-H*0.3} W={deskW} H={4} D={D*0.3}
        faceOverride={m.f0} topOverride={m.t0} sideOverride={m.s1} />

      {[0.08,0.2,0.32,0.5,0.65].map((t,i) => (
        <Box key={i} id={id} m={m}
          px={ox+bedW+W*0.05+deskW*t} py={oy-deskLegH-H*0.3}
          W={deskW*0.1} H={H*0.18+i*3} D={D*0.26}
          faceOverride={["#c0392b","#2980b9","#27ae60","#8e44ad","#e67e22"][i]}
          topOverride={["#922b21","#1f618d","#1e8449","#6c3483","#b7770d"][i]}
          sideOverride={["#7b241c","#1a5276","#196f3d","#5b2c6f","#9a7d0a"][i]}
          opacity={0.9} />
      ))}
    </svg>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
let _uid = 0;
const MAT_NAMES: Record<string,string> = {
  ldsp:"ЛДСП", mdf:"МДФ", massiv:"Массив дерева", mdf_kraska:"МДФ + эмаль",
};

// Смешивает базовый материал с выбранным цветом
function applyColor(base: ReturnType<typeof getM>, hex?: string): ReturnType<typeof getM> {
  if (!hex) return base;
  // Осветляем/затемняем hex для трёх граней
  const darken = (h: string, amt: number) => {
    const n = parseInt(h.replace("#",""), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) - amt));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) - amt));
    const b = Math.max(0, Math.min(255, (n & 0xff) - amt));
    return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,"0")}`;
  };
  return {
    ...base,
    f0: hex,
    f1: darken(hex, 30),
    t0: darken(hex, 18),
    t1: darken(hex, 45),
    s0: darken(hex, 38),
    s1: darken(hex, 60),
    edge: darken(hex, 70),
    handle: darken(hex, 80),
  };
}

export default function FurniturePreview({ type, material, color, style, facade, texture, filling, width, height, depth }: Props) {
  const id = useMemo(() => `fp${_uid++}`, []);
  const mBase = useMemo(() => getM(material), [material]);
  const m = useMemo(() => applyColor(mBase, color), [mBase, color]);

  const W = useMemo(() => {
    const base = type === "sofa" ? 220 : type === "bedroom" ? 190 : 200;
    const ref  = type === "sofa" ? 300 : type === "bedroom" ? 200 : 240;
    return Math.min(Math.max((width / ref) * base, base * 0.42), base * 1.05);
  }, [width, type]);

  const H = useMemo(() => {
    if (type === "sofa")    return Math.min(Math.max((depth  / 90)  * 70,  36), 90);
    if (type === "bedroom") return Math.min(Math.max((height / 220) * 110, 55), 138);
    return Math.min(Math.max((height / 220) * 120, 52), 150);
  }, [height, depth, type]);

  const D = useMemo(() => {
    if (type === "sofa") return Math.min(Math.max((depth / 90) * 38, 20), 50);
    return Math.min(Math.max((depth / 65) * 32, 15), 44);
  }, [depth, type]);

  const svgProps = { W, H, D, m, id, facade, texture, filling };

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

  return (
    <div>
      <div className="aspect-[4/3] flex items-center justify-center">
        {type === "kitchen"   && <KitchenSVG   {...svgProps} />}
        {type === "wardrobe"  && <WardrobeSVG  {...svgProps} />}
        {type === "sofa"      && <SofaSVG      {...svgProps} />}
        {type === "bedroom"   && <BedroomSVG   {...svgProps} />}
        {type === "hallway"   && <HallawaySVG  {...svgProps} />}
        {type === "office"    && <OfficeSVG    {...svgProps} />}
        {type === "bathroom"  && <BathroomSVG  {...svgProps} />}
        {type === "childroom" && <ChildroomSVG {...svgProps} />}
      </div>

      {material && (
        <div className="flex items-center gap-2 px-1 mt-1 pb-1">
          <div className="w-3 h-3 rounded-sm flex-shrink-0 ring-1 ring-white/10"
            style={{ background: color ?? m.f0 }} />
          <span className="text-[9px] text-white/30 tracking-widest uppercase">
            {MAT_NAMES[material] ?? material}
          </span>
          <span className="ml-auto text-[9px] text-white/20 tabular-nums">
            {width}×{height}×{depth} см
          </span>
        </div>
      )}
    </div>
  );
}