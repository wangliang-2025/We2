"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Photo, type Diary } from "@/lib/storage";
import { Image as ImageIcon, Clock } from "lucide-react";
import Link from "next/link";

type Memory =
  | { kind: "photo"; data: Photo; createdAt: string }
  | { kind: "diary"; data: Diary; createdAt: string };

export function RecentMemories() {
  const { t } = useI18n();
  const [items, setItems] = useState<Memory[]>([]);

  useEffect(() => {
    const refresh = () => {
      const photos: Memory[] = store.photos.list().map((p) => ({
        kind: "photo",
        data: p,
        createdAt: p.createdAt,
      }));
      const diaries: Memory[] = store.diaries
        .list()
        .filter((d) => d.privacy !== "private")
        .map((d) => ({ kind: "diary", data: d, createdAt: d.createdAt }));
      const combined = [...photos, ...diaries]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 6);
      setItems(combined);
    };
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  return (
    <GlassCard variant="strong" className="p-5">
      <div className="flex items-center gap-2 text-sm font-medium opacity-80 mb-3">
        <Clock size={16} className="text-rose-400" />
        {t("home.recent")}
      </div>
      {items.length === 0 ? (
        <div className="py-8 text-center text-sm opacity-60">
          {t("home.emptyRecent")}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {items.map((m, i) => (
            <Link
              key={m.kind + "-" + m.data.id}
              href={m.kind === "photo" ? "/album" : "/diary"}
              className="aspect-square rounded-2xl overflow-hidden glass-light glass-highlight hover:scale-105 transition-transform relative group"
            >
              {m.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.data.thumbnail || m.data.url}
                  alt={m.data.caption || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center bg-gradient-to-br from-amber-100/60 to-rose-100/60 dark:from-amber-900/30 dark:to-rose-900/30">
                  <ImageIcon size={20} className="opacity-40 mb-1" />
                  <div className="text-[10px] line-clamp-3 leading-tight font-medium opacity-80">
                    {m.data.title || m.data.content.slice(0, 20)}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
