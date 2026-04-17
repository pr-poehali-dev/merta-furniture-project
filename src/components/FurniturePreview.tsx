interface Props {
  type: string;
  material: string;
  style: string;
  width: number;
  height: number;
  depth: number;
}

const MATERIAL_COLORS: Record<string, { body: string; edge: string; shadow: string }> = {
  ldsp:       { body: "#e8ddd0", edge: "#c9b89a", shadow: "#b8a488" },
  mdf:        { body: "#d6cfc8", edge: "#b0a89e", shadow: "#9e9088" },
  massiv:     { body: "#c8a96e", edge: "#a07c40", shadow: "#8a6530" },
  mdf_kraska: { body: "#f0f0f0", edge: "#d0d0d0", shadow: "#b8b8b8" },
  default:    { body: "#ddd6cc", edge: "#b8afa4", shadow: "#a09890" },
};

function getColors(material: string) {
  return MATERIAL_COLORS[material] || MATERIAL_COLORS.default;
}

// Изометрическая кухня
function KitchenSVG({ w, h, d, colors }: { w: number; h: number; d: number; colors: ReturnType<typeof getColors> }) {
  const sx = Math.min(Math.max(w / 240, 0.6), 1.4);
  const sy = Math.min(Math.max(h / 220, 0.6), 1.4);
  const sd = Math.min(Math.max(d / 60, 0.6), 1.3);

  return (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* тень */}
      <ellipse cx="140" cy="205" rx={75 * sx} ry={10} fill="rgba(0,0,0,0.12)" />

      {/* Нижний корпус — фронт */}
      <path
        d={`M ${70} ${160} L ${70 + 130 * sx} ${160} L ${70 + 130 * sx} ${160 + 45 * sy * 0.4} L ${70} ${160 + 45 * sy * 0.4} Z`}
        fill={colors.body}
        stroke={colors.edge} strokeWidth="1"
      />
      {/* Нижний корпус — верх */}
      <path
        d={`M ${70} ${160} L ${70 + 130 * sx} ${160} L ${70 + 130 * sx + 25 * sd} ${160 - 18 * sd} L ${70 + 25 * sd} ${160 - 18 * sd} Z`}
        fill={colors.edge}
        stroke={colors.shadow} strokeWidth="0.8"
      />
      {/* Нижний корпус — правый бок */}
      <path
        d={`M ${70 + 130 * sx} ${160} L ${70 + 130 * sx + 25 * sd} ${160 - 18 * sd} L ${70 + 130 * sx + 25 * sd} ${160 - 18 * sd + 45 * sy * 0.4} L ${70 + 130 * sx} ${160 + 45 * sy * 0.4} Z`}
        fill={colors.shadow}
        stroke={colors.shadow} strokeWidth="0.8"
      />

      {/* Столешница */}
      <path
        d={`M ${65} ${155} L ${70 + 130 * sx + 5} ${155} L ${70 + 130 * sx + 5 + 27 * sd} ${155 - 20 * sd} L ${65 + 27 * sd} ${155 - 20 * sd} Z`}
        fill="#8a6530"
        stroke="#6b4e24" strokeWidth="1"
      />

      {/* Верхний корпус — фронт */}
      <path
        d={`M ${80} ${90} L ${80 + 110 * sx} ${90} L ${80 + 110 * sx} ${90 + 55 * sy * 0.45} L ${80} ${90 + 55 * sy * 0.45} Z`}
        fill={colors.body}
        stroke={colors.edge} strokeWidth="1"
      />
      {/* Верхний корпус — верх */}
      <path
        d={`M ${80} ${90} L ${80 + 110 * sx} ${90} L ${80 + 110 * sx + 22 * sd} ${90 - 16 * sd} L ${80 + 22 * sd} ${90 - 16 * sd} Z`}
        fill={colors.edge}
        stroke={colors.shadow} strokeWidth="0.8"
      />
      {/* Верхний корпус — правый бок */}
      <path
        d={`M ${80 + 110 * sx} ${90} L ${80 + 110 * sx + 22 * sd} ${90 - 16 * sd} L ${80 + 110 * sx + 22 * sd} ${90 - 16 * sd + 55 * sy * 0.45} L ${80 + 110 * sx} ${90 + 55 * sy * 0.45} Z`}
        fill={colors.shadow}
        stroke={colors.shadow} strokeWidth="0.8"
      />

      {/* Ручки нижнего */}
      {[0.2, 0.5, 0.8].map((t, i) => (
        <line key={i}
          x1={70 + 130 * sx * t + 5} y1={163}
          x2={70 + 130 * sx * t + 20} y2={163}
          stroke={colors.shadow} strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
      {/* Ручки верхнего */}
      {[0.25, 0.65].map((t, i) => (
        <line key={i}
          x1={80 + 110 * sx * t + 5} y1={115}
          x2={80 + 110 * sx * t + 20} y2={115}
          stroke={colors.shadow} strokeWidth="1.5" strokeLinecap="round"
        />
      ))}

      {/* Мойка */}
      <rect x={80} y={140} width={40 * sx} height={15} rx="2"
        fill="rgba(150,180,200,0.4)" stroke={colors.shadow} strokeWidth="0.8"
      />
    </svg>
  );
}

// Шкаф-купе
function WardrobeSVG({ w, h, d, colors }: { w: number; h: number; d: number; colors: ReturnType<typeof getColors> }) {
  const sx = Math.min(Math.max(w / 160, 0.6), 1.5);
  const sy = Math.min(Math.max(h / 220, 0.6), 1.4);
  const sd = Math.min(Math.max(d / 60, 0.6), 1.3);

  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="140" cy="228" rx={70 * sx} ry={9} fill="rgba(0,0,0,0.1)" />

      {/* Фронт */}
      <path
        d={`M ${70} ${50} L ${70 + 140 * sx} ${50} L ${70 + 140 * sx} ${50 + 165 * sy * 0.85} L ${70} ${50 + 165 * sy * 0.85} Z`}
        fill={colors.body} stroke={colors.edge} strokeWidth="1"
      />
      {/* Верх */}
      <path
        d={`M ${70} ${50} L ${70 + 140 * sx} ${50} L ${70 + 140 * sx + 30 * sd} ${50 - 22 * sd} L ${70 + 30 * sd} ${50 - 22 * sd} Z`}
        fill={colors.edge} stroke={colors.shadow} strokeWidth="0.8"
      />
      {/* Правый бок */}
      <path
        d={`M ${70 + 140 * sx} ${50} L ${70 + 140 * sx + 30 * sd} ${50 - 22 * sd} L ${70 + 140 * sx + 30 * sd} ${50 - 22 * sd + 165 * sy * 0.85} L ${70 + 140 * sx} ${50 + 165 * sy * 0.85} Z`}
        fill={colors.shadow} stroke={colors.shadow} strokeWidth="0.8"
      />

      {/* Раздвижные двери — вертикальная линия */}
      <line
        x1={70 + 70 * sx} y1={50}
        x2={70 + 70 * sx} y2={50 + 165 * sy * 0.85}
        stroke={colors.edge} strokeWidth="2"
      />

      {/* Зеркало на левой двери */}
      <rect
        x={74} y={60}
        width={65 * sx} height={130 * sy * 0.75}
        fill="rgba(200,220,240,0.3)"
        stroke={colors.edge} strokeWidth="0.8"
      />

      {/* Ручки */}
      {[0.28, 0.72].map((t, i) => (
        <line key={i}
          x1={70 + 140 * sx * t} y1={50 + 82 * sy * 0.85}
          x2={70 + 140 * sx * t} y2={50 + 100 * sy * 0.85}
          stroke={colors.shadow} strokeWidth="2" strokeLinecap="round"
        />
      ))}

      {/* Плинтус */}
      <rect x={70} y={50 + 165 * sy * 0.85} width={140 * sx} height={5}
        fill={colors.shadow} stroke={colors.shadow} strokeWidth="0.5"
      />
    </svg>
  );
}

// Диван
function SofaSVG({ w, h, d, colors }: { w: number; h: number; d: number; colors: ReturnType<typeof getColors> }) {
  const sx = Math.min(Math.max(w / 200, 0.6), 1.5);
  const sy = Math.min(Math.max(h / 90, 0.6), 1.4);
  const sd = Math.min(Math.max(d / 90, 0.6), 1.3);

  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="150" cy="210" rx={90 * sx} ry={10} fill="rgba(0,0,0,0.1)" />

      {/* Ножки */}
      {[0.12, 0.88].map((t, i) => (
        <rect key={i}
          x={50 + 200 * sx * t - 4} y={175 + 10 * sy}
          width={8} height={18}
          fill={colors.shadow}
        />
      ))}

      {/* Сиденье — бок */}
      <path
        d={`M ${50 + 200 * sx} ${140} L ${50 + 200 * sx + 28 * sd} ${125} L ${50 + 200 * sx + 28 * sd} ${175} L ${50 + 200 * sx} ${175 + 10 * sy} Z`}
        fill={colors.shadow}
      />
      {/* Сиденье — верх */}
      <path
        d={`M ${50} ${140} L ${50 + 200 * sx} ${140} L ${50 + 200 * sx + 28 * sd} ${125} L ${50 + 28 * sd} ${125} Z`}
        fill={colors.edge}
      />
      {/* Сиденье — фронт */}
      <path
        d={`M ${50} ${140} L ${50 + 200 * sx} ${140} L ${50 + 200 * sx} ${175 + 10 * sy} L ${50} ${175 + 10 * sy} Z`}
        fill={colors.body} stroke={colors.edge} strokeWidth="1"
      />

      {/* Спинка — фронт */}
      <path
        d={`M ${50} ${100} L ${50 + 200 * sx} ${100} L ${50 + 200 * sx} ${140} L ${50} ${140} Z`}
        fill={colors.body} stroke={colors.edge} strokeWidth="1"
      />
      {/* Спинка — верх */}
      <path
        d={`M ${50} ${100} L ${50 + 200 * sx} ${100} L ${50 + 200 * sx + 28 * sd} ${85} L ${50 + 28 * sd} ${85} Z`}
        fill={colors.edge}
      />
      {/* Спинка — бок */}
      <path
        d={`M ${50 + 200 * sx} ${100} L ${50 + 200 * sx + 28 * sd} ${85} L ${50 + 200 * sx + 28 * sd} ${125} L ${50 + 200 * sx} ${140} Z`}
        fill={colors.shadow}
      />

      {/* Подлокотники */}
      {[50, 50 + 200 * sx - 16].map((x, i) => (
        <g key={i}>
          <rect x={x} y={95} width={16} height={80 + 10 * sy} fill={colors.edge} stroke={colors.shadow} strokeWidth="0.8" />
        </g>
      ))}

      {/* Подушки */}
      {[0.22, 0.55, 0.78].map((t, i) => (
        <ellipse key={i}
          cx={50 + 200 * sx * t + 16}
          cy={115}
          rx={24 * sx} ry={14}
          fill={colors.edge} stroke={colors.shadow} strokeWidth="0.8"
          opacity="0.7"
        />
      ))}
    </svg>
  );
}

