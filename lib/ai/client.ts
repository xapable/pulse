import type { AIProvider, GenerationOptions, Idea } from '@/types';
import { AI_PROVIDERS, getProviderConfig } from './providers';

// ── Build the system prompt (Traditional Chinese) ──
function buildPrompt(sourceText: string, options: GenerationOptions): string {
  const lengthHint =
    options.length === '短'
      ? '短=1-2句'
      : options.length === '中'
        ? '中=3-5句'
        : '長=5-8句';

  return `你係一個專業嘅社交媒體行銷專家，擅長為品牌構思 IG Post 靈感。

用戶輸入嘅公司/產品資料：
${sourceText}

生成要求：
- 語氣：${options.tone}
- 內容長度：${options.length}（${lengthHint}）
- Post 角度：${options.angle}

請嚴格按照以下 JSON 格式輸出 ${options.count} 個靈感：
[
  {
    "title": "靈感標題（繁體中文，10-15字內，吸引眼球）",
    "description": "靈感描述（繁體中文，解釋呢個 post 可以講咩、點樣講、有咩具體建議）"
  }
]

注意：
- 輸出只係純 JSON
- 靈感要具體、可行、有創意
- 唔好離題，要同用戶輸入嘅業務相關`;
}

// ── Generic OpenAI-compatible API call ──
async function callOpenAICompatible(
  baseURL: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
): Promise<{ title: string; description: string }[]> {
  const res = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你係一個專業嘅社交媒體行銷專家。請嚴格按照 JSON 格式回覆。' },
        { role: 'user', content: systemPrompt },
      ],
      temperature: 0.9,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API 錯誤 (${res.status}): ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return parseJSONResponse(content);
}

// ── Anthropic-specific API call ──
async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
): Promise<{ title: string; description: string }[]> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0.9,
      system: '你係一個專業嘅社交媒體行銷專家。請嚴格按照 JSON 格式回覆。',
      messages: [{ role: 'user', content: systemPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API 錯誤 (${res.status}): ${err}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text ?? '';
  return parseJSONResponse(content);
}

// ── Google Gemini-specific API call ──
async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
): Promise<{ title: string; description: string }[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: '你係一個專業嘅社交媒體行銷專家。請嚴格按照 JSON 格式回覆。' }],
        },
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 4096 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 錯誤 (${res.status}): ${err}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return parseJSONResponse(content);
}

// ── Parse JSON from AI response ──
function parseJSONResponse(text: string): { title: string; description: string }[] {
  // Try to extract JSON from code blocks first
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        title: item.title || '靈感',
        description: item.description || '',
      }));
    }
    return [];
  } catch {
    // Try to find any JSON array in the response
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        throw new Error('無法解析 AI 回覆，請重試');
      }
    }
    throw new Error('無法解析 AI 回覆，請重試');
  }
}

// ── Generate ideas ──
export async function generateIdeas(
  provider: AIProvider,
  model: string,
  apiKey: string,
  sourceText: string,
  options: GenerationOptions,
): Promise<{ title: string; description: string }[]> {
  const prompt = buildPrompt(sourceText, options);
  const config = getProviderConfig(provider);
  if (!config) throw new Error(`未知嘅 AI Provider: ${provider}`);

  switch (provider) {
    case 'Anthropic Claude':
      return callAnthropic(apiKey, model, prompt);
    case 'Google Gemini':
      return callGemini(apiKey, model, prompt);
    default:
      // All others use OpenAI-compatible API
      return callOpenAICompatible(config.baseURL, apiKey, model, prompt);
  }
}
