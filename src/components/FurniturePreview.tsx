import { useMemo } from "react";

interface Props {
  type: string;
  material: string;
  color?: string;
  style: string;
  facade?: string;
  texture?: string;
  filling?: Record<string, number>;
  extras?: string[];
  width: number;
  height: number;
  depth: number;
}

// ─── МАТЕРИАЛЫ ───────────────────────────────────────────────────────────────
const MAT: Record<string, { f0:string; f1:string; t0:string; t1:string; s0:string; s1:string; edge:string; grain:boolean; gloss:boolean; handle:string }> = {
  ldsp:       { f0:"#e8dcc8", f1:"#c4a87a", t0:"#d0bfa0", t1:"#a88858", s0:"#b89870", s1:"#8a6840", edge:"#7a5c30", grain:false, gloss:false, handle:"#5a4020" },
  mdf:        { f0:"#d8d4cf", f1:"#aba6a0", t0:"#c0bcb6", t1:"#909088", s0:"#a8a49e", s1:"#787470", edge:"#5a5854", grain:false, gloss:false, handle:"#383632" },
  massiv:     { f0:"#c8813c", f1:"#7e4818", t0:"#b07030", t1:"#703c10", s0:"#905820", s1:"#582808", edge:"#3c1c04", grain:true,  gloss:false, handle:"#281004" },
  mdf_kraska: { f0:"#f6f6f6", f1:"#d8d8d8", t0:"#e8e8e8", t1:"#c4c4c4", s0:"#d4d4d4", s1:"#b0b0b0", edge:"#999",   grain:false, gloss:true,  handle:"#707070" },
  default:    { f0:"#e0d4bc", f1:"#b8a880", t0:"#ccc0a0", t1:"#a08c60", s0:"#b4a07c", s1:"#8c7850", edge:"#7c6440", grain:false, gloss:false, handle:"#5c4830" },
};
function getM(mat: string) { return MAT[mat] ?? MAT.default; }

