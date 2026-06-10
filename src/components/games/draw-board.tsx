"use client";

import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { Brush, Eraser, RotateCcw, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const colors = [
  "#FF8FA3", "#FFB6C1", "#FFD4B8", "#FFF1A8", "#B8F0D6",
  "#B8DCFF", "#D8C4FF", "#FFB8E0", "#2D2D3D", "#FFFFFF",
];

export function DrawBoard() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(4);
  const [erasing, setErasing] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    let resizeId = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const saved = canvas.toDataURL();
      const currentId = ++resizeId;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const img = new Image();
      img.onload = () => {
        if (currentId !== resizeId) return;
        ctx.drawImage(img, 0, 0);
      };
      img.src = saved;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const getPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = getPos(e);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = erasing ? size * 4 : size;
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    last.current = pos;
  };

  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  const save = () => {
    const c = canvasRef.current;
    if (!c) return;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `our-doodle-${Date.now()}.png`;
    a.click();
  };

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-400 grid place-items-center text-white shadow-md">
          <Brush size={18} />
        </div>
        <h2 className="font-bold">{t("games.draw")}</h2>
      </div>
      <p className="text-xs opacity-70 mb-4 ml-11">{t("games.drawDesc")}</p>

      <div className="glass-light glass-highlight rounded-2xl p-1 mb-3">
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          style={{ touchAction: "none" }}
          className="w-full h-[360px] sm:h-[420px] rounded-xl bg-white/80 dark:bg-zinc-900/60 cursor-crosshair block"
        />
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs opacity-70 mb-1.5">{t("games.drawColor")}</div>
          <div className="flex gap-1.5 flex-wrap">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setErasing(false);
                }}
                style={{ backgroundColor: c }}
                className={cn(
                  "w-8 h-8 rounded-full shadow-md transition-transform border-2",
                  color === c && !erasing
                    ? "border-white scale-110 ring-2 ring-rose-400"
                    : "border-white/60 hover:scale-105"
                )}
              />
            ))}
            <button
              onClick={() => setErasing(!erasing)}
              className={cn(
                "w-8 h-8 rounded-full grid place-items-center transition-all border-2",
                erasing
                  ? "bg-gradient-to-br from-rose-300 to-pink-400 text-white border-white scale-110"
                  : "bg-white/60 dark:bg-white/10 border-white/60 hover:scale-105"
              )}
            >
              <Eraser size={14} />
            </button>
          </div>
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1.5">{t("games.drawSize")}: {size}px</div>
          <input
            type="range"
            min={1}
            max={20}
            value={size}
            onChange={(e) => setSize(+e.target.value)}
            className="w-full accent-rose-400"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="btn-glass text-sm flex-1 flex items-center justify-center gap-1.5">
            <RotateCcw size={14} /> {t("games.drawClear")}
          </button>
          <button onClick={save} className="btn-macaron text-sm flex-1 flex items-center justify-center gap-1.5">
            <Download size={14} /> {t("games.drawSave")}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
