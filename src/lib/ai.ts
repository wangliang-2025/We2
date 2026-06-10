// 多 provider 的 AI 抽象层
// 支持：openai / deepseek / zhipu / kimi / qwen / custom（任何 OpenAI 兼容协议）

import { generateLoveQuote } from "./love-quotes";

type Provider = "openai" | "deepseek" | "zhipu" | "kimi" | "qwen" | "custom" | "";

const presets: Record<Exclude<Provider, "" | "custom">, { baseUrl: string; defaultModel: string }> = {
  openai: { baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  deepseek: { baseUrl: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat" },
  zhipu: { baseUrl: "https://open.bigmodel.cn/api/paas/v4", defaultModel: "glm-4-flash" },
  kimi: { baseUrl: "https://api.moonshot.cn/v1", defaultModel: "moonshot-v1-8k" },
  qwen: {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    defaultModel: "qwen-turbo",
  },
};

function getConfig() {
  const provider = (process.env.AI_PROVIDER || "") as Provider;
  const apiKey = process.env.AI_API_KEY || "";
  if (!provider || !apiKey) return null;

  let baseUrl = process.env.AI_BASE_URL;
  let model = process.env.AI_MODEL;

  if (provider !== "custom" && presets[provider]) {
    baseUrl = baseUrl || presets[provider].baseUrl;
    model = model || presets[provider].defaultModel;
  }

  if (!baseUrl) return null;
  if (!model) model = "gpt-4o-mini";

  return { provider, apiKey, baseUrl, model };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chatComplete(messages: ChatMessage[], opts: { temperature?: number; maxTokens?: number } = {}) {
  const cfg = getConfig();
  if (!cfg) {
    return { ok: false as const, error: "AI 未配置（请在 .env 设置 AI_PROVIDER 和 AI_API_KEY）" };
  }

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: opts.temperature ?? 0.9,
        max_tokens: opts.maxTokens ?? 200,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false as const, error: `AI 调用失败 (${res.status}): ${errText.slice(0, 200)}` };
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    return { ok: true as const, content: content || "" };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// 情话生成 - 优先用 AI，没配就 fallback 到本地模板
export async function generateAILoveQuote(
  yourName: string,
  theirName: string,
  locale: "zh" | "en" = "zh"
): Promise<{ source: "ai" | "local"; content: string }> {
  const cfg = getConfig();
  if (!cfg) {
    return { source: "local", content: generateLoveQuote(theirName, locale) };
  }

  const sysZh = `你是一个温柔浪漫的情话创作者。给"${yourName}"写一句送给恋人"${theirName}"的情话。要求：
- 中文，1-2 句，30 字以内
- 真挚、有画面感、不油腻
- 必须自然地包含恋人的名字"${theirName}"
- 直接输出情话本身，不要加引号、不要加前缀`;

  const sysEn = `You are a gentle romantic love-line writer. Write one sweet message from "${yourName}" to their lover "${theirName}". Requirements:
- English, 1-2 sentences, under 30 words
- Heartfelt, evocative, never cheesy
- Must naturally include the lover's name "${theirName}"
- Output the line directly, no quotes, no prefix`;

  const result = await chatComplete([
    { role: "system", content: locale === "zh" ? sysZh : sysEn },
    { role: "user", content: locale === "zh" ? "写一句情话" : "Write one love line" },
  ], { temperature: 1.0, maxTokens: 100 });

  if (!result.ok || !result.content) {
    return { source: "local", content: generateLoveQuote(theirName, locale) };
  }
  return { source: "ai", content: result.content };
}

export function aiConfigured() {
  return getConfig() !== null;
}