// Спальня
function BedroomSVG({ w, h, d, colors }: { w: number; h: number; d: number; colors: ReturnType<typeof getColors> }) {
  const sx = Math.min(Math.max(w / 200, 0.6), 1.4);
  const sy = Math.min(Math.max(h / 220, 0.6), 1.4);
  const sd = Math.min(Math.max(d / 200, 0.6), 1.3);

  return (
    <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="150" cy="218" rx={95 * sx} ry={10} fill="rgba(0,0,0,0.1)" />

      {/* Матрас — бок */}
      <path
        d={`M ${50 + 195 * sx} ${135} L ${50 + 195 * sx + 35 * sd} ${115} L ${50 + 195 * sx + 35 * sd} ${165} L ${50 + 195 * sx} ${175} Z`}
        fill={colors.edge}
      />
      {/* Матрас — верх */}
      <path
        d={`M ${50} ${135} L ${50 + 195 * sx} ${135} L ${50 + 195 * sx + 35 * sd} ${115} L ${50 + 35 * sd} ${115} Z`}
        fill="white" stroke={colors.edge} strokeWidth="0.8"
      />
      {/* Матрас — фронт */}
      <path
        d={`M ${50} ${135} L ${50 + 195 * sx} ${135} L ${50 + 195 * sx} ${175} L ${50} ${175} Z`}
        fill="rgba(240,240,245,0.95)" stroke={colors.edge} strokeWidth="1"
      />

      {/* Каркас кровати — фронт */}
      <path
        d={`M ${45} ${170} L ${45 + 205 * sx} ${170} L ${45 + 205 * sx} ${195} L ${45} ${195} Z`}
        fill={colors.body} stroke={colors.edge} strokeWidth="1"
      />
      {/* Каркас — верх */}
      <path
        d={`M ${45} ${170} L ${45 + 205 * sx} ${170} L ${45 + 205 * sx + 36 * sd} ${150} L ${45 + 36 * sd} ${150} Z`}
        fill={colors.edge}
      />
      {/* Каркас — бок */}
      <path
        d={`M ${45 + 205 * sx} ${170} L ${45 + 205 * sx + 36 * sd} ${150} L ${45 + 205 * sx + 36 * sd} ${175} L ${45 + 205 * sx} ${195} Z`}
        fill={colors.shadow}
      />

      {/* Изголовье — фронт */}
      <path
        d={`M ${45} ${100} L ${45 + 205 * sx} ${100} L ${45 + 205 * sx} ${175} L ${45} ${175} Z`}
        fill={colors.body} stroke={colors.edge} strokeWidth="1"
      />
      {/* Изголовье — верх */}
      <path
        d={`M ${45} ${100} L ${45 + 205 * sx} ${100} L ${45 + 205 * sx + 36 * sd} ${80} L ${45 + 36 * sd} ${80} Z`}
        fill={colors.edge} stroke={colors.shadow} strokeWidth="0.8"
      />
      {/* Изголовье — бок */}
      <path
        d={`M ${45 + 205 * sx} ${100} L ${45 + 205 * sx + 36 * sd} ${80} L ${45 + 205 * sx + 36 * sd} ${155} L ${45 + 205 * sx} ${175} Z`}
        fill={colors.shadow}
      />

      {/* Подушки */}
      {[0.18, 0.62].map((t, i) => (
        <path key={i}
          d={`M ${55 + 195 * sx * t} ${120} L ${55 + 195 * sx * t + 75 * sx * 0.4} ${120} L ${55 + 195 * sx * t + 75 * sx * 0.4} ${138} L ${55 + 195 * sx * t} ${138} Z`}
          fill="white" stroke="rgba(200,200,210,0.8)" strokeWidth="0.8"
          rx="4"
        />
      ))}

      {/* Ножки */}
      {[[45, 195], [45 + 205 * sx, 195]].map(([x, y], i) => (
        <rect key={i} x={x - 4} y={y} width={8} height={14} fill={colors.shadow} />
      ))}
    </svg>
  );
}

