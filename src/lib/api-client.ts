// 统一的 API 客户端 - 所有调用都走这里
type ApiResp<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) };
  if (opts.method && opts.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, {
    credentials: "include",
    headers,
    ...opts,
  });
  const json: ApiResp<T> = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

async function requestForm<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const json: ApiResp<T> = await res.json();
  if (!json.ok) throw new Error(json.error);
  return json.data;
}

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  status: string;
  statusText?: string | null;
  statusUpdatedAt?: string | null;
  role: "you" | "them";
  serverChanKey?: string | null;
  enabledNotifs?: string | null;
};

export type ApiCouple = {
  id: string;
  inviteCode: string;
  startDate: string;
  cityA: string;
  cityB: string;
  secret?: string | null;
};

export type Me = {
  me: ApiUser;
  partner: ApiUser | null;
  couple: ApiCouple;
};

export const api = {
  // ===== Auth =====
  register: (data: {
    email: string;
    password: string;
    name: string;
    startDate?: string;
    cityA?: string;
    cityB?: string;
  }) =>
    request<{ user: { id: string; name: string }; couple: { id: string; inviteCode: string } }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(data) }
    ),

  login: (email: string, password: string) =>
    request<{ user: { id: string; name: string } }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  join: (data: { inviteCode: string; email: string; password: string; name: string }) =>
    request<{ user: { id: string; name: string }; couple: { id: string } }>(
      "/api/auth/join",
      { method: "POST", body: JSON.stringify(data) }
    ),

  me: () => request<Me>("/api/auth/me"),

  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  // ===== Profile =====
  patchProfile: (patch: Record<string, unknown>) =>
    request<{ ok: true }>("/api/profile", { method: "PATCH", body: JSON.stringify(patch) }),

  // ===== Photos =====
  listPhotos: () => request<unknown[]>("/api/photos"),
  addPhoto: (data: { url: string; thumbnail?: string; caption?: string; location?: string }) =>
    request<unknown>("/api/photos", { method: "POST", body: JSON.stringify(data) }),
  patchPhoto: (id: string, data: { caption?: string; location?: string }) =>
    request<unknown>(`/api/photos/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  removePhoto: (id: string) => request<unknown>(`/api/photos/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return requestForm<{ url: string; thumbnail: string; width: number; height: number }>(
      "/api/upload",
      fd
    );
  },

  // ===== Diaries =====
  listDiaries: () => request<unknown[]>("/api/diaries"),
  addDiary: (data: Record<string, unknown>) =>
    request<unknown>("/api/diaries", { method: "POST", body: JSON.stringify(data) }),
  removeDiary: (id: string) => request<unknown>(`/api/diaries/${id}`, { method: "DELETE" }),

  // ===== Messages =====
  listMessages: (since?: string) =>
    request<unknown[]>("/api/messages" + (since ? `?since=${encodeURIComponent(since)}` : "")),
  addMessage: (data: Record<string, unknown>) =>
    request<unknown>("/api/messages", { method: "POST", body: JSON.stringify(data) }),
  clearMessages: () => request<unknown>("/api/messages", { method: "DELETE" }),

  // ===== Bottles =====
  addBottle: (text: string) =>
    request<{ created: unknown }>("/api/bottles", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  pickBottle: () =>
    request<{ picked: unknown | null }>("/api/bottles", {
      method: "POST",
      body: JSON.stringify({ action: "pick" }),
    }),

  // ===== Anniversaries =====
  listAnniversaries: () => request<unknown[]>("/api/anniversaries"),
  addAnniversary: (data: Record<string, unknown>) =>
    request<unknown>("/api/anniversaries", { method: "POST", body: JSON.stringify(data) }),
  removeAnniversary: (id: string) =>
    request<unknown>(`/api/anniversaries/${id}`, { method: "DELETE" }),

  // ===== Wishes =====
  listWishes: () => request<unknown[]>("/api/wishes"),
  addWish: (data: Record<string, unknown>) =>
    request<unknown>("/api/wishes", { method: "POST", body: JSON.stringify(data) }),
  toggleWish: (id: string) => request<unknown>(`/api/wishes/${id}`, { method: "PATCH" }),
  removeWish: (id: string) => request<unknown>(`/api/wishes/${id}`, { method: "DELETE" }),

  // ===== Places =====
  listPlaces: () => request<unknown[]>("/api/places"),
  addPlace: (data: Record<string, unknown>) =>
    request<unknown>("/api/places", { method: "POST", body: JSON.stringify(data) }),
  removePlace: (id: string) => request<unknown>(`/api/places/${id}`, { method: "DELETE" }),

  // ===== Moods =====
  listMoods: () => request<unknown[]>("/api/moods"),
  setMood: (date: string, patch: { mood?: number; yourMood?: number; theirMood?: number; note?: string }) =>
    request<unknown>("/api/moods", {
      method: "POST",
      body: JSON.stringify({ date, ...patch }),
    }),

  // ===== Complaints =====
  listComplaints: () => request<unknown[]>("/api/complaints"),
  addComplaint: (data: Record<string, unknown>) =>
    request<unknown>("/api/complaints", { method: "POST", body: JSON.stringify(data) }),
  hammerComplaint: (id: string) =>
    request<unknown>(`/api/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "hammer" }),
    }),
  apologizeComplaint: (id: string, apology: string) =>
    request<unknown>(`/api/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ action: "apologize", apology }),
    }),
  removeComplaint: (id: string) => request<unknown>(`/api/complaints/${id}`, { method: "DELETE" }),

  // ===== Notify =====
  testNotify: () =>
    request<{ ok: boolean; message?: string; error?: string }>("/api/notify/test", {
      method: "POST",
    }),

  // ===== AI =====
  aiLoveQuote: (locale: "zh" | "en" = "zh") =>
    request<{ source: "ai" | "local"; content: string }>(`/api/ai/love-quote?locale=${locale}`),
  aiApology: (complaint: string) =>
    request<{ source: "ai" | "fallback"; content: string }>("/api/ai/apology", {
      method: "POST",
      body: JSON.stringify({ complaint }),
    }),
};
