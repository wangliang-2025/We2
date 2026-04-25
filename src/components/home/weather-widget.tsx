"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store } from "@/lib/storage";
import { Cloud, Sun, CloudRain, CloudSnow, MapPin } from "lucide-react";

type Weather = {
  city: string;
  temp: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
  desc: string;
};

function mockWeather(city: string): Weather {
  // 基于城市名生成稳定的"天气"，避免每次刷新都变（一天内稳定）
  const seed =
    city.split("").reduce((a, c) => a + c.charCodeAt(0), 0) +
    Math.floor(Date.now() / (1000 * 60 * 60 * 8));
  const conditions: Weather["condition"][] = ["sunny", "cloudy", "rainy", "snowy"];
  const cond = conditions[seed % 4];
  const temp = 8 + (seed % 25);
  const descMap = { sunny: "晴", cloudy: "多云", rainy: "有雨", snowy: "雪" };
  return { city, temp, condition: cond, desc: descMap[cond] };
}

function WeatherIcon({ c }: { c: Weather["condition"] }) {
  const cls = "w-8 h-8";
  switch (c) {
    case "sunny":
      return <Sun className={`${cls} text-amber-400`} />;
    case "cloudy":
      return <Cloud className={`${cls} text-slate-400`} />;
    case "rainy":
      return <CloudRain className={`${cls} text-sky-400`} />;
    case "snowy":
      return <CloudSnow className={`${cls} text-cyan-300`} />;
  }
}

export function WeatherWidget() {
  const { t } = useI18n();
  const [data, setData] = useState<{ a: Weather; b: Weather } | null>(null);

  useEffect(() => {
    const update = () => {
      const p = store.profile.get();
      setData({ a: mockWeather(p.cityA), b: mockWeather(p.cityB) });
    };
    update();
    window.addEventListener("ld:storage", update);
    return () => window.removeEventListener("ld:storage", update);
  }, []);

  if (!data) return <GlassCard className="h-32 animate-pulse" />;

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-center gap-2 text-sm font-medium opacity-80 mb-3">
        <MapPin size={16} className="text-sky-400" />
        {t("home.weather")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[data.a, data.b].map((w, i) => (
          <div
            key={i}
            className="glass-light rounded-2xl p-3 flex items-center gap-3"
          >
            <WeatherIcon c={w.condition} />
            <div className="min-w-0">
              <div className="text-xs opacity-70 truncate">{w.city}</div>
              <div className="text-xl font-bold tabular-nums">{w.temp}°</div>
              <div className="text-[10px] opacity-60">{w.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