function darken(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#",""), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) - amt);
  const g = clamp(((n >> 8) & 0xff) - amt);
  const b = clamp((n & 0xff) - amt);
  return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,"0")}`;
}
function lighten(hex: string, amt: number): string { return darken(hex, -amt); }

function applyColor(base: ReturnType<typeof getM>, hex?: string): ReturnType<typeof getM> {
  if (!hex) return base;
  return { ...base, f0:hex, f1:darken(hex,35), t0:darken(hex,22), t1:darken(hex,50), s0:darken(hex,42), s1:darken(hex,65), edge:darken(hex,75), handle:darken(hex,85) };
}

// ─── ИЗОМЕТРИЧЕСКИЙ ДВИЖОК ───────────────────────────────────────────────────
// Все координаты в "мировых" единицах: x=ширина, y=глубина, z=высота
// Проекция: screen_x = x*CX - y*CX, screen_y = -x*CY - y*CY - z*2 + базовая_линия
const CX = 1.0; // горизонтальный масштаб на ед. x/y
const CY = 0.5; // вертикальный масштаб на ед. x/y

function iso(x: number, y: number, z: number, bx: number, bz: number): [number,number] {
  return [bx + (x - y) * CX * 30, bz - (x + y) * CY * 30 - z * 60];
}

// Цвет грани в зависимости от ориентации
// front (facing viewer) → face color, top → top color, right side → side color
type M = ReturnType<typeof getM>;

// Реалистичный изометрический Box с правильным освещением:
// — верх ярче (свет сверху), лицо среднее, правый бок темнее
// — мягкие рёбра, внутренний контур, тонкая светлая линия на верхнем ребре
function IsoBox({ bx, bz, wx, wy, wz, dw, dd, dh, m, faceC, topC, sideC, opacity=1 }: {
  bx:number; bz:number; wx:number; wy:number; wz:number;
  dw:number; dd:number; dh:number; m:M;
  faceC?:string; topC?:string; sideC?:string; opacity?:number;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const A = p(0,0,0); const B = p(dw,0,0); const C = p(dw,dd,0); const D = p(0,dd,0);
  const E = p(0,0,dh); const F = p(dw,0,dh); const G = p(dw,dd,dh); const H = p(0,dd,dh);
  const pt = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;

  const fc = faceC ?? m.f0;
  const tc = topC  ?? m.t0;
  const sc = sideC ?? m.s0;

  // Освещение: свет идёт слева сверху
  const topLit    = lighten(tc, 6);    // верх — самый светлый
  const faceLit   = fc;                 // лицо — средний
  const faceShade = darken(fc, 8);     // низ лица в тени
  const rightDark = darken(sc, 10);    // правый бок — темнее
  const edgeC     = darken(m.edge, 8);

  return (
    <g opacity={opacity}>
      {/* Правая боковая грань (x=dw) — тёмная */}
      <polygon points={`${pt(B)} ${pt(C)} ${pt(G)} ${pt(F)}`} fill={rightDark} stroke={edgeC} strokeWidth="0.4" />
      {/* Лицевая грань (y=0) с вертикальным градиентом через два полигона */}
      <polygon points={`${pt(A)} ${pt(B)} ${pt(F)} ${pt(E)}`} fill={faceLit} stroke={edgeC} strokeWidth="0.4" />
      <polygon points={`${pt(A)} ${pt(B)} ${p(dw,0,dh*0.25)[0]},${p(dw,0,dh*0.25)[1]} ${p(0,0,dh*0.25)[0]},${p(0,0,dh*0.25)[1]}`} fill={faceShade} opacity="0.5" />
      {/* Верхняя (z=dh) — светлая */}
      <polygon points={`${pt(E)} ${pt(F)} ${pt(G)} ${pt(H)}`} fill={topLit} stroke={edgeC} strokeWidth="0.4" />
      {/* Тонкий блик на верхнем переднем ребре */}
      <line x1={E[0]} y1={E[1]} x2={F[0]} y2={F[1]} stroke={lighten(tc,18)} strokeWidth="0.5" opacity="0.8" />
      {/* Волокна дерева — только на лицевой */}
      {m.grain && [0.15,0.3,0.45,0.6,0.78,0.9].map((t,i) => {
        const x1 = p(dw*t,0,0); const x2 = p(dw*t,0,dh);
        return <line key={i} x1={x1[0]} y1={x1[1]} x2={x2[0]} y2={x2[1]} stroke="rgba(0,0,0,0.07)" strokeWidth="0.5"/>;
      })}
      {/* Глянцевый блик с мягким переходом */}
      {m.gloss && (() => {
        const a = p(dw*0.05,0,dh*0.95); const b = p(dw*0.35,0,dh*0.95);
        const c = p(dw*0.22,0,dh*0.25); const d2 = p(dw*0.05,0,dh*0.25);
        return <polygon points={`${pt(a)} ${pt(b)} ${pt(c)} ${pt(d2)}`} fill="rgba(255,255,255,0.22)"/>;
      })()}
    </g>
  );
}

// Реалистичная тонкая полка с передним кантом и нижней тенью
function IsoShelf({ bx, bz, wx, wy, wz, dw, dd, m, thick=0.02 }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dd:number; m:M; thick?:number;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const pt = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  // Тень под полкой
  const s1 = p(0.02,0.02,-0.005); const s2 = p(dw-0.02,0.02,-0.005);
  return (
    <g>
      <line x1={s1[0]} y1={s1[1]+2} x2={s2[0]} y2={s2[1]+2} stroke="rgba(0,0,0,0.2)" strokeWidth="2"/>
      <IsoBox bx={bx} bz={bz} wx={wx} wy={wy} wz={wz} dw={dw} dd={dd} dh={thick} m={m}
        faceC={darken(m.f0,3)} topC={lighten(m.t0,10)} sideC={m.s0} />
      {/* Передний кант — небольшой выступ */}
      {(() => {
        const a = p(0,0,thick); const b = p(dw,0,thick);
        return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={lighten(m.t0,22)} strokeWidth="0.8" opacity="0.9"/>;
      })()}
    </g>
  );
}

// Реалистичная хромированная штанга с кронштейнами и вешалками-плечиками
function IsoRail({ bx, bz, wx, wy, wz, dw, m }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; m:M;
}) {
  void m;
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const A = p(0.02,0,0); const B = p(dw-0.02,0,0);
  // Кронштейны на концах
  const kA1 = p(0,0,0.08); const kA2 = p(0.05,0,0);
  const kB1 = p(dw,0,0.08); const kB2 = p(dw-0.05,0,0);
  return (
    <g>
      {/* Кронштейны */}
      <line x1={kA1[0]} y1={kA1[1]} x2={kA2[0]} y2={kA2[1]} stroke="#8a93a0" strokeWidth="2" strokeLinecap="round"/>
      <line x1={kB1[0]} y1={kB1[1]} x2={kB2[0]} y2={kB2[1]} stroke="#8a93a0" strokeWidth="2" strokeLinecap="round"/>
      {/* Сама штанга — градиент хрома (две линии) */}
      <line x1={A[0]} y1={A[1]+1} x2={B[0]} y2={B[1]+1} stroke="#5a6270" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="#c8d0d8" strokeWidth="2.8" strokeLinecap="round"/>
      <line x1={A[0]} y1={A[1]-0.5} x2={B[0]} y2={B[1]-0.5} stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8"/>
      {/* Плечики с одеждой */}
      {[0.15,0.32,0.5,0.68,0.85].map((t,i) => {
        const hang = p(dw*t,0,-0.02);
        const clW = 18; const clH = 26;
        // Крюк плечика
        const hookTop = p(dw*t,0,0.02);
        return <g key={i}>
          <path d={`M${hookTop[0]},${hookTop[1]} Q${hookTop[0]+3},${hookTop[1]-4} ${hookTop[0]+5},${hookTop[1]}`}
            stroke="#606878" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          {/* Плечики — треугольник */}
          <path d={`M${hang[0]-clW/2},${hang[1]+3} L${hang[0]+clW/2},${hang[1]+3} L${hang[0]},${hang[1]}Z`}
            fill="none" stroke="#707880" strokeWidth="0.8"/>
          {/* Одежда — прямоугольник */}
          <rect x={hang[0]-clW/2} y={hang[1]+3} width={clW} height={clH}
            fill={["#8a7a6a","#3a5a7a","#6a4a3a","#5a6a5a","#4a3a4a"][i]} opacity="0.75" rx="1"/>
          <rect x={hang[0]-clW/2} y={hang[1]+3} width={clW*0.25} height={clH}
            fill="rgba(255,255,255,0.12)" rx="1"/>
        </g>;
      })}
    </g>
  );
}

// Реалистичный ящик: лицевая панель с зазором, ручка-скоба или утопленная
function IsoDrawer({ bx, bz, wx, wy, wz, dw, dd, dh, m }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dd:number; dh:number; m:M;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const pt = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;

  // Лицевая панель ящика слегка светлее с мягким градиентом
  const faceC = lighten(m.f0, 4);

  // Рамка-шов вокруг ящика
  const gap = 0.015;
  const A = p(gap,0,gap); const B = p(dw-gap,0,gap); const F = p(dw-gap,0,dh-gap); const E = p(gap,0,dh-gap);

  return (
    <g>
      {/* Сам ящик (корпус — видимая лицевая панель + чуть-чуть объёма) */}
      <IsoBox bx={bx} bz={bz} wx={wx+gap} wy={wy} wz={wz+gap} dw={dw-gap*2} dd={dd} dh={dh-gap*2}
        m={m} faceC={faceC} topC={lighten(m.t0,4)} sideC={m.s0} />

      {/* Тёмный внутренний контур — создаёт шов */}
      <polygon points={`${pt(A)} ${pt(B)} ${pt(F)} ${pt(E)}`}
        fill="none" stroke={darken(m.edge,25)} strokeWidth="0.5" opacity="0.6" />

      {/* Ручка-скоба с подложкой */}
      {(() => {
        const hx1 = p(dw*0.3, -0.04, dh*0.75); const hx2 = p(dw*0.7, -0.04, dh*0.75);
        return <g>
          <line x1={hx1[0]} y1={hx1[1]+2} x2={hx2[0]} y2={hx2[1]+2}
            stroke="rgba(0,0,0,0.28)" strokeWidth="3.5" strokeLinecap="round"/>
          <line x1={hx1[0]} y1={hx1[1]} x2={hx2[0]} y2={hx2[1]}
            stroke={darken(m.handle,5)} strokeWidth="3" strokeLinecap="round"/>
          <line x1={hx1[0]} y1={hx1[1]-0.8} x2={hx2[0]} y2={hx2[1]-0.8}
            stroke={lighten(m.handle,35)} strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx={hx1[0]} cy={hx1[1]} r={1.8} fill={darken(m.handle,15)}/>
          <circle cx={hx2[0]} cy={hx2[1]} r={1.8} fill={darken(m.handle,15)}/>
        </g>;
      })()}
    </g>
  );
}

// Дверца с ручкой (открывается слева)
function IsoDoor({ bx, bz, wx, wy, wz, dw, dd, dh, m, facade="matte", handleSide="right", opacity=1 }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dd:number; dh:number;
  m:M; facade?:string; handleSide?:"left"|"right"; opacity?:number;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const pt = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;

  // Цвет фасада
  let faceC = m.f0;
  if (facade === "glossy")  faceC = lighten(m.f0, 12);
  if (facade === "matte")   faceC = m.f0;
  if (facade === "mirror")  faceC = "#b8d8e8";
  if (facade === "glass")   faceC = "rgba(180,215,235,0.55)";
  if (facade === "wood")    faceC = m.grain ? m.f0 : "#c8a060";

  const A = p(0,0,0); const B = p(dw,0,0); const F = p(dw,0,dh); const E = p(0,0,dh);

  // Рамка
  const inset = 0.06;
  const I1 = p(dw*inset, -0.02, dh*inset);
  const I2 = p(dw*(1-inset), -0.02, dh*inset);
  const I3 = p(dw*(1-inset), -0.02, dh*(1-inset));
  const I4 = p(dw*inset, -0.02, dh*(1-inset));

  const hx = handleSide === "right" ? dw*0.82 : dw*0.18;
  const hA = p(hx, -0.05, dh*0.42); const hB = p(hx, -0.05, dh*0.58);

  // Нижнее ребро для подсветки
  const faceShade = darken(faceC, 10);

  return (
    <g opacity={opacity}>
      {/* Основная панель с вертикальным градиентом (имитация) */}
      <polygon points={`${pt(A)} ${pt(B)} ${pt(F)} ${pt(E)}`}
        fill={faceC} stroke={m.edge} strokeWidth="0.5"/>
      {/* Нижняя тень на фасаде */}
      <polygon points={`${pt(A)} ${pt(B)} ${p(dw,0,dh*0.3)[0]},${p(dw,0,dh*0.3)[1]} ${p(0,0,dh*0.3)[0]},${p(0,0,dh*0.3)[1]}`}
        fill={faceShade} opacity="0.35"/>
      {/* Верхний светлый блик */}
      <line x1={E[0]} y1={E[1]} x2={F[0]} y2={F[1]} stroke={lighten(faceC,18)} strokeWidth="0.7" opacity="0.7"/>
      {/* Зеркальный блик */}
      {facade === "mirror" && <>
        <polygon points={`${pt(A)} ${pt(B)} ${pt(F)} ${pt(E)}`} fill="rgba(200,230,245,0.3)"/>
        <polygon points={`${pt(A)} ${pt(p(dw*0.22,0,0))} ${pt(p(dw*0.18,0,dh))} ${pt(E)}`} fill="rgba(255,255,255,0.28)"/>
        {/* Вертикальный блик */}
        <polygon points={`${pt(p(dw*0.55,0,0))} ${pt(p(dw*0.62,0,0))} ${pt(p(dw*0.58,0,dh))} ${pt(p(dw*0.51,0,dh))}`} fill="rgba(255,255,255,0.15)"/>
      </>}
      {/* Глянцевый блик */}
      {facade === "glossy" && <>
        <polygon points={`${pt(p(dw*0.05,0,dh*0.95))} ${pt(p(dw*0.32,0,dh*0.95))} ${pt(p(dw*0.22,0,dh*0.2))} ${pt(p(dw*0.05,0,dh*0.2))}`} fill="rgba(255,255,255,0.26)"/>
      </>}
      {/* Стеклянная вставка */}
      {facade === "glass" && <>
        <polygon points={`${pt(I1)} ${pt(I2)} ${pt(I3)} ${pt(I4)}`} fill="rgba(180,215,235,0.55)" stroke="rgba(150,190,210,0.7)" strokeWidth="0.4"/>
        <polygon points={`${pt(I1)} ${pt(p(dw*(inset+0.1),0,dh*inset))} ${pt(p(dw*(inset+0.07),0,dh*(1-inset)))} ${pt(I4)}`} fill="rgba(255,255,255,0.25)"/>
      </>}
      {/* Рамка-шов (филёнка) */}
      <polygon points={`${pt(I1)} ${pt(I2)} ${pt(I3)} ${pt(I4)}`}
        fill="none" stroke={darken(m.edge,18)} strokeWidth="0.5" opacity="0.7"/>
      {/* Волокна дерева */}
      {(facade === "wood" || m.grain) && [0.15,0.3,0.45,0.6,0.75,0.88].map((t,i) => {
        const a = p(dw*t,0,0); const b = p(dw*t,0,dh);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(0,0,0,0.08)" strokeWidth="0.5"/>;
      })}
      {/* Ручка с тенью и бликом */}
      <line x1={hA[0]+1.5} y1={hA[1]+1.5} x2={hB[0]+1.5} y2={hB[1]+1.5} stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1={hA[0]} y1={hA[1]} x2={hB[0]} y2={hB[1]} stroke={darken(m.handle,10)} strokeWidth="3" strokeLinecap="round"/>
      <line x1={hA[0]-0.6} y1={hA[1]-0.6} x2={hB[0]-0.6} y2={hB[1]-0.6} stroke={lighten(m.handle,32)} strokeWidth="1.3" strokeLinecap="round"/>
    </g>
  );
}

// Реалистичная горизонтальная ручка-скоба с тенью и бликом
function IsoHandleH({ bx, bz, wx, wy, wz, len, m }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; len:number; m:M;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const A = p(0,-0.06,0); const B = p(len,-0.06,0);
  return (
    <g>
      {/* Тень */}
      <line x1={A[0]+1.2} y1={A[1]+1.8} x2={B[0]+1.2} y2={B[1]+1.8} stroke="rgba(0,0,0,0.3)" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Основа */}
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={darken(m.handle,10)} strokeWidth="3" strokeLinecap="round"/>
      {/* Блик */}
      <line x1={A[0]} y1={A[1]-0.7} x2={B[0]} y2={B[1]-0.7} stroke={lighten(m.handle,30)} strokeWidth="1.2" strokeLinecap="round"/>
      {/* Крепления по бокам */}
      <circle cx={A[0]} cy={A[1]} r={1.6} fill={darken(m.handle,20)}/>
      <circle cx={B[0]} cy={B[1]} r={1.6} fill={darken(m.handle,20)}/>
    </g>
  );
}

// Реалистичная многослойная тень на полу
function Shadow({ bx, bz, cx, cz, rx, rz }: { bx:number; bz:number; cx:number; cz:number; rx:number; rz:number }) {
  const p = iso(cx, 0, 0, bx, bz);
  return (
    <g>
      {/* Внешний размытый ореол */}
      <ellipse cx={p[0]} cy={cz} rx={rx*1.15} ry={rz*1.4} fill="rgba(0,0,0,0.08)" filter="url(#sh)"/>
      {/* Основная тень */}
      <ellipse cx={p[0]} cy={cz} rx={rx} ry={rz} fill="rgba(0,0,0,0.22)" filter="url(#sh)"/>
      {/* Плотная центральная */}
      <ellipse cx={p[0]} cy={cz} rx={rx*0.6} ry={rz*0.55} fill="rgba(0,0,0,0.14)"/>
    </g>
  );
}

// ─── EXTRAS-КОМПОНЕНТЫ ────────────────────────────────────────────────────────

// LED-подсветка: полоса вдоль нижней кромки или под шкафами
function LedStrip({ bx, bz, wx, wy, wz, dw, color="#ffe8a0" }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; color?:string;
}) {
  const A = iso(wx, wy, wz, bx, bz);
  const B = iso(wx+dw, wy, wz, bx, bz);
  return (
    <g>
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.85"/>
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      {/* Ореол */}
      <line x1={A[0]} y1={A[1]+3} x2={B[0]} y2={B[1]+3} stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.15"/>
    </g>
  );
}

// Зеркало на стену (прямоугольник с рамкой и бликом)
function WallMirror({ bx, bz, wx, wy, wz, dw, dh }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dh:number;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const pt = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const A = p(0,0,0); const B = p(dw,0,0); const C = p(dw,0,dh); const D = p(0,0,dh);
  const b1 = p(dw*0.08,0,dh*0.06); const b2 = p(dw*0.28,0,dh*0.06); const b3 = p(dw*0.22,0,dh*0.85); const b4 = p(dw*0.06,0,dh*0.85);
  return (
    <g>
      <polygon points={`${pt(A)} ${pt(B)} ${pt(C)} ${pt(D)}`} fill="rgba(185,222,242,0.5)" stroke="#a0c8de" strokeWidth="1.5"/>
      <polygon points={`${pt(b1)} ${pt(b2)} ${pt(b3)} ${pt(b4)}`} fill="rgba(255,255,255,0.22)"/>
    </g>
  );
}

// Кухонный остров
function KitchenIsland({ bx, bz, wx, wy, wz, dw, dd, dh, m }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dd:number; dh:number; m:M;
}) {
  return (
    <g>
      <IsoBox bx={bx} bz={bz} wx={wx} wy={wy} wz={wz} dw={dw} dd={dd} dh={dh} m={m}
        faceC={darken(m.f0,8)} topC={m.t0} sideC={m.s0} />
      {/* Столешница острова */}
      <IsoBox bx={bx} bz={bz} wx={wx-0.03} wy={wy-0.02} wz={wz+dh} dw={dw+0.06} dd={dd+0.04} dh={0.05} m={m}
        faceC="#606060" topC="#888" sideC="#505050" />
    </g>
  );
}

// Механизм раскладки дивана (выдвинутая секция)
function SofaBed({ bx, bz, wx, wy, wz, dw, dd, m }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dd:number; m:M;
}) {
  return (
    <g>
      {/* Выдвинутая секция */}
      <IsoBox bx={bx} bz={bz} wx={wx} wy={wy-dd*0.6} wz={wz} dw={dw} dd={dd*0.6} dh={0.04} m={m}
        faceC="#ede9e0" topC="#f5f2ea" sideC="#d0ccc0" />
      {/* Ножки механизма */}
      {[wx+dw*0.15, wx+dw*0.85].map((x,i) => {
        const la = iso(x, wy-dd*0.58, wz, bx, bz);
        const lb = iso(x, wy-dd*0.58, wz-0.2, bx, bz);
        return <line key={i} x1={la[0]} y1={la[1]} x2={lb[0]} y2={lb[1]} stroke="#888" strokeWidth="1.5"/>;
      })}
    </g>
  );
}

// Зеркало-шкаф в ванной (уже есть в модели, но можно усилить)
function MirrorCabinet({ bx, bz, wx, wy, wz, dw, dh }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dh:number;
}) {
  const p = (x:number,y:number,z:number) => iso(wx+x,wy+y,wz+z,bx,bz);
  const pt = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const A = p(0,0,0); const B = p(dw,0,0); const C = p(dw,0,dh); const D = p(0,0,dh);
  return (
    <g>
      <polygon points={`${pt(A)} ${pt(B)} ${pt(C)} ${pt(D)}`} fill="rgba(188,222,242,0.55)" stroke="#90b8d4" strokeWidth="1.8"/>
      <polygon points={`${pt(A)} ${pt(p(dw*0.2,0,0))} ${pt(p(dw*0.16,0,dh))} ${pt(D)}`} fill="rgba(255,255,255,0.25)"/>
      {/* Ручка */}
      {(() => { const h1=p(dw*0.5,0,dh*0.42); const h2=p(dw*0.5,0,dh*0.58);
        return <line x1={h1[0]} y1={h1[1]} x2={h2[0]} y2={h2[1]} stroke="#a0b0c0" strokeWidth="2" strokeLinecap="round"/>;
      })()}
    </g>
  );
}

// Книжный шкаф (надставка)
function Bookcase({ bx, bz, wx, wy, wz, dw, dd, dh, m }: {
  bx:number; bz:number; wx:number; wy:number; wz:number; dw:number; dd:number; dh:number; m:M;
}) {
  return (
    <g>
      <IsoBox bx={bx} bz={bz} wx={wx} wy={wy} wz={wz} dw={dw} dd={dd} dh={dh} m={m} />
      {/* Полки */}
      {[0.3, 0.55, 0.8].map((t,i) => (
        <IsoShelf key={i} bx={bx} bz={bz} wx={wx+0.04} wy={wy+0.04} wz={wz+dh*t} dw={dw-0.08} dd={dd-0.08} m={m} />
      ))}
      {/* Стёкла дверец */}
      {[0,dw/2].map((ox,i) => {
        const p2 = (x:number,y:number,z:number) => iso(wx+ox+x,wy+y,wz+z,bx,bz);
        const pt2 = ([x,y]:[number,number]) => `${x.toFixed(1)},${y.toFixed(1)}`;
        const A2=p2(0.04,0,0.04); const B2=p2(dw/2-0.04,0,0.04); const C2=p2(dw/2-0.04,0,dh-0.04); const D2=p2(0.04,0,dh-0.04);
        return <polygon key={i} points={`${pt2(A2)} ${pt2(B2)} ${pt2(C2)} ${pt2(D2)}`} fill="rgba(180,215,235,0.3)" stroke="rgba(150,190,210,0.5)" strokeWidth="0.5"/>;
      })}
    </g>
  );
}

// ─── SVG-КОНТЕЙНЕР С DEFS ─────────────────────────────────────────────────────
function Scene({ w, h, children, m }: { w:number; h:number; children:React.ReactNode; m:M }) {
  const id = useMemo(()=>`s${Math.random().toString(36).slice(2,7)}`,[]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="sh"><feGaussianBlur stdDeviation="3"/></filter>
        <linearGradient id={`gF${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={m.f0}/><stop offset="100%" stopColor={m.f1}/>
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

type ModelProps = { W:number; H:number; D:number; m:M; facade:string; filling:Record<string,number>; extras:string[] };

// ─── КУХНЯ ───────────────────────────────────────────────────────────────────
function KitchenModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 140, bz = 190;

  // Нижние шкафы: высота 0.45H, глубина D
  const lh = H * 0.46; // нижний блок
  const uh = H * 0.38; // верхние шкафы
  const th = 0.06;     // столешница
  const gap = H * 0.12; // зазор

  const sections = 3; // три секции по ширине
  const sw = W / sections;

  const drawers = filling["drawer"] ?? 0;
  const shelves = filling["shelf"] ?? 0;

  return (
    <Scene w={300} h={220} m={m}>
      <Shadow bx={bx} bz={185} cx={W/2} cz={185} rx={W*28} rz={8} />

      {/* Нижние шкафы */}
      {Array.from({length:sections}).map((_,i) => (
        <g key={i}>
          {/* Боковая стенка */}
          <IsoBox bx={bx} bz={bz} wx={sw*i} wy={0} wz={0} dw={0.04} dd={D} dh={lh} m={m}
            faceC={darken(m.f0,8)} topC={m.t0} sideC={darken(m.s0,8)} />
          {/* Корпус */}
          <IsoBox bx={bx} bz={bz} wx={sw*i+0.04} wy={0.04} wz={0} dw={sw-0.08} dd={D-0.08} dh={lh} m={m}
            faceC={darken(m.f0,3)} topC={m.t0} sideC={m.s0} />
          {/* Полки внутри — рисуем ДО дверцы */}
          {shelves > 0 && Array.from({length: Math.min(shelves, 3)}).map((_,si) => (
            <IsoShelf key={si} bx={bx} bz={bz} wx={sw*i+0.08} wy={0.1} wz={lh*(0.28 + 0.32*si)} dw={sw-0.16} dd={D-0.16} m={m} />
          ))}
          {/* Дверца */}
          {drawers > 0 ? (
            <>
              <IsoDrawer bx={bx} bz={bz} wx={sw*i+0.06} wy={0} wz={lh*0.55} dw={sw-0.12} dd={0.06} dh={lh*0.42} m={m} />
              <IsoBox bx={bx} bz={bz} wx={sw*i+0.06} wy={0} wz={0} dw={sw-0.12} dd={0.06} dh={lh*0.5} m={m}
                faceC={lighten(m.f0,4)} topC={m.t0} sideC={m.s0} />
              <IsoHandleH bx={bx} bz={bz} wx={sw*i+sw*0.2} wy={0.06} wz={lh*0.26} len={sw*0.6} m={m} />
            </>
          ) : (
            <IsoDoor bx={bx} bz={bz} wx={sw*i+0.06} wy={0} wz={0.04} dw={sw-0.12} dd={0.06} dh={lh-0.08} m={m}
              facade={facade} opacity={shelves > 0 ? 0.5 : 1} />
          )}
        </g>
      ))}

      {/* Столешница */}
      <IsoBox bx={bx} bz={bz} wx={-0.05} wy={-0.04} wz={lh} dw={W+0.1} dd={D+0.05} dh={th} m={m}
        faceC="#606060" topC={m.grain ? "#8a6030" : "#888"} sideC="#505050" />

      {/* Мойка */}
      {(() => {
        const sp = iso(W*0.2, D*0.5, lh+th+0.01, bx, bz);
        return <ellipse cx={sp[0]} cy={sp[1]} rx={18} ry={7} fill="rgba(140,185,210,0.6)" stroke="#8ab0c8" strokeWidth="0.8"/>;
      })()}
      {/* Кран */}
      {(() => {
        const c1 = iso(W*0.2, D*0.3, lh+th+0.01, bx, bz);
        const c2 = iso(W*0.2, D*0.3, lh+th+0.22, bx, bz);
        const c3 = iso(W*0.28, D*0.3, lh+th+0.22, bx, bz);
        const c4 = iso(W*0.28, D*0.3, lh+th+0.08, bx, bz);
        return <polyline points={`${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${c3[0]},${c3[1]} ${c4[0]},${c4[1]}`}
          stroke="#a8a8a8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
      })()}

      {/* Верхние шкафы */}
      {Array.from({length:sections}).map((_,i) => (
        <g key={i}>
          <IsoBox bx={bx} bz={bz} wx={sw*i+sw*0.05} wy={0.1} wz={lh+th+gap} dw={sw*0.9} dd={D*0.6} dh={uh} m={m}
            faceC={darken(m.f0,2)} topC={m.t0} sideC={m.s0} />
          <IsoDoor bx={bx} bz={bz} wx={sw*i+sw*0.07} wy={0.1} wz={lh+th+gap+0.03} dw={sw*0.86} dd={0.06} dh={uh-0.06} m={m} facade={facade} handleSide={i<2?"left":"right"} />
          {shelves > 0 && <IsoShelf bx={bx} bz={bz} wx={sw*i+sw*0.07} wy={0.16} wz={lh+th+gap+uh*0.5} dw={sw*0.86} dd={D*0.54} m={m} />}
        </g>
      ))}

      {/* Фартук */}
      {(() => {
        const f1 = iso(0, 0.02, lh+th+0.02, bx, bz);
        const f2 = iso(W, 0.02, lh+th+0.02, bx, bz);
        const f3 = iso(W, 0.02, lh+th+gap, bx, bz);
        const f4 = iso(0, 0.02, lh+th+gap, bx, bz);
        return <polygon points={`${f1[0]},${f1[1]} ${f2[0]},${f2[1]} ${f3[0]},${f3[1]} ${f4[0]},${f4[1]}`}
          fill="rgba(200,210,220,0.65)" stroke="rgba(160,170,180,0.4)" strokeWidth="0.4"/>;
      })()}

      {/* EXTRAS */}
      {/* LED-подсветка под верхними шкафами */}
      {extras.includes("led") && (
        <LedStrip bx={bx} bz={bz} wx={0} wy={0.1} wz={lh+th+gap} dw={W} />
      )}
      {/* Кухонный остров — блок сзади */}
      {extras.includes("island") && (
        <KitchenIsland bx={bx} bz={bz} wx={W*0.1} wy={D+0.4} wz={0} dw={W*0.8} dd={D*0.7} dh={lh} m={m} />
      )}
    </Scene>
  );
}

