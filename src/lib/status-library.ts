// 像天气一样的心情状态库（适合显示在头像顶上）
export type StatusItem = {
  id: string;
  emoji: string;
  zh: string;
  en: string;
  color: string;
  bgGradient: string;
};

export const statusLibrary: StatusItem[] = [
  // 天气系（情绪天气）
  { id: "sunny", emoji: "☀️", zh: "晴朗", en: "Sunny", color: "#F59E0B", bgGradient: "from-amber-200 to-yellow-300" },
  { id: "cloudy", emoji: "⛅", zh: "多云", en: "Cloudy", color: "#94A3B8", bgGradient: "from-slate-200 to-zinc-300" },
  { id: "rainy", emoji: "🌧️", zh: "下雨", en: "Rainy", color: "#0EA5E9", bgGradient: "from-sky-200 to-blue-300" },
  { id: "thunder", emoji: "⛈️", zh: "雷阵雨", en: "Thunder", color: "#6366F1", bgGradient: "from-indigo-300 to-purple-400" },
  { id: "rainbow", emoji: "🌈", zh: "彩虹", en: "Rainbow", color: "#EC4899", bgGradient: "from-pink-200 via-purple-200 to-sky-200" },
  { id: "snow", emoji: "❄️", zh: "下雪", en: "Snowy", color: "#67E8F9", bgGradient: "from-cyan-100 to-sky-200" },
  { id: "storm", emoji: "🌪️", zh: "龙卷风", en: "Stormy", color: "#475569", bgGradient: "from-zinc-300 to-slate-400" },
  { id: "spring", emoji: "🌸", zh: "春天", en: "Springtime", color: "#F472B6", bgGradient: "from-pink-200 to-rose-300" },

  // 心情系
  { id: "happy", emoji: "😊", zh: "开心", en: "Happy", color: "#FB923C", bgGradient: "from-orange-200 to-amber-300" },
  { id: "love", emoji: "💕", zh: "想 TA", en: "Missing you", color: "#F43F5E", bgGradient: "from-rose-200 to-pink-300" },
  { id: "shy", emoji: "🥺", zh: "撒娇", en: "Pleading", color: "#FB7185", bgGradient: "from-pink-200 to-rose-300" },
  { id: "angry", emoji: "😤", zh: "生气", en: "Angry", color: "#EF4444", bgGradient: "from-red-200 to-orange-300" },
  { id: "sad", emoji: "😢", zh: "难过", en: "Sad", color: "#3B82F6", bgGradient: "from-blue-200 to-indigo-300" },
  { id: "excited", emoji: "🎉", zh: "兴奋", en: "Excited", color: "#A855F7", bgGradient: "from-purple-200 to-pink-300" },
  { id: "sick", emoji: "🤒", zh: "不舒服", en: "Sick", color: "#84CC16", bgGradient: "from-lime-200 to-green-300" },
  { id: "chill", emoji: "😎", zh: "放松", en: "Chill", color: "#06B6D4", bgGradient: "from-cyan-200 to-teal-300" },

  // 状态系（在做什么）
  { id: "sleep", emoji: "😴", zh: "想睡觉", en: "Sleepy", color: "#8B5CF6", bgGradient: "from-violet-200 to-purple-300" },
  { id: "work", emoji: "💼", zh: "工作中", en: "Working", color: "#64748B", bgGradient: "from-slate-200 to-zinc-300" },
  { id: "eat", emoji: "🍚", zh: "吃饭中", en: "Eating", color: "#F97316", bgGradient: "from-orange-200 to-amber-300" },
  { id: "study", emoji: "📚", zh: "学习中", en: "Studying", color: "#0891B2", bgGradient: "from-cyan-200 to-sky-300" },
  { id: "game", emoji: "🎮", zh: "玩游戏", en: "Gaming", color: "#10B981", bgGradient: "from-emerald-200 to-teal-300" },
  { id: "road", emoji: "🚗", zh: "在路上", en: "On the road", color: "#0D9488", bgGradient: "from-teal-200 to-cyan-300" },
  { id: "shower", emoji: "🛁", zh: "洗澡中", en: "Bathing", color: "#0284C7", bgGradient: "from-sky-200 to-blue-300" },
  { id: "music", emoji: "🎵", zh: "听歌中", en: "Music time", color: "#D946EF", bgGradient: "from-fuchsia-200 to-pink-300" },
];

export const avatarOptions = [
  "🐰", "🦁", "🐼", "🐨", "🐶", "🐱", "🐯", "🦊", "🐻", "🐷",
  "🐸", "🐵", "🦄", "🦋", "🐧", "🦔", "🐹", "🐭", "🐮", "🐔",
  "👧", "👦", "👨", "👩", "🧑", "🧒", "👶", "🤴", "👸", "🧚",
  "🧙", "🧝", "🧛", "🌟", "💎", "🌷", "🌼", "🍓", "🍑", "🥑",
];

export function getStatus(id?: string): StatusItem {
  return statusLibrary.find((s) => s.id === id) || statusLibrary[0];
}
