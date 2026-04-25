// 情话模板库（不依赖外部 API，纯本地随机组合）
const zhTemplates = [
  "今天的风很温柔，像{name}的眼神。",
  "时间一秒一秒走过，每一秒都更喜欢{name}一点点。",
  "{name}是我所有平凡日子里最不平凡的浪漫。",
  "宇宙浩瀚，能遇见{name}是我最大的运气。",
  "想把世界上所有的好都打包送给{name}。",
  "{name}是我的春日，是我的整个夏天，是我所有季节。",
  "每一颗星星，都是我对{name}没说出口的想念。",
  "今晚的月亮很美，像{name}笑起来的样子。",
  "我喜欢{name}的喜欢，也喜欢{name}的不喜欢。",
  "{name}走过的每一条路，都开满了我对{name}的喜欢。",
  "想用一辈子的时间，认真把{name}爱完。",
  "在认识{name}之前，我以为我会一直一个人。",
  "{name}是我心里小心翼翼藏起来的糖。",
  "想把今天的云、今天的风、今天的我，都送给{name}。",
  "我喜欢{name}这件事，比天上的星星还要确定。",
  "如果世界要毁灭了，我希望最后一秒能和{name}在一起。",
  "今天也是被{name}治愈的一天。",
  "{name}笑的时候，全世界都在发光。",
  "想当{name}的小狗，被{name}牵着走。",
  "见到{name}的那一刻，我就知道，是{name}了。",
  "{name}是我所有动词的宾语：想、念、爱、抱、亲。",
  "每一阵风都说，要替我去找{name}。",
  "我的好运用完了所有，最后变成了{name}。",
  "想和{name}一起做的事还有很多很多。",
  "{name}是我藏在心里最软的那一块。",
];

const enTemplates = [
  "The breeze today is gentle, like {name}'s eyes.",
  "Every second I love {name} a little more.",
  "{name} is the most extraordinary thing in my ordinary days.",
  "Of all the lucky things in the universe, meeting {name} is the luckiest.",
  "I want to wrap all the good in the world and gift it to {name}.",
  "{name} is my spring, my whole summer, all my seasons.",
  "Every star is a thought of {name} I never said out loud.",
  "Tonight's moon is beautiful, like {name}'s smile.",
  "I love {name}'s loves, and I love {name}'s dislikes too.",
  "Every road {name} walked is now blooming with my love.",
  "I want to spend a lifetime loving {name} properly.",
  "Before I met {name}, I thought I'd be alone forever.",
  "{name} is the candy I hide carefully in my heart.",
  "Today's clouds, today's wind, today's me — all for {name}.",
  "Liking {name} is more certain than the stars in the sky.",
  "If the world were to end, I'd want my last second with {name}.",
  "Today was healed by {name} again.",
  "When {name} smiles, the whole world glows.",
  "I want to be {name}'s puppy, walked by {name}.",
  "The moment I saw {name}, I knew — it's {name}.",
  "{name} is the object of all my verbs: think, miss, love, hold, kiss.",
  "Every wind whispers — go find {name} for me.",
  "All my luck has been spent. It became {name}.",
  "There's still so much I want to do with {name}.",
  "{name} is the softest place in my heart.",
];

export function generateLoveQuote(name: string, locale: "zh" | "en" = "zh") {
  const pool = locale === "en" ? enTemplates : zhTemplates;
  const t = pool[Math.floor(Math.random() * pool.length)];
  return t.replaceAll("{name}", name);
}
