import { useMemo } from "react";

interface Props {
  type: string;
  material: string;
  style: string;
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

// ─── КУХНЯ ───────────────────────────────────────────────────────────────────
function KitchenSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
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

      {[0.14,0.47,0.8].map((t,i) => <Handle key={i} x={ox+W*t} y={oy-BH*0.42} len={16} color={m.handle} />)}
      {[0.2,0.72].map((t,i) => <Handle key={i} x={ox+UX+UW*t} y={oy-BH-TH-GAP-UH*0.65} len={14} color={m.handle} />)}

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
function WardrobeSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
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

      <polygon
        points={`${ox+2},${oy-PH-4} ${ox+W*0.49},${oy-PH-4} ${ox+W*0.49},${oy-PH-(H-PH)+8} ${ox+2},${oy-PH-(H-PH)+8}`}
        fill="rgba(185,215,235,0.35)" stroke="rgba(180,210,230,0.6)" strokeWidth="0.8" />
      <polygon
        points={`${ox+2},${oy-PH-4} ${ox+W*0.18},${oy-PH-4} ${ox+W*0.14},${oy-PH-(H-PH)+8} ${ox+2},${oy-PH-(H-PH)+8}`}
        fill="rgba(255,255,255,0.18)" />

      <polygon
        points={`${ox+W*0.51},${oy-PH-4} ${ox+W-2},${oy-PH-4} ${ox+W-2},${oy-PH-(H-PH)+8} ${ox+W*0.51},${oy-PH-(H-PH)+8}`}
        fill={`url(#gF${id})`} stroke={m.edge} strokeWidth="0.5" />
      {m.grain && [0.58,0.66,0.74,0.82,0.9].map((t,i) => (
        <line key={i} x1={ox+W*t} y1={oy-PH-4} x2={ox+W*t} y2={oy-PH-(H-PH)+8}
          stroke="rgba(0,0,0,0.06)" strokeWidth="0.7" />
      ))}
      {m.gloss && (
        <polygon
          points={`${ox+W*0.51},${oy-PH-4} ${ox+W*0.68},${oy-PH-4} ${ox+W*0.65},${oy-PH-(H-PH)+8} ${ox+W*0.51},${oy-PH-(H-PH)+8}`}
          fill="rgba(255,255,255,0.14)" />
      )}

      <Handle x={ox+W*0.44} y={oy-PH-(H-PH)*0.52} len={12} vert color={m.handle} />
      <Handle x={ox+W*0.54} y={oy-PH-(H-PH)*0.52} len={12} vert color={m.handle} />
    </svg>
  );
}

// ─── ДИВАН ───────────────────────────────────────────────────────────────────
function SofaSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
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
      <Box id={id} m={m} px={ox} py={oy-legH-seatH} W={W} H={backH} D={D*0.25} />

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
function BedroomSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
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
      <polygon points={`
        ${ox+W*0.05},${oy-legH-frameH-mattH-headH*0.9}
        ${ox+W*0.95},${oy-legH-frameH-mattH-headH*0.9}
        ${ox+W*0.95},${oy-legH-frameH-mattH-headH*0.06}
        ${ox+W*0.05},${oy-legH-frameH-mattH-headH*0.06}
      `} fill={m.gloss ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)"} />
      <line x1={ox+W*0.05} y1={oy-legH-frameH-mattH-headH*0.5}
        x2={ox+W*0.95} y2={oy-legH-frameH-mattH-headH*0.5}
        stroke={m.edge} strokeWidth="0.5" strokeDasharray="3 3" />

      {[-W*0.2-4, W+4].map((dx,i) => (
        <Box key={i} id={id} m={m} px={ox+dx} py={oy-legH}
          W={W*0.18} H={mattH+frameH*0.5} D={D*0.55} opacity={0.9} />
      ))}
    </svg>
  );
}

// ─── ПРИХОЖАЯ ────────────────────────────────────────────────────────────────
function HallawaySVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
  const ox = 20, oy = 175;
  const shoeH = H*0.25; const bodyH = H*0.55;

  return (
    <svg viewBox="0 0 260 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5} cy={oy+4} rx={W*0.48} ry={6} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      <Box id={id} m={m} px={ox} py={oy} W={W} H={shoeH} D={D} />
      <Handle x={ox+W*0.38} y={oy-shoeH*0.45} len={W*0.24} color={m.handle} />

      <Box id={id} m={m} px={ox} py={oy-shoeH} W={W} H={bodyH} D={D*0.65} />
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
function OfficeSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
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

      <Box id={id} m={m} px={ox+W*0.52} py={oy-legH-deskH} W={W*0.45} H={H*0.38} D={D*0.35} />
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
function BathroomSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
  const ox = 24, oy = 172;
  const cabH = H*0.52; const topH = 6;

  return (
    <svg viewBox="0 0 240 195" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <Defs id={id} m={m} />
      <ellipse cx={ox+W*0.5} cy={oy+4} rx={W*0.48} ry={6} fill={`url(#gSh${id})`} filter={`url(#blur${id})`} />

      <Box id={id} m={m} px={ox} py={oy} W={W} H={cabH} D={D} />
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
function ChildroomSVG({ W, H, D, m, id }: { W:number; H:number; D:number; m:ReturnType<typeof getM>; id:string }) {
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
      <Box id={id} m={m} px={ox+bedW*0.03} py={oy-legH-bedFrameH} W={bedW*0.94} H={mattH} D={D*0.94}
        faceOverride="#f5f0e8" topOverride="#fff" sideOverride="#ddd" />
      <Box id={id} m={m} px={ox+bedW*0.06} py={oy-legH-bedFrameH-mattH} W={bedW*0.38} H={mattH*0.55} D={D*0.28}
        faceOverride="#fff" topOverride="#f5f5f5" sideOverride="#ddd" />
      <Box id={id} m={m} px={ox} py={oy-legH-bedFrameH-mattH} W={bedW} H={headH} D={D*0.14} />

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

export default function FurniturePreview({ type, material, style, width, height, depth }: Props) {
  const id = useMemo(() => `fp${_uid++}`, []);
  const m  = useMemo(() => getM(material), [material]);

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

  const svgProps = { W, H, D, m, id };

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
            style={{ background: m.f0 }} />
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
