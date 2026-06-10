"use client";

// 云端存储抽象层
// 设计：保持原有 sync API（store.xxx.list() 同步返回），底层走 API 调用 + 内存缓存
// 组件无需修改即可享受云端同步
import { api, type Me, type ApiUser } from "./api-client";

// ====== 类型定义（与原 localStorage 版兼容）======

export type Profile = {
  yourName: string;
  theirName: string;
  startDate: string;
  cityA: string;
  cityB: string;
  theme: "light" | "dark" | "auto";
  secret?: string;
  yourAvatar?: string;
  theirAvatar?: string;
  yourStatus?: string;
  theirStatus?: string;
  yourStatusText?: string;
  theirStatusText?: string;
  yourStatusUpdatedAt?: string;
  theirStatusUpdatedAt?: string;
  inviteCode?: string;
  isReady?: boolean;
};

export type Photo = {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  location?: string;
  createdAt: string;
  tags?: string[];
};

export type Diary = {
  id: string;
  title: string;
  content: string;
  mood: 1 | 2 | 3 | 4 | 5;
  weather?: string;
  privacy: "public" | "private" | "capsule";
  unlockAt?: string;
  authorId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  text: string;
  type: "text" | "interaction";
  interactionType?: "poke" | "hug" | "kiss" | "pat";
  authorId: string;
  createdAt: string;
};

export type Bottle = {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  pickedAt?: string;
};

export type Anniversary = {
  id: string;
  name: string;
  date: string;
  repeat: boolean;
  emoji?: string;
};

export type Wish = {
  id: string;
  text: string;
  category: "travel" | "food" | "experience" | "life" | "longterm";
  done: boolean;
  doneAt?: string;
  photo?: string;
};

export type Place = {
  id: string;
  name: string;
  type: "visited" | "wishlist";
  notes?: string;
  visitDate?: string;
  emoji?: string;
};

export type MoodEntry = {
  date: string;
  yourMood?: 1 | 2 | 3 | 4 | 5;
  theirMood?: 1 | 2 | 3 | 4 | 5;
  note?: string;
};

export type Complaint = {
  id: string;
  authorId: string;
  category: "small" | "big" | "cute";
  content: string;
  hammered: number;
  apologized: boolean;
  apology?: string;
  createdAt: string;
  apologizedAt?: string;
};

// ====== 内存缓存 ======

type Cache = {
  me: ApiUser | null;
  partner: ApiUser | null;
  coupleId: string | null;
  inviteCode: string | null;
  startDate: string;
  cityA: string;
  cityB: string;
  secret?: string;
  theme: "light" | "dark" | "auto";
  photos: Photo[];
  diaries: Diary[];
  messages: Message[];
  anniversaries: Anniversary[];
  wishes: Wish[];
  places: Place[];
  moods: MoodEntry[];
  complaints: Complaint[];
};

const cache: Cache = {
  me: null,
  partner: null,
  coupleId: null,
  inviteCode: null,
  startDate: new Date().toISOString().slice(0, 10),
  cityA: "北京",
  cityB: "上海",
  secret: undefined,
  theme: "auto",
  photos: [],
  diaries: [],
  messages: [],
  anniversaries: [],
  wishes: [],
  places: [],
  moods: [],
  complaints: [],
};

function readTheme(): "light" | "dark" | "auto" {
  if (typeof window === "undefined") return "auto";
  const v = localStorage.getItem("ld_theme");
  return v === "light" || v === "dark" ? v : "auto";
}

function writeTheme(t: "light" | "dark" | "auto") {
  if (typeof window !== "undefined") localStorage.setItem("ld_theme", t);
}

cache.theme = typeof window !== "undefined" ? readTheme() : "auto";

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ld:storage", { detail: { key: "*" } }));
  }
}

// ====== Hydration / Sync ======

let syncing = false;
let lastFullSync = 0;