// ─── ШКАФ-КУПЕ ───────────────────────────────────────────────────────────────
function WardrobeModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 130, bz = 200;

  const shelves = filling["shelf"] ?? 0;
  const rails   = filling["rail"]  ?? 0;
  const drawers = filling["drawer"] ?? 0;

  return (
    <Scene w={290} h={220} m={m}>
      <Shadow bx={bx} bz={196} cx={W/2} cz={196} rx={W*28} rz={7} />

      {/* Корпус */}
      {/* Боковые стенки */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={0} dw={0.05} dd={D} dh={H} m={m} faceC={darken(m.f0,15)} topC={m.t1} sideC={darken(m.s0,15)} />
      <IsoBox bx={bx} bz={bz} wx={W-0.05} wy={0} wz={0} dw={0.05} dd={D} dh={H} m={m} faceC={darken(m.f0,15)} topC={m.t1} sideC={darken(m.s0,15)} />
      {/* Дно */}
      <IsoBox bx={bx} bz={bz} wx={0.05} wy={0} wz={0} dw={W-0.1} dd={D} dh={0.04} m={m} faceC={darken(m.f0,10)} topC={m.t0} sideC={m.s0} />
      {/* Потолок */}
      <IsoBox bx={bx} bz={bz} wx={0.05} wy={0} wz={H-0.04} dw={W-0.1} dd={D} dh={0.04} m={m} faceC={darken(m.f0,5)} topC={m.t0} sideC={m.s0} />
      {/* Верхняя крышка */}
      <IsoBox bx={bx} bz={bz} wx={-0.02} wy={-0.01} wz={H} dw={W+0.04} dd={D+0.02} dh={0.03} m={m} faceC={m.f1} topC={m.t0} sideC={m.s1} />

      {/* Внутренность — задняя стенка */}
      {(() => {
        const a = iso(0.05, D, 0.04, bx, bz);
        const b = iso(W-0.05, D, 0.04, bx, bz);
        const c = iso(W-0.05, D, H-0.04, bx, bz);
        const d = iso(0.05, D, H-0.04, bx, bz);
        return <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`}
          fill={darken(m.f0,20)} stroke="none"/>;
      })()}

      {/* Раздвижные двери — с прозрачностью если есть наполнение */}
      {/* Дверь 1 — передняя (сдвинута влево) */}
      <IsoBox bx={bx} bz={bz} wx={0.03} wy={-0.04} wz={0.03} dw={W/2-0.02} dd={0.05} dh={H-0.06} m={m}
        faceC={facade==="mirror" ? "#b8d8e8" : m.f0} topC={m.t0} sideC={m.s0}
        opacity={shelves>0||rails>0||drawers>0 ? 0.45 : 1} />
      {facade === "mirror" && (() => {
        const a = iso(0.03,-0.04,0.03,bx,bz); const b = iso(W/2-0.02,-0.04,0.03,bx,bz);
        const c = iso(W/2-0.02,-0.04,H-0.06,bx,bz); const d = iso(0.03,-0.04,H-0.06,bx,bz);
        return <>
          <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`} fill="rgba(190,225,245,0.35)"/>
          <polygon points={`${a[0]},${a[1]} ${iso(W*0.12,-0.04,0.03,bx,bz)[0]},${iso(W*0.12,-0.04,0.03,bx,bz)[1]} ${iso(W*0.09,-0.04,H-0.06,bx,bz)[0]},${iso(W*0.09,-0.04,H-0.06,bx,bz)[1]} ${d[0]},${d[1]}`} fill="rgba(255,255,255,0.22)"/>
        </>;
      })()}
      {/* Ручка двери 1 */}
      {(() => {
        const ha = iso(W/2-0.12,-0.06,H*0.44,bx,bz); const hb = iso(W/2-0.12,-0.06,H*0.56,bx,bz);
        return <>
          <line x1={ha[0]} y1={ha[1]} x2={hb[0]} y2={hb[1]} stroke={darken(m.handle,20)} strokeWidth="3" strokeLinecap="round"/>
          <line x1={ha[0]} y1={ha[1]} x2={hb[0]} y2={hb[1]} stroke={lighten(m.handle,15)} strokeWidth="1.5" strokeLinecap="round"/>
        </>;
      })()}

      {/* Дверь 2 — задняя (сдвинута вправо) */}
      <IsoBox bx={bx} bz={bz} wx={W/2+0.02} wy={-0.02} wz={0.03} dw={W/2-0.05} dd={0.05} dh={H-0.06} m={m}
        faceC={facade==="mirror" ? darken("#b8d8e8",10) : darken(m.f0,8)} topC={m.t1} sideC={m.s1}
        opacity={shelves>0||rails>0||drawers>0 ? 0.45 : 1} />
      {facade === "mirror" && (() => {
        const a = iso(W/2+0.02,-0.02,0.03,bx,bz); const b = iso(W-0.05,-0.02,0.03,bx,bz);
        const c = iso(W-0.05,-0.02,H-0.06,bx,bz); const d = iso(W/2+0.02,-0.02,H-0.06,bx,bz);
        return <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`} fill="rgba(190,225,245,0.3)"/>;
      })()}

      {/* Наполнение — рисуется ПОВЕРХ дверей */}
      {/* Штанги */}
      {rails > 0 && <IsoRail bx={bx} bz={bz} wx={0.12} wy={D*0.5} wz={H*0.68} dw={W-0.24} m={m} />}
      {rails > 1 && <IsoRail bx={bx} bz={bz} wx={0.12} wy={D*0.5} wz={H*0.42} dw={(W-0.24)*0.5} m={m} />}
      {/* Полки — левая секция */}
      {shelves > 0 && Array.from({length:Math.min(shelves,5)}).map((_,i) => (
        <IsoShelf key={i} bx={bx} bz={bz} wx={0.08} wy={0.06} wz={H*0.12 + H*0.72*(i/(Math.min(shelves,5)+1))} dw={W*0.45} dd={D-0.12} m={m} />
      ))}
      {/* Ящики — правая секция */}
      {drawers > 0 && Array.from({length:Math.min(drawers,3)}).map((_,i) => (
        <IsoDrawer key={i} bx={bx} bz={bz} wx={W*0.52} wy={0.02} wz={0.08+H*0.15*i} dw={W*0.44} dd={0.1} dh={H*0.13} m={m} />
      ))}
      {/* Рельсы */}
      {[0.005, H-0.02].map((z,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={0} wy={-0.05} wz={z} dw={W} dd={0.05} dh={0.025} m={m}
          faceC="#888" topC="#aaa" sideC="#777" />
      ))}

      {/* Плинтус */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={-0.04} dw={W} dd={D} dh={0.04} m={m}
        faceC={darken(m.f0,20)} topC={m.t1} sideC={darken(m.s0,20)} />

      {/* EXTRAS */}
      {/* Подсветка — LED лента вдоль пола */}
      {extras.includes("light") && (
        <LedStrip bx={bx} bz={bz} wx={0.05} wy={-0.03} wz={0.01} dw={W-0.1} />
      )}
      {/* Зеркало внутри — на задней стенке левой секции */}
      {extras.includes("mirror") && (
        <WallMirror bx={bx} bz={bz} wx={W*0.05} wy={D-0.01} wz={H*0.1} dw={W*0.42} dh={H*0.75} />
      )}
    </Scene>
  );
}

// ─── ДИВАН ───────────────────────────────────────────────────────────────────
function SofaModel({ W, H, D, m, facade, extras }: ModelProps) {
  const bx = 140, bz = 195;

  const legH = H*0.14; const seatH = H*0.35; const backH = H*0.48; const backD = D*0.22;
  const armW = W*0.1; const armH = seatH + backH*0.75;

  // Цвет обивки
  let upC = m.f0;
  if (facade === "velvet")  upC = darken(m.f0, 8);
  if (facade === "leather") upC = darken(m.f0, 5);
  if (facade === "fabric")  upC = m.f0;

  return (
    <Scene w={320} h={210} m={m}>
      <Shadow bx={bx} bz={192} cx={W/2} cz={192} rx={W*26} rz={7} />

      {/* Ножки */}
      {[armW*0.3, W-armW*0.3-0.06].map((wx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={D*0.15} wz={0} dw={0.06} dd={0.06} dh={legH} m={m}
          faceC={m.grain?"#4a2c0c":"#3a3a3a"} topC={m.grain?"#3a2008":"#2a2a2a"} sideC={m.grain?"#2a1804":"#1a1a1a"} />
      ))}

      {/* Сиденье */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={legH} dw={W} dd={D} dh={seatH} m={m}
        faceC={darken(upC,5)} topC={upC} sideC={darken(upC,12)} />
      {/* Стёжка сиденья */}
      {facade === "velvet" && [0.33,0.66].map((t,i) => {
        const a = iso(0,D*t,legH+seatH,bx,bz); const b = iso(W,D*t,legH+seatH,bx,bz);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" strokeDasharray="3 2"/>;
      })}

      {/* Спинка */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={D-backD} wz={legH} dw={W} dd={backD} dh={seatH+backH} m={m}
        faceC={darken(upC,3)} topC={darken(upC,8)} sideC={darken(upC,18)} />
      {/* Стёжка спинки */}
      {facade === "velvet" && [H*0.55, H*0.75].map((z,i) => {
        const a = iso(0,D-backD,z,bx,bz); const b = iso(W,D-backD,z,bx,bz);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(0,0,0,0.1)" strokeWidth="0.6" strokeDasharray="3 2"/>;
      })}

      {/* Подлокотники */}
      {[
        {wx:0, fc:darken(upC,10)},
        {wx:W-armW, fc:darken(upC,10)},
      ].map(({wx,fc},i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={0} wz={legH} dw={armW} dd={D} dh={armH} m={m}
          faceC={fc} topC={darken(upC,5)} sideC={darken(upC,20)} />
      ))}

      {/* Подушки сиденья */}
      {(W>2.5 ? [armW+W*0.01, armW+(W-2*armW)*0.52] : [armW+W*0.06]).map((wx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={D*0.05} wz={legH+seatH} dw={(W-2*armW)*0.47-0.02} dd={D*0.88} dh={seatH*0.22} m={m}
          faceC={lighten(upC,6)} topC={lighten(upC,10)} sideC={upC} />
      ))}

      {/* Декоративные подушки у спинки */}
      {(W>2.5 ? [armW+W*0.06, armW+(W-2*armW)*0.56] : [armW+W*0.1]).map((wx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={D-backD*1.1} wz={legH+seatH+seatH*0.05} dw={(W-2*armW)*0.38} dd={backD*1.1} dh={backH*0.52} m={m}
          faceC={lighten(upC,8)} topC={lighten(upC,12)} sideC={upC} />
      ))}

      {/* EXTRAS */}
      {/* Механизм раскладки — выдвинутая кроватная секция */}
      {extras.includes("mechanism") && (
        <SofaBed bx={bx} bz={bz} wx={armW} wy={0} wz={legH} dw={W-2*armW} dd={D} m={m} />
      )}
    </Scene>
  );
}

// ─── СПАЛЬНЯ ─────────────────────────────────────────────────────────────────
function BedroomModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 130, bz = 195;

  const legH = H*0.06; const frameH = H*0.18; const mattH = H*0.2; const headH = H*0.55;
  const drawers = filling["drawer"] ?? 0;
  const nightstand = filling["nightstand"] ?? 0;

  return (
    <Scene w={310} h={215} m={m}>
      <Shadow bx={bx} bz={192} cx={W/2} cz={192} rx={W*26} rz={7} />

      {/* Ножки */}
      {[0.06, W-0.1].map((wx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={D*0.1} wz={0} dw={0.08} dd={0.08} dh={legH} m={m}
          faceC={darken(m.f0,20)} topC={m.t1} sideC={darken(m.s0,20)} />
      ))}

      {/* Рама */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={legH} dw={W} dd={D} dh={frameH} m={m} />
      {/* Ящики под кроватью */}
      {drawers > 0 && Array.from({length:Math.min(drawers,2)}).map((_,i) => (
        <IsoDrawer key={i} bx={bx} bz={bz} wx={W*0.1+W*0.45*i} wy={0} wz={legH+0.04} dw={W*0.4} dd={0.12} dh={frameH-0.08} m={m} />
      ))}

      {/* Матрас */}
      <IsoBox bx={bx} bz={bz} wx={W*0.02} wy={D*0.02} wz={legH+frameH} dw={W*0.96} dd={D*0.96} dh={mattH} m={m}
        faceC="#ede9e0" topC="#f5f2ea" sideC="#d8d4c8" />
      {/* Стёжка матраса */}
      {[0.25,0.5,0.75].map((t,i) => {
        const a = iso(W*0.02,D*0.96*t,legH+frameH+mattH,bx,bz);
        const b = iso(W*0.98,D*0.96*t,legH+frameH+mattH,bx,bz);
        return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(0,0,0,0.06)" strokeWidth="0.6"/>;
      })}

      {/* Простынь */}
      <IsoBox bx={bx} bz={bz} wx={W*0.02} wy={D*0.02} wz={legH+frameH+mattH} dw={W*0.96} dd={D*0.96} dh={0.015} m={m}
        faceC="#f0ece4" topC="#f8f5f0" sideC="#e0dcd4" />

      {/* Подушки */}
      {(W>2.2 ? [W*0.06, W*0.54] : [W*0.15]).map((wx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={D*0.62} wz={legH+frameH+mattH+0.015} dw={W*0.38} dd={D*0.3} dh={mattH*0.55} m={m}
          faceC="#ffffff" topC="#f8f8f8" sideC="#e0e0e0" />
      ))}

      {/* Изголовье */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={D-0.05} wz={legH} dw={W} dd={0.12} dh={headH} m={m} />
      {/* Фасад изголовья */}
      <IsoDoor bx={bx} bz={bz} wx={W*0.04} wy={D-0.05} wz={legH+headH*0.06} dw={W*0.92} dd={0.06} dh={headH*0.88} m={m} facade={facade} handleSide="right" />

      {/* Тумбочки */}
      {nightstand > 0 && [-0.6, W+0.1].map((wx,i) => (
        <g key={i}>
          <IsoBox bx={bx} bz={bz} wx={wx} wy={D*0.3} wz={legH} dw={0.5} dd={D*0.5} dh={frameH+mattH} m={m} />
          <IsoDrawer bx={bx} bz={bz} wx={wx+0.04} wy={D*0.3} wz={legH+(frameH+mattH)*0.55} dw={0.42} dd={0.08} dh={(frameH+mattH)*0.42} m={m} />
        </g>
      ))}

      {/* EXTRAS */}
      {/* Подсветка изголовья */}
      {extras.includes("light") && (
        <LedStrip bx={bx} bz={bz} wx={W*0.04} wy={D-0.04} wz={legH+headH} dw={W*0.92} color="#ffd080" />
      )}
      {/* Зеркало — на стене слева от кровати */}
      {extras.includes("mirror") && (
        <WallMirror bx={bx} bz={bz} wx={-0.85} wy={D*0.1} wz={legH} dw={0.7} dh={H*0.6} />
      )}
    </Scene>
  );
}

// ─── ПРИХОЖАЯ ────────────────────────────────────────────────────────────────
function HallwayModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 130, bz = 195;
  const shoeH = H*0.28; const bodyH = H*0.58; const shelfH = 0.04;
  const hooks  = filling["hook"]  ?? 0;
  const shelves = filling["shelf"] ?? 0;
  const drawers = filling["drawer"] ?? 0;

  return (
    <Scene w={290} h={220} m={m}>
      <Shadow bx={bx} bz={192} cx={W/2} cz={192} rx={W*26} rz={7} />

      {/* Обувница */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={0} dw={W} dd={D} dh={shoeH} m={m} />
      {drawers > 0 ? (
        <IsoDrawer bx={bx} bz={bz} wx={0.06} wy={0} wz={0.06} dw={W-0.12} dd={0.08} dh={shoeH-0.12} m={m} />
      ) : (
        <IsoDoor bx={bx} bz={bz} wx={0.06} wy={0} wz={0.05} dw={W-0.12} dd={0.06} dh={shoeH-0.1} m={m} facade={facade} />
      )}

      {/* Корпус верхний */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={shoeH} dw={W} dd={D*0.7} dh={bodyH} m={m} />

      {/* Внутренние полки — ДО дверцы */}
      {shelves > 0 && Array.from({length:Math.min(shelves,4)}).map((_,i) => (
        <IsoShelf key={i} bx={bx} bz={bz} wx={0.06} wy={0.06} wz={shoeH+bodyH*(0.2+0.55*(i/(Math.min(shelves,4)+1)))} dw={W-0.12} dd={D*0.64} m={m} />
      ))}

      {/* Дверцы корпуса — полупрозрачные если есть наполнение */}
      {W > 0.8 ? [0, W/2].map((ox,i) => (
        <IsoDoor key={i} bx={bx} bz={bz} wx={ox+0.04} wy={0} wz={shoeH+0.04} dw={W/2-0.08} dd={0.06} dh={bodyH-0.08} m={m} facade={facade} handleSide={i===0?"right":"left"}
          opacity={shelves>0||hooks>0||drawers>0 ? 0.45 : 1} />
      )) : (
        <IsoDoor bx={bx} bz={bz} wx={0.04} wy={0} wz={shoeH+0.04} dw={W-0.08} dd={0.06} dh={bodyH-0.08} m={m} facade={facade}
          opacity={shelves>0||hooks>0||drawers>0 ? 0.45 : 1} />
      )}

      {/* Зеркало */}
      {(() => {
        const mW = W*0.8; const mH = H*0.16; const my = shoeH+bodyH+0.04;
        const a = iso(W*0.1, 0.02, my, bx, bz); const b = iso(W*0.1+mW, 0.02, my, bx, bz);
        const c = iso(W*0.1+mW, 0.02, my+mH, bx, bz); const d = iso(W*0.1, 0.02, my+mH, bx, bz);
        return <>
          <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`}
            fill="rgba(185,220,240,0.45)" stroke={m.edge} strokeWidth="1.5"/>
          <polygon points={`${a[0]},${a[1]} ${iso(W*0.1+mW*0.18,0.02,my,bx,bz)[0]},${iso(W*0.1+mW*0.18,0.02,my,bx,bz)[1]} ${iso(W*0.1+mW*0.14,0.02,my+mH,bx,bz)[0]},${iso(W*0.1+mW*0.14,0.02,my+mH,bx,bz)[1]} ${d[0]},${d[1]}`}
            fill="rgba(255,255,255,0.25)"/>
        </>;
      })()}

      {/* Крючки */}
      {hooks > 0 && Array.from({length:Math.min(hooks,5)}).map((_,i) => {
        const cnt = Math.min(hooks,5);
        const wx = W*(0.12 + 0.76*(i/(cnt-1||1)));
        const ballP = iso(wx, -0.04, shoeH+bodyH*0.9, bx, bz);
        const hookP = iso(wx+0.06, -0.06, shoeH+bodyH*0.85, bx, bz);
        return (
          <g key={i}>
            <circle cx={ballP[0]} cy={ballP[1]} r={3} fill={m.handle} stroke={darken(m.handle,20)} strokeWidth="0.5"/>
            <path d={`M${ballP[0]},${ballP[1]} Q${ballP[0]+6},${ballP[1]+5} ${hookP[0]},${hookP[1]}`}
              stroke={m.handle} strokeWidth="2" fill="none" strokeLinecap="round"/>
          </g>
        );
      })}

      {/* Крышка */}
      <IsoBox bx={bx} bz={bz} wx={-0.02} wy={-0.01} wz={shoeH+bodyH} dw={W+0.04} dd={D*0.72} dh={0.03} m={m}
        faceC={m.f1} topC={m.t0} sideC={m.s1} />

      {/* EXTRAS */}
      {/* Подсветка — LED под верхним корпусом */}
      {extras.includes("light") && (
        <LedStrip bx={bx} bz={bz} wx={0.04} wy={-0.02} wz={shoeH} dw={W-0.08} />
      )}
      {/* Зеркало — уже есть зеркальный блок в модели, усиливаем рамкой */}
      {extras.includes("mirror") && (
        <WallMirror bx={bx} bz={bz} wx={W*0.08} wy={0.08} wz={shoeH+bodyH+0.04} dw={W*0.84} dh={H*0.16} />
      )}
    </Scene>
  );
}

