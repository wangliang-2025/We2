"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type MoodEntry } from "@/lib/storage";
import { Smile, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

const moodEmojis = ["😢", "🙁", "😐", "🙂", "😍"];
const moodGradients = [
  "from-blue-300 to-indigo-400",
  "from-sky-300 to-blue-400",
  "from-amber-200 to-yellow-300",
  "from-pink-300 to-rose-400",
  "from-rose-400 to-pink-500",
];

function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function MoodPage() {
  const { t } = useI18n();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string>(formatDate(today));

  useEffect(() => {
    const refresh = () => setMoods(store.moods.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const monthCells = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const moodMap = useMemo(() => {
    const m: Record<string, MoodEntry> = {};
    moods.forEach((x) => (m[x.date] = x));
    return m;
  }, [moods]);

  const selectedEntry = moodMap[selected];

  const setMood = (who: "yourMood" | "theirMood", val: 1 | 2 | 3 | 4 | 5) => {
    store.moods.set(selected, { [who]: val });
  };

  const setNote = (note: string) => {
    store.moods.set(selected, { note });
  };

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekDaysEn = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("mood.title")}
        subtitle={t("mood.subtitle")}
        icon={<Smile className="text-pink-500" size={24} />}
      />

      <GlassCard variant="strong" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goPrev} className="p-2 rounded-full hover:bg-white/40">
            <ChevronLeft size={18} />
          </button>
          <div className="font-bold text-lg">
            {year} · {String(month + 1).padStart(2, "0")}
          </div>
          <button onClick={goNext} className="p-2 rounded-full hover:bg-white/40">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d, i) => (
            <div key={d} className="text-center text-[10px] opacity-60 py-1 font-medium">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{weekDaysEn[i]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthCells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = formatDate(d);
            const entry = moodMap[dateStr];
            const isToday = dateStr === formatDate(today);
            const isSelected = dateStr === selected;
            const yourGrad = entry?.yourMood ? moodGradients[entry.yourMood - 1] : null;
            const theirGrad = entry?.theirMood ? moodGradients[entry.theirMood - 1] : null;
            return (
              <button
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                className={cn(
                  "aspect-square rounded-xl text-xs font-medium relative overflow-hidden transition-all",
                  isSelected && "ring-2 ring-rose-400 scale-105 shadow-glow z-10",
                  !entry && "bg-white/30 dark:bg-white/5 hover:bg-white/50"
                )}
              >
                {entry && (
                  <div className="absolute inset-0 flex">
                    {yourGrad && <div className={cn("flex-1 bg-gradient-to-br", yourGrad)} />}
                    {theirGrad && <div className={cn("flex-1 bg-gradient-to-br", theirGrad)} />}
                    {!yourGrad && !theirGrad && (
                      <div className="flex-1 bg-white/30 dark:bg-white/5" />
                    )}
                  </div>
                )}
                <span
                  className={cn(
                    "relative z-10",
                    entry && (yourGrad || theirGrad) && "text-white drop-shadow-sm font-bold",
                    isToday && "underline"
                  )}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard variant="strong" className="p-5">
        <div className="text-sm font-medium opacity-80 mb-4">
          {selected} {selected === formatDate(today) && `· ${t("mood.today")}`}
        </div>

        <MoodPicker
          label={t("mood.yourMood")}
          value={selectedEntry?.yourMood}
          onChange={(v) => setMood("yourMood", v)}
        />
        <div className="h-3" />
        <MoodPicker
          label={t("mood.theirMood")}
          value={selectedEntry?.theirMood}
          onChange={(v) => setMood("theirMood", v)}
        />

        <textarea
          value={selectedEntry?.note || ""}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("mood.note")}
          className="input-glass min-h-[80px] resize-none mt-4"
        />
      </GlassCard>
    </div>
  );
}

function MoodPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className="text-xs opacity-70 mb-2">{label}</div>
      <div className="grid grid-cols-5 gap-2">
        {moodEmojis.map((e, i) => {
          const v = (i + 1) as 1 | 2 | 3 | 4 | 5;
          const selected = value === v;
          return (
            <motion.button
              key={i}
              onClick={() => onChange(v)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all relative overflow-hidden",
                selected
                  ? `bg-gradient-to-br ${moodGradients[i]} text-white shadow-glow scale-105`
                  : "bg-white/40 dark:bg-white/10 hover:bg-white/60"
              )}
            >
              <span className="text-2xl">{e}</span>
              <span className="text-[9px] font-medium">
                {t(`mood.moods.${v}`)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