export async function hydrateFromServer() {
  if (syncing) return;
  syncing = true;
  try {
    const meData: Me = await api.me();
    cache.me = meData.me;
    cache.partner = meData.partner;
    cache.coupleId = meData.couple.id;
    cache.inviteCode = meData.couple.inviteCode;
    cache.startDate = meData.couple.startDate;
    cache.cityA = meData.couple.cityA;
    cache.cityB = meData.couple.cityB;
    cache.secret = meData.couple.secret || undefined;

    const [photos, diaries, messages, anniv, wishes, places, moods, complaints] = await Promise.all([
      api.listPhotos(),
      api.listDiaries(),
      api.listMessages(),
      api.listAnniversaries(),
      api.listWishes(),
      api.listPlaces(),
      api.listMoods(),
      api.listComplaints(),
    ]);
    cache.photos = photos as Photo[];
    cache.diaries = diaries as Diary[];
    cache.messages = messages as Message[];
    cache.anniversaries = anniv as Anniversary[];
    cache.wishes = wishes as Wish[];
    cache.places = places as Place[];
    cache.moods = moods as MoodEntry[];
    cache.complaints = complaints as Complaint[];

    lastFullSync = Date.now();
    emit();
  } finally {
    syncing = false;
  }
}

// ====== Profile（兼容老接口）======

function buildProfile(): Profile {
  const me = cache.me;
  const partner = cache.partner;
  return {
    yourName: me?.name || "宝贝",
    theirName: partner?.name || "亲爱的",
    startDate: cache.startDate,
    cityA: cache.cityA,
    cityB: cache.cityB,
    theme: cache.theme,
    secret: cache.secret,
    yourAvatar: me?.avatar || "🐰",
    theirAvatar: partner?.avatar || "🦁",
    yourStatus: me?.status || "sunny",
    theirStatus: partner?.status || "sunny",
    yourStatusText: me?.statusText || undefined,
    theirStatusText: partner?.statusText || undefined,
    yourStatusUpdatedAt: me?.statusUpdatedAt || undefined,
    theirStatusUpdatedAt: partner?.statusUpdatedAt || undefined,
    inviteCode: cache.inviteCode || undefined,
    isReady: !!cache.me,
  };
}

// ====== Store（与原 API 相同）======

function withSync<T>(fn: () => Promise<T>): T | undefined {
  fn().catch((e) => console.error(e));
  return undefined;
}