// ─── КАБИНЕТ ─────────────────────────────────────────────────────────────────
function OfficeModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 130, bz = 190;
  const deskH = H * 0.12; const legH = H*0.58; const cabW = W*0.38;
  const shelves = filling["shelf"] ?? 0;
  const drawers = filling["drawer"] ?? 0;

  return (
    <Scene w={310} h={210} m={m}>
      <Shadow bx={bx} bz={188} cx={W/2} cz={188} rx={W*26} rz={7} />

      {/* Тумба */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={0} dw={cabW} dd={D} dh={legH} m={m} />
      {drawers > 0 ? Array.from({length:Math.min(drawers,3)}).map((_,i) => (
        <IsoDrawer key={i} bx={bx} bz={bz} wx={0.06} wy={0} wz={legH*(0.1+0.28*i)} dw={cabW-0.12} dd={0.1} dh={legH*0.25} m={m} />
      )) : (
        <IsoDoor bx={bx} bz={bz} wx={0.06} wy={0} wz={0.06} dw={cabW-0.12} dd={0.08} dh={legH-0.12} m={m} facade={facade} />
      )}

      {/* Правая ножка */}
      <IsoBox bx={bx} bz={bz} wx={W-0.1} wy={D*0.1} wz={0} dw={0.1} dd={D*0.15} dh={legH} m={m}
        faceC={darken(m.f0,12)} topC={m.t1} sideC={darken(m.s0,12)} />

      {/* Столешница */}
      <IsoBox bx={bx} bz={bz} wx={-0.04} wy={-0.03} wz={legH} dw={W+0.08} dd={D+0.06} dh={deskH} m={m}
        faceC={darken(m.f0,5)} topC={m.grain?"#9a6828":"#909090"} sideC={darken(m.s0,8)} />

      {/* Надстройка — полки ПЕРЕД дверью, дверь полупрозрачная */}
      {shelves > 0 && <>
        <IsoBox bx={bx} bz={bz} wx={W*0.5} wy={0.06} wz={legH+deskH} dw={W*0.48} dd={D*0.45} dh={H*0.42} m={m} />
        {Array.from({length:Math.min(shelves,3)}).map((_,i) => (
          <IsoShelf key={i} bx={bx} bz={bz} wx={W*0.52} wy={0.1} wz={legH+deskH+H*0.42*(0.25+0.45*(i/(Math.min(shelves,3)+1)))} dw={W*0.44} dd={D*0.38} m={m} />
        ))}
        <IsoDoor bx={bx} bz={bz} wx={W*0.52} wy={0.06} wz={legH+deskH+0.04} dw={W*0.46} dd={0.06} dh={H*0.42-0.08} m={m} facade={facade} opacity={0.45} />
      </>}

      {/* Монитор */}
      <IsoBox bx={bx} bz={bz} wx={W*0.15} wy={D*0.45} wz={legH+deskH} dw={W*0.32} dd={0.04} dh={H*0.32} m={m}
        faceC="#18181e" topC="#202028" sideC="#101018" />
      <IsoBox bx={bx} bz={bz} wx={W*0.15} wy={D*0.45} wz={legH+deskH} dw={W*0.32} dd={0.04} dh={H*0.28} m={m}
        faceC="rgba(60,100,180,0.22)" topC="transparent" sideC="transparent" />
      {/* Подставка монитора */}
      <IsoBox bx={bx} bz={bz} wx={W*0.27} wy={D*0.42} wz={legH+deskH} dw={W*0.08} dd={0.06} dh={deskH*0.5} m={m}
        faceC="#222" topC="#333" sideC="#111" />
      {/* Клавиатура */}
      <IsoBox bx={bx} bz={bz} wx={W*0.1} wy={D*0.12} wz={legH+deskH} dw={W*0.3} dd={D*0.28} dh={0.02} m={m}
        faceC="#c8c8c8" topC="#d8d8d8" sideC="#a8a8a8" />

      {/* EXTRAS */}
      {/* Подсветка рабочего места — LED под надстройкой */}
      {extras.includes("light") && (
        <LedStrip bx={bx} bz={bz} wx={W*0.1} wy={D*0.44} wz={legH+deskH} dw={W*0.38} color="#e0f0ff" />
      )}
      {/* Книжный шкаф — дополнительная секция справа */}
      {extras.includes("bookcase") && (
        <Bookcase bx={bx} bz={bz} wx={W+0.08} wy={0.06} wz={0} dw={W*0.55} dd={D*0.5} dh={H*0.85} m={m} />
      )}
    </Scene>
  );
}

