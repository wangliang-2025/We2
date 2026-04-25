"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { GlassCard } from "@/components/ui/glass-card";
import { useI18n } from "@/i18n";
import { store, type Photo } from "@/lib/storage";
import { api } from "@/lib/api-client";
import { formatDate, cn } from "@/lib/utils";
import { Image as ImageIcon, Upload, Trash2, MapPin, X, Grid3x3, LayoutList, Camera, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type View = "grid" | "waterfall" | "polaroid" | "timeline";

export default function AlbumPage() {
  const { t } = useI18n();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [view, setView] = useState<View>("grid");
  const [preview, setPreview] = useState<Photo | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);

  useEffect(() => {
    const refresh = () => setPhotos(store.photos.list());
    refresh();
    window.addEventListener("ld:storage", refresh);
    return () => window.removeEventListener("ld:storage", refresh);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setUploading(list.length);
    for (const file of list) {
      try {
        const result = await api.uploadImage(file);
        store.photos.add({
          url: result.url,
          thumbnail: result.thumbnail,
          caption: "",
        });
      } catch (err) {
        alert(`上传失败：${err instanceof Error ? err.message : err}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const remove = (id: string) => {
    if (confirm(t("album.deleteConfirm"))) {
      store.photos.remove(id);
      setPreview(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader
        title={t("album.title")}
        subtitle={t("album.subtitle")}
        icon={<ImageIcon className="text-pink-500" size={24} />}
        actions={
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading > 0}
            className="btn-macaron text-sm flex items-center gap-1.5 disabled:opacity-60"
          >
            {uploading > 0 ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {uploading} 张上传中
              </>
            ) : (
              <>
                <Upload size={16} /> {t("album.upload")}
              </>
            )}
          </button>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <ViewSwitcher value={view} onChange={setView} />

      {photos.length === 0 ? (
        <EmptyDrop onFiles={handleFiles} />
      ) : view === "grid" ? (
        <GridView photos={photos} onPreview={setPreview} />
      ) : view === "waterfall" ? (
        <WaterfallView photos={photos} onPreview={setPreview} />
      ) : view === "polaroid" ? (
        <PolaroidView photos={photos} onPreview={setPreview} />
      ) : (
        <TimelineView photos={photos} onPreview={setPreview} />
      )}

      <AnimatePresence>
        {preview && <Lightbox photo={preview} onClose={() => setPreview(null)} onDelete={() => remove(preview.id)} />}
      </AnimatePresence>
    </div>
  );
}

function ViewSwitcher({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  const { t } = useI18n();
  const opts: { v: View; icon: React.ReactNode; label: string }[] = [
    { v: "grid", icon: <Grid3x3 size={14} />, label: t("album.view.grid") },
    { v: "waterfall", icon: <LayoutList size={14} />, label: t("album.view.waterfall") },
    { v: "polaroid", icon: <Camera size={14} />, label: t("album.view.polaroid") },
    { v: "timeline", icon: <Clock size={14} />, label: t("album.view.timeline") },
  ];
  return (
    <div className="glass glass-highlight rounded-2xl p-1.5 inline-flex gap-1">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
            value === o.v
              ? "bg-gradient-to-r from-rose-400 to-purple-400 text-white shadow-md"
              : "hover:bg-white/40 dark:hover:bg-white/10"
          )}
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function EmptyDrop({ onFiles }: { onFiles: (f: FileList | null) => void }) {
  const { t } = useI18n();
  const [over, setOver] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "block glass-strong glass-highlight rounded-3xl p-12 text-center cursor-pointer transition-all border-2 border-dashed",
        over ? "border-rose-400 scale-[1.01]" : "border-white/40"
      )}
    >
      <input type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
      <Upload className="mx-auto opacity-50 mb-3" size={48} />
      <p className="text-sm font-medium opacity-80">{t("album.uploadHint")}</p>
      <p className="text-xs opacity-50 mt-1">{t("album.empty")}</p>
    </label>
  );
}

function GridView({ photos, onPreview }: { photos: Photo[]; onPreview: (p: Photo) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {photos.map((p, i) => (
        <motion.button
          key={p.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onPreview(p)}
          className="aspect-square rounded-2xl overflow-hidden glass-light glass-highlight relative group hover:scale-[1.03] transition-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.thumbnail || p.url} alt="" className="w-full h-full object-cover" />
          {p.caption && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2 text-left">
              {p.caption}
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

function WaterfallView({ photos, onPreview }: { photos: Photo[]; onPreview: (p: Photo) => void }) {
  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
      {photos.map((p) => (
        <button
          key={p.id}
          onClick={() => onPreview(p)}
          className="block w-full break-inside-avoid rounded-2xl overflow-hidden glass-light glass-highlight group hover:scale-[1.02] transition-transform"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.thumbnail || p.url} alt="" className="w-full h-auto block" />
          {p.caption && (
            <div className="p-2 text-[11px] text-left opacity-80 line-clamp-2">{p.caption}</div>
          )}
        </button>
      ))}
    </div>
  );
}

function PolaroidView({ photos, onPreview }: { photos: Photo[]; onPreview: (p: Photo) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {photos.map((p, i) => {
        const rotation = ((i * 37) % 9) - 4;
        return (
          <button
            key={p.id}
            onClick={() => onPreview(p)}
            style={{ transform: `rotate(${rotation}deg)` }}
            className="bg-white dark:bg-zinc-100 p-2 pb-12 shadow-glass-lg hover:scale-105 hover:!rotate-0 transition-all relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail || p.url} alt="" className="w-full aspect-square object-cover" />
            <div className="absolute bottom-2 left-2 right-2 text-center font-hand text-zinc-700 text-sm truncate">
              {p.caption || formatDate(p.createdAt)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TimelineView({ photos, onPreview }: { photos: Photo[]; onPreview: (p: Photo) => void }) {
  const groups = photos.reduce<Record<string, Photo[]>>((acc, p) => {
    const key = formatDate(p.createdAt).slice(0, 7);
    (acc[key] ||= []).push(p);
    return acc;
  }, {});
  const keys = Object.keys(groups).sort().reverse();
  return (
    <div className="space-y-4">
      {keys.map((k) => (
        <GlassCard key={k} className="p-4">
          <div className="text-xs font-bold opacity-60 mb-3 tracking-wider">{k}</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {groups[k].map((p) => (
              <button
                key={p.id}
                onClick={() => onPreview(p)}
                className="aspect-square rounded-xl overflow-hidden hover:scale-105 transition-transform"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumbnail || p.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function Lightbox({
  photo,
  onClose,
  onDelete,
}: {
  photo: Photo;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { t } = useI18n();
  const [caption, setCaption] = useState(photo.caption || "");
  const [location, setLocation] = useState(photo.location || "");

  const save = () => {
    store.photos.update(photo.id, { caption, location });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="glass-strong glass-highlight rounded-3xl p-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/40 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" className="w-full max-h-[60vh] object-contain rounded-2xl mb-4" />
        <div className="space-y-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t("album.addCaption")}
            className="input-glass min-h-[80px] resize-none"
          />
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("album.location")}
              className="input-glass pl-9"
            />
          </div>
          <div className="text-xs opacity-60">{formatDate(photo.createdAt, true)}</div>
          <div className="flex gap-2 justify-between">
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-rose-500 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 transition-colors"
            >
              <Trash2 size={14} /> {t("album.delete")}
            </button>
            <button onClick={save} className="btn-macaron text-sm">
              {t("common.save")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