export const store = {
  profile: {
    get: (): Profile => buildProfile(),
    set: (p: Partial<Profile>) => {
      const userPatch: Record<string, unknown> = {};
      const couplePatch: Record<string, unknown> = {};

      if (p.theme) {
        cache.theme = p.theme;
        writeTheme(p.theme);
      }
      if ("yourName" in p && p.yourName !== undefined) {
        userPatch.name = p.yourName;
        if (cache.me) cache.me.name = p.yourName;
      }
      if ("yourAvatar" in p && p.yourAvatar !== undefined) {
        userPatch.avatar = p.yourAvatar;
        if (cache.me) cache.me.avatar = p.yourAvatar;
      }
      if ("yourStatus" in p && p.yourStatus !== undefined) {
        userPatch.status = p.yourStatus;
        if (cache.me) cache.me.status = p.yourStatus;
      }
      if ("yourStatusText" in p) {
        userPatch.statusText = p.yourStatusText || null;
        if (cache.me) cache.me.statusText = p.yourStatusText || null;
      }
      if ("theirName" in p && p.theirName !== undefined) {
        // 对方名字只能由对方自己改，此处忽略
      }
      if ("startDate" in p && p.startDate !== undefined) {
        couplePatch.startDate = p.startDate;
        cache.startDate = p.startDate;
      }
      if ("cityA" in p && p.cityA !== undefined) {
        couplePatch.cityA = p.cityA;
        cache.cityA = p.cityA;
      }
      if ("cityB" in p && p.cityB !== undefined) {
        couplePatch.cityB = p.cityB;
        cache.cityB = p.cityB;
      }
      if ("secret" in p) {
        couplePatch.secret = p.secret || null;
        cache.secret = p.secret || undefined;
      }
      // 对方头像/状态不允许改（应该是对方自己的事）
      // 但为了 UI 兼容性，我们也忽略 theirAvatar/theirStatus 等

      emit();
      const merged: Record<string, unknown> = { ...userPatch, ...couplePatch };
      delete merged.theirName;
      if (Object.keys(merged).length > 0) {
        api.patchProfile(merged).catch((e) => console.error(e));
      }
    },
  },

  photos: {
    list: (): Photo[] => cache.photos,
    add: (p: Omit<Photo, "id" | "createdAt">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Photo = { ...p, id: tempId, createdAt: new Date().toISOString() };
      cache.photos = [optimistic, ...cache.photos];
      emit();
      withSync(async () => {
        const real = (await api.addPhoto(p)) as Photo;
        cache.photos = cache.photos.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    update: (id: string, patch: Partial<Photo>) => {
      cache.photos = cache.photos.map((p) => (p.id === id ? { ...p, ...patch } : p));
      emit();
      withSync(async () => {
        await api.patchPhoto(id, { caption: patch.caption, location: patch.location });
      });
    },
    remove: (id: string) => {
      cache.photos = cache.photos.filter((p) => p.id !== id);
      emit();
      withSync(() => api.removePhoto(id) as Promise<unknown>);
    },
  },

  diaries: {
    list: (): Diary[] => cache.diaries,
    add: (d: Omit<Diary, "id" | "createdAt" | "authorId">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Diary = {
        ...d,
        id: tempId,
        authorId: cache.me?.id || "",
        createdAt: new Date().toISOString(),
      };
      cache.diaries = [optimistic, ...cache.diaries];
      emit();
      withSync(async () => {
        const real = (await api.addDiary(d)) as Diary;
        cache.diaries = cache.diaries.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    remove: (id: string) => {
      cache.diaries = cache.diaries.filter((d) => d.id !== id);
      emit();
      withSync(() => api.removeDiary(id) as Promise<unknown>);
    },
  },

  messages: {
    list: (): Message[] => cache.messages,
    add: (m: Omit<Message, "id" | "createdAt" | "authorId">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Message = {
        ...m,
        id: tempId,
        authorId: cache.me?.id || "",
        createdAt: new Date().toISOString(),
      };
      cache.messages = [...cache.messages, optimistic];
      emit();
      withSync(async () => {
        const real = (await api.addMessage(m)) as Message;
        cache.messages = cache.messages.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    clear: () => {
      cache.messages = [];
      emit();
      withSync(() => api.clearMessages());
    },
  },

  bottles: {
    add: (text: string) => {
      withSync(() => api.addBottle(text) as Promise<unknown>);
    },
    pickRandom: async (): Promise<Bottle | null> => {
      try {
        const r = await api.pickBottle();
        return (r.picked as Bottle) || null;
      } catch {
        return null;
      }
    },
  },

  anniversaries: {
    list: (): Anniversary[] => cache.anniversaries,
    add: (a: Omit<Anniversary, "id">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Anniversary = { ...a, id: tempId };
      cache.anniversaries = [...cache.anniversaries, optimistic];
      emit();
      withSync(async () => {
        const real = (await api.addAnniversary(a)) as Anniversary;
        cache.anniversaries = cache.anniversaries.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    remove: (id: string) => {
      cache.anniversaries = cache.anniversaries.filter((a) => a.id !== id);
      emit();
      withSync(() => api.removeAnniversary(id) as Promise<unknown>);
    },
  },

  wishes: {
    list: (): Wish[] => cache.wishes,
    add: (w: Omit<Wish, "id" | "done">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Wish = { ...w, id: tempId, done: false };
      cache.wishes = [optimistic, ...cache.wishes];
      emit();
      withSync(async () => {
        const real = (await api.addWish(w)) as Wish;
        cache.wishes = cache.wishes.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    toggle: (id: string) => {
      cache.wishes = cache.wishes.map((w) =>
        w.id === id
          ? { ...w, done: !w.done, doneAt: w.done ? undefined : new Date().toISOString() }
          : w
      );
      emit();
      withSync(() => api.toggleWish(id) as Promise<unknown>);
    },
    remove: (id: string) => {
      cache.wishes = cache.wishes.filter((w) => w.id !== id);
      emit();
      withSync(() => api.removeWish(id) as Promise<unknown>);
    },
  },

  places: {
    list: (): Place[] => cache.places,
    add: (p: Omit<Place, "id">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Place = { ...p, id: tempId };
      cache.places = [...cache.places, optimistic];
      emit();
      withSync(async () => {
        const real = (await api.addPlace(p)) as Place;
        cache.places = cache.places.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    remove: (id: string) => {
      cache.places = cache.places.filter((p) => p.id !== id);
      emit();
      withSync(() => api.removePlace(id) as Promise<unknown>);
    },
  },

  moods: {
    list: (): MoodEntry[] => cache.moods,
    set: (date: string, patch: Partial<Omit<MoodEntry, "date">>) => {
      const idx = cache.moods.findIndex((m) => m.date === date);
      if (idx >= 0) {
        cache.moods[idx] = { ...cache.moods[idx], ...patch };
      } else {
        cache.moods.push({ date, ...patch });
      }
      emit();
      withSync(() =>
        api.setMood(date, {
          yourMood: patch.yourMood,
          theirMood: patch.theirMood,
          note: patch.note,
        }) as Promise<unknown>
      );
    },
    get: (date: string) => cache.moods.find((m) => m.date === date),
  },

  complaints: {
    list: (): Complaint[] => cache.complaints,
    add: (c: Omit<Complaint, "id" | "createdAt" | "hammered" | "apologized" | "authorId">) => {
      const tempId = "temp_" + Date.now();
      const optimistic: Complaint = {
        ...c,
        id: tempId,
        authorId: cache.me?.id || "",
        hammered: 0,
        apologized: false,
        createdAt: new Date().toISOString(),
      };
      cache.complaints = [optimistic, ...cache.complaints];
      emit();
      withSync(async () => {
        const real = (await api.addComplaint(c)) as Complaint;
        cache.complaints = cache.complaints.map((x) => (x.id === tempId ? real : x));
        emit();
      });
      return optimistic;
    },
    hammer: (id: string) => {
      cache.complaints = cache.complaints.map((c) =>
        c.id === id ? { ...c, hammered: c.hammered + 1 } : c
      );
      emit();
      withSync(() => api.hammerComplaint(id) as Promise<unknown>);
    },
    apologize: (id: string, apology: string) => {
      cache.complaints = cache.complaints.map((c) =>
        c.id === id
          ? { ...c, apologized: true, apology, apologizedAt: new Date().toISOString() }
          : c
      );
      emit();
      withSync(() => api.apologizeComplaint(id, apology) as Promise<unknown>);
    },
    remove: (id: string) => {
      cache.complaints = cache.complaints.filter((c) => c.id !== id);
      emit();
      withSync(() => api.removeComplaint(id) as Promise<unknown>);
    },
  },

  // 当前用户辅助方法
  isLoggedIn: () => !!cache.me,
  myId: () => cache.me?.id || null,
  myRole: () => cache.me?.role || null,
};

export function useStorageEvent(handler: (key: string) => void) {
  if (typeof window === "undefined") return;
  const fn = (e: Event) => {
    const ce = e as CustomEvent<{ key: string }>;
    handler(ce.detail.key);
  };
  window.addEventListener("ld:storage", fn);
  return () => window.removeEventListener("ld:storage", fn);
}

export function getCacheStats() {
  return {
    lastFullSync,
    coupleId: cache.coupleId,
    isLoggedIn: !!cache.me,
    counts: {
      photos: cache.photos.length,
      diaries: cache.diaries.length,
      messages: cache.messages.length,
      anniversaries: cache.anniversaries.length,
      wishes: cache.wishes.length,
      places: cache.places.length,
      complaints: cache.complaints.length,
    },
  };
}