// ─── ВАННАЯ ──────────────────────────────────────────────────────────────────
function BathroomModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 130, bz = 185;
  const cabH = H*0.6; const topH = 0.05;
  const shelves = filling["shelf"] ?? 0;

  return (
    <Scene w={280} h={205} m={m}>
      <Shadow bx={bx} bz={183} cx={W/2} cz={183} rx={W*26} rz={6} />

      {/* Тумба */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={0} dw={W} dd={D} dh={cabH} m={m} />
      {/* Полки внутри — ДО дверцы */}
      {shelves > 0 && Array.from({length:Math.min(shelves,3)}).map((_,i) => (
        <IsoShelf key={i} bx={bx} bz={bz} wx={0.06} wy={0.06} wz={cabH*(0.25+0.28*i)} dw={W-0.12} dd={D-0.12} m={m} />
      ))}
      {/* Дверцы — полупрозрачные если есть наполнение */}
      {W > 0.8 ? [0, W/2].map((ox,i) => (
        <IsoDoor key={i} bx={bx} bz={bz} wx={ox+0.05} wy={0} wz={0.05} dw={W/2-0.1} dd={0.06} dh={cabH-0.1} m={m} facade={facade} handleSide={i===0?"right":"left"}
          opacity={shelves>0 ? 0.45 : 1} />
      )) : (
        <IsoDoor bx={bx} bz={bz} wx={0.05} wy={0} wz={0.05} dw={W-0.1} dd={0.06} dh={cabH-0.1} m={m} facade={facade}
          opacity={shelves>0 ? 0.45 : 1} />
      )}

      {/* Столешница */}
      <IsoBox bx={bx} bz={bz} wx={-0.03} wy={-0.02} wz={cabH} dw={W+0.06} dd={D+0.04} dh={topH} m={m}
        faceC="#c8c8c8" topC="#e0e0e0" sideC="#a8a8a8" />

      {/* Раковина — углубление */}
      {(() => {
        const sp = iso(W*0.5, D*0.5, cabH+topH+0.01, bx, bz);
        return <>
          <ellipse cx={sp[0]} cy={sp[1]} rx={W*24} ry={W*10} fill="rgba(180,218,240,0.7)" stroke="#90b8d0" strokeWidth="1.2"/>
          <ellipse cx={sp[0]} cy={sp[1]} rx={W*16} ry={W*6.5} fill="rgba(140,195,220,0.6)" stroke="#80a8c0" strokeWidth="0.8"/>
          <circle cx={sp[0]} cy={sp[1]} r={3} fill="#808080"/>
        </>;
      })()}

      {/* Смеситель */}
      {(() => {
        const c1 = iso(W*0.5, D*0.2, cabH+topH+0.01, bx, bz);
        const c2 = iso(W*0.5, D*0.2, cabH+topH+0.18, bx, bz);
        const c3 = iso(W*0.6, D*0.2, cabH+topH+0.18, bx, bz);
        const c4 = iso(W*0.6, D*0.2, cabH+topH+0.05, bx, bz);
        return <polyline points={`${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${c3[0]},${c3[1]} ${c4[0]},${c4[1]}`}
          stroke="#b0b0b0" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
      })()}

      {/* Зеркало-шкаф */}
      <IsoBox bx={bx} bz={bz} wx={W*0.06} wy={0.08} wz={cabH+topH+0.08} dw={W*0.88} dd={D*0.25} dh={H*0.38} m={m}
        faceC="rgba(188,222,242,0.45)" topC={m.t1} sideC={m.s1} />
      {/* Рамка зеркала */}
      {(() => {
        const a = iso(W*0.06,0.08,cabH+topH+0.08,bx,bz);
        const b = iso(W*0.94,0.08,cabH+topH+0.08,bx,bz);
        const c = iso(W*0.94,0.08,cabH+topH+0.08+H*0.38,bx,bz);
        const d = iso(W*0.06,0.08,cabH+topH+0.08+H*0.38,bx,bz);
        return <>
          <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`}
            fill="none" stroke={m.edge} strokeWidth="1.5"/>
          <polygon points={`${a[0]},${a[1]} ${iso(W*0.2,0.08,cabH+topH+0.08,bx,bz)[0]},${iso(W*0.2,0.08,cabH+topH+0.08,bx,bz)[1]} ${iso(W*0.16,0.08,cabH+topH+0.08+H*0.38,bx,bz)[0]},${iso(W*0.16,0.08,cabH+topH+0.08+H*0.38,bx,bz)[1]} ${d[0]},${d[1]}`}
            fill="rgba(255,255,255,0.22)"/>
          {shelves > 0 && <line x1={iso(W*0.08,0.1,cabH+topH+0.08+H*0.22,bx,bz)[0]} y1={iso(W*0.08,0.1,cabH+topH+0.08+H*0.22,bx,bz)[1]}
            x2={iso(W*0.92,0.1,cabH+topH+0.08+H*0.22,bx,bz)[0]} y2={iso(W*0.92,0.1,cabH+topH+0.08+H*0.22,bx,bz)[1]}
            stroke="rgba(140,180,200,0.5)" strokeWidth="1"/>}
        </>;
      })()}

      {/* EXTRAS */}
      {/* Зеркало-шкаф — уже в модели; подсветка тумбы снизу */}
      {extras.includes("light") && (
        <LedStrip bx={bx} bz={bz} wx={0.02} wy={-0.02} wz={-0.01} dw={W-0.04} color="#e8f4ff" />
      )}
      {/* Отдельное зеркало-шкаф поверх основного (усиленное) */}
      {extras.includes("mirror") && (
        <MirrorCabinet bx={bx} bz={bz} wx={W*0.06} wy={0.07} wz={cabH+topH+0.06} dw={W*0.88} dh={H*0.42} />
      )}
    </Scene>
  );
}

// ─── ДЕТСКАЯ ─────────────────────────────────────────────────────────────────
function ChildroomModel({ W, H, D, m, facade, filling, extras }: ModelProps) {
  const bx = 130, bz = 195;
  const bedW = W*0.55; const deskW = W*0.38;
  const bedFrameH = H*0.16; const mattH = H*0.18; const headH = H*0.42; const legH = H*0.07;
  const deskH = H*0.09; const deskLegH = H*0.52;
  const shelves = filling["shelf"] ?? 0;

  return (
    <Scene w={310} h={215} m={m}>
      <Shadow bx={bx} bz={192} cx={W/2} cz={192} rx={W*25} rz={7} />

      {/* Ножки кровати */}
      {[0.05, bedW-0.1].map((wx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={wx} wy={D*0.1} wz={0} dw={0.07} dd={0.07} dh={legH} m={m}
          faceC={darken(m.f0,20)} topC={m.t1} sideC={darken(m.s0,20)} />
      ))}
      {/* Рама */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={0} wz={legH} dw={bedW} dd={D*0.95} dh={bedFrameH} m={m} />
      {/* Матрас */}
      <IsoBox bx={bx} bz={bz} wx={bedW*0.025} wy={D*0.025} wz={legH+bedFrameH} dw={bedW*0.95} dd={D*0.9} dh={mattH} m={m}
        faceC="#ede9e0" topC="#f5f2ea" sideC="#d8d4c8" />
      {/* Подушка */}
      <IsoBox bx={bx} bz={bz} wx={bedW*0.08} wy={D*0.62} wz={legH+bedFrameH+mattH} dw={bedW*0.84} dd={D*0.3} dh={mattH*0.55} m={m}
        faceC="#fff" topC="#f8f8f8" sideC="#e0e0e0" />
      {/* Изголовье */}
      <IsoBox bx={bx} bz={bz} wx={0} wy={D*0.9} wz={legH} dw={bedW} dd={0.12} dh={headH} m={m} />
      <IsoDoor bx={bx} bz={bz} wx={bedW*0.04} wy={D*0.9} wz={legH+headH*0.06} dw={bedW*0.92} dd={0.06} dh={headH*0.88} m={m} facade={facade} handleSide="right" />

      {/* Стол */}
      <IsoBox bx={bx} bz={bz} wx={bedW+W*0.06} wy={-0.02} wz={deskLegH} dw={deskW} dd={D*0.65} dh={deskH} m={m}
        faceC={darken(m.f0,5)} topC={m.grain?"#9a6828":"#909090"} sideC={darken(m.s0,5)} />
      {[0,deskW-0.06].map((dx,i) => (
        <IsoBox key={i} bx={bx} bz={bz} wx={bedW+W*0.06+dx} wy={D*0.05} wz={0} dw={0.06} dd={D*0.08} dh={deskLegH} m={m}
          faceC={darken(m.f0,15)} topC={m.t1} sideC={darken(m.s0,15)} />
      ))}
      {/* Полка над столом */}
      {shelves > 0 && <>
        <IsoShelf bx={bx} bz={bz} wx={bedW+W*0.06} wy={D*0.05} wz={deskLegH+deskH+H*0.3} dw={deskW} dd={D*0.38} m={m} />
        {/* Книги */}
        {[0.08,0.18,0.28,0.42,0.56].map((t,i) => (
          <IsoBox key={i} bx={bx} bz={bz} wx={bedW+W*0.06+deskW*t} wy={D*0.07} wz={deskLegH+deskH+H*0.3+0.04} dw={deskW*0.08} dd={D*0.28} dh={H*0.15+i*0.04} m={m}
            faceC={["#c0392b","#2980b9","#27ae60","#8e44ad","#e67e22"][i]}
            topC={["#922b21","#1f618d","#1e8449","#6c3483","#b7770d"][i]}
            sideC={["#7b241c","#1a5276","#196f3d","#5b2c6f","#9a7d0a"][i]} />
        ))}
      </>}

      {/* EXTRAS */}
      {/* Ночник — маленький светильник на столе */}
      {extras.includes("light") && (() => {
        const base = iso(bedW+W*0.06+deskW*0.88, D*0.5, deskLegH+deskH, bx, bz);
        const top2  = iso(bedW+W*0.06+deskW*0.88, D*0.5, deskLegH+deskH+H*0.2, bx, bz);
        return (
          <g>
            <line x1={base[0]} y1={base[1]} x2={top2[0]} y2={top2[1]} stroke="#a0a0a0" strokeWidth="1.5"/>
            <ellipse cx={top2[0]} cy={top2[1]} rx={8} ry={4} fill="#ffe8a0" opacity="0.85"/>
            <ellipse cx={top2[0]} cy={top2[1]+4} rx={10} ry={3} fill="#ffe8a0" opacity="0.2"/>
          </g>
        );
      })()}
      {/* Магнитная доска — на стене над кроватью */}
      {extras.includes("board") && (
        <IsoBox bx={bx} bz={bz} wx={bedW*0.08} wy={D*0.92} wz={legH+headH*0.9} dw={bedW*0.84} dd={0.04} dh={H*0.22} m={m}
          faceC="#2c3e50" topC="#1a252f" sideC="#1a252f" />
      )}
    </Scene>
  );
}

// ─── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
let _uid = 0;
const MAT_NAMES: Record<string,string> = { ldsp:"ЛДСП", mdf:"МДФ", massiv:"Массив дерева", mdf_kraska:"МДФ + эмаль" };

export default function FurniturePreview({ type, material, color, style: _style, facade="matte", texture: _texture, filling={}, extras=[], width, height, depth }: Props) {
  const id = useMemo(() => `fp${_uid++}`, []);
  void id;

  const mBase = useMemo(() => getM(material), [material]);
  const m = useMemo(() => applyColor(mBase, color), [mBase, color]);

  // Нормализуем размеры в "мировые" единицы (1 = ~60см)
  const W = useMemo(() => {
    const ref  = type === "sofa" ? 300 : type === "bedroom" ? 200 : 240;
    const base = type === "sofa" ? 4.2 : type === "bedroom" ? 3.5 : 4.0;
    return Math.min(Math.max((width / ref) * base, base * 0.45), base);
  }, [width, type]);

  const H = useMemo(() => {
    if (type === "sofa")    return Math.min(Math.max((depth  / 90)  * 1.2, 0.7), 1.6);
    if (type === "bedroom") return Math.min(Math.max((height / 220) * 2.0, 1.0), 2.4);
    if (type === "office")  return Math.min(Math.max((height / 90)  * 1.5, 0.8), 1.8);
    return Math.min(Math.max((height / 220) * 2.2, 1.0), 2.6);
  }, [height, depth, type]);

  const D = useMemo(() => {
    if (type === "sofa")    return Math.min(Math.max((depth  / 90)  * 1.4, 0.8), 1.8);
    if (type === "bedroom") return Math.min(Math.max((depth  / 200) * 3.4, 1.8), 3.8);
    return Math.min(Math.max((depth  / 65)  * 1.0, 0.5), 1.4);
  }, [depth, type]);

  const props = { W, H, D, m, facade, filling, extras };

  if (!type) {
    return (
      <div className="flex flex-col items-center justify-center h-36 gap-2 text-white/20">
        <svg viewBox="0 0 64 64" className="w-10 h-10 opacity-20">
          <rect x="8" y="20" width="48" height="36" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <rect x="18" y="10" width="28" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <line x1="8" y1="38" x2="56" y2="38" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <p className="text-[9px] tracking-widest uppercase">Выберите тип</p>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[4/3] flex items-center justify-center">
        {type === "kitchen"   && <KitchenModel   {...props} />}
        {type === "wardrobe"  && <WardrobeModel  {...props} />}
        {type === "sofa"      && <SofaModel      {...props} />}
        {type === "bedroom"   && <BedroomModel   {...props} />}
        {type === "hallway"   && <HallwayModel   {...props} />}
        {type === "office"    && <OfficeModel    {...props} />}
        {type === "bathroom"  && <BathroomModel  {...props} />}
        {type === "childroom" && <ChildroomModel {...props} />}
      </div>
      {material && (
        <div className="flex items-center gap-2 px-1 mt-1 pb-1">
          <div className="w-3 h-3 rounded-sm flex-shrink-0 ring-1 ring-white/10" style={{ background: color ?? m.f0 }} />
          <span className="text-[9px] text-white/30 tracking-widest uppercase">{MAT_NAMES[material] ?? material}</span>
          <span className="ml-auto text-[9px] text-white/20 tabular-nums">{width}×{height}×{depth} см</span>
        </div>
      )}
    </div>
  );
}