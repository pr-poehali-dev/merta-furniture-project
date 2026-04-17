import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PRODUCTS } from "@/data/products";
import Icon from "@/components/ui/icon";

const formatPrice = (n: number) =>
  n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImg(0);
  }, [id]);

  const product = PRODUCTS.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-[#999]">
        <Icon name="PackageOpen" size={48} className="opacity-30" />
        <p className="text-[11px] tracking-widest uppercase">Товар не найден</p>
        <button onClick={() => navigate("/")} className="text-[11px] tracking-widest uppercase border border-[#111] text-[#111] px-6 py-2 mt-2 hover:bg-[#111] hover:text-white transition-colors">
          На главную
        </button>
      </div>
    );
  }

  const images = product.images ?? [product.img];
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  const prev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="min-h-screen bg-[#f9f9f7] font-body text-[#111]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#eee]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-14 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#555] hover:text-[#111] transition-colors">
            <Icon name="ArrowLeft" size={18} />
            <span className="text-[11px] tracking-widest uppercase">Назад</span>
          </button>
          <div className="flex-1" />
          <button onClick={() => navigate("/")} className="font-display text-xl font-semibold tracking-widest">
            MERTA
          </button>
        </div>
      </nav>

      <div className="pt-14 max-w-5xl mx-auto px-5 md:px-10 py-8 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">

          {/* Галерея */}
          <div className="flex flex-col gap-3">
            {/* Главное фото */}
            <div className="relative aspect-[4/3] bg-[#eee] overflow-hidden group">
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-400 ${i === activeImg ? "opacity-100" : "opacity-0"}`}
                />
              ))}

              {product.tag && (
                <span className="absolute top-4 left-4 bg-[#111] text-white text-[9px] tracking-widest uppercase px-3 py-1.5 z-10">
                  {product.tag}
                </span>
              )}

              {/* Стрелки */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Icon name="ChevronLeft" size={18} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Icon name="ChevronRight" size={18} />
                  </button>
                  {/* Счётчик */}
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] tracking-widest px-2 py-1 z-10">
                    {activeImg + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Миниатюры */}
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-1 aspect-[4/3] overflow-hidden border-2 transition-all ${i === activeImg ? "border-[#111]" : "border-transparent opacity-60 hover:opacity-90"}`}
                  >
                    <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-2">{product.category}</p>
            <h1 className="font-display text-4xl md:text-5xl font-light mb-6 leading-tight">{product.name}</h1>

            <div className="grid grid-cols-2 gap-4 mb-6 p-5 bg-white border border-[#eee]">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-[#bbb] mb-1">Материал</p>
                <p className="font-medium">{product.material}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-[#bbb] mb-1">Изготовление</p>
                <p className="font-medium">от 25 дней</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-[#bbb] mb-1">Доставка</p>
                <p className="font-medium">Бесплатно</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-[#bbb] mb-1">Гарантия</p>
                <p className="font-medium">2 года</p>
              </div>
            </div>

            <p className="text-[#555] leading-relaxed mb-8">{product.description}</p>

            <div className="mt-auto">
              <p className="text-[10px] tracking-widest uppercase text-[#bbb] mb-1">Стоимость</p>
              <p className="font-display text-3xl font-light mb-6">от {formatPrice(product.price)}</p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/79181300668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#111] text-white py-4 text-[11px] tracking-widest uppercase text-center hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="MessageCircle" size={15} />
                  Заказать через WhatsApp
                </a>
                <a
                  href="tel:+79181300668"
                  className="w-full border border-[#111] py-4 text-[11px] tracking-widest uppercase text-center hover:bg-[#111] hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="Phone" size={15} />
                  Позвонить
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 md:mt-24">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#999] mb-3">Похожие товары</p>
            <h2 className="font-display text-3xl font-light mb-8">Вам может понравиться</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {related.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-white cursor-pointer group hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#eee]">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-[10px] tracking-widest uppercase text-[#999] mb-1">{p.category}</p>
                    <p className="font-display text-lg font-light leading-tight">{p.name}</p>
                    <p className="text-sm font-semibold mt-1">от {formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