// Универсальный для остальных типов
function GenericSVG({ type, w, h, d, colors }: { type: string; w: number; h: number; d: number; colors: ReturnType<typeof getColors> }) {
  const sx = Math.min(Math.max(w / 180, 0.6), 1.5);
  const sy = Math.min(Math.max(h / 200, 0.6), 1.5);
  const sd = Math.min(Math.max(d / 60, 0.6), 1.3);

  return (
    <svg viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="140" cy="228" rx={70 * sx} ry={9} fill="rgba(0,0,0,0.1)" />

      {/* Фронт */}
      <path
        d={`M ${75} ${55} L ${75 + 130 * sx} ${55} L ${75 + 130 * sx} ${55 + 160 * sy * 0.82} L ${75} ${55 + 160 * sy * 0.82} Z`}
        fill={colors.body} stroke={colors.edge} strokeWidth="1"
      />
      {/* Верх */}
      <path
        d={`M ${75} ${55} L ${75 + 130 * sx} ${55} L ${75 + 130 * sx + 28 * sd} ${55 - 20 * sd} L ${75 + 28 * sd} ${55 - 20 * sd} Z`}
        fill={colors.edge} stroke={colors.shadow} strokeWidth="0.8"
      />
      {/* Правый бок */}
      <path
        d={`M ${75 + 130 * sx} ${55} L ${75 + 130 * sx + 28 * sd} ${55 - 20 * sd} L ${75 + 130 * sx + 28 * sd} ${55 - 20 * sd + 160 * sy * 0.82} L ${75 + 130 * sx} ${55 + 160 * sy * 0.82} Z`}
        fill={colors.shadow} stroke={colors.shadow} strokeWidth="0.8"
      />

      {/* Полки */}
      {[0.33, 0.66].map((t, i) => (
        <line key={i}
          x1={75} y1={55 + 160 * sy * 0.82 * t}
          x2={75 + 130 * sx} y2={55 + 160 * sy * 0.82 * t}
          stroke={colors.edge} strokeWidth="1.2"
        />
      ))}

      {/* Ручка */}
      <circle cx={75 + 65 * sx} cy={55 + 80 * sy * 0.82} r={5}
        fill="none" stroke={colors.shadow} strokeWidth="1.5"
      />
    </svg>
  );
}

export default function FurniturePreview({ type, material, style, width, height, depth }: Props) {
  const colors = getColors(material);

  const renderFurniture = () => {
    switch (type) {
      case "kitchen":   return <KitchenSVG w={width} h={height} d={depth} colors={colors} />;
      case "wardrobe":  return <WardrobeSVG w={width} h={height} d={depth} colors={colors} />;
      case "sofa":      return <SofaSVG w={width} h={height} d={depth} colors={colors} />;
      case "bedroom":   return <BedroomSVG w={width} h={height} d={depth} colors={colors} />;
      default:          return <GenericSVG type={type} w={width} h={height} d={depth} colors={colors} />;
    }
  };

  if (!type) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20 py-8">
        <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-20">
          <rect x="10" y="20" width="60" height="50" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <rect x="20" y="10" width="40" height="15" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <line x1="10" y1="45" x2="70" y2="45" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
        <p className="text-[10px] tracking-widest uppercase">Выберите тип мебели</p>
      </div>
    );
  }

  return (
    <div className="relative transition-all duration-500">
      <div className="aspect-[4/3] flex items-center justify-center px-2">
        {renderFurniture()}
      </div>

      {/* Размеры */}
      {(width || height || depth) && (
        <div className="flex justify-between text-[10px] text-white/30 px-1 mt-1">
          <span>Ш {width} см</span>
          <span>В {height} см</span>
          <span>Г {depth} см</span>
        </div>
      )}
    </div>
  );
}
