import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_DEEPSEEK_KEY = 'sk-29a8156f41694ffbbd807b9b6c65814f';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

function buildPrompt(sourceText: string, options: {
  tone: string;
  length: string;
  angle: string;
  count: number;
  postType?: string;
}): string {
  const isBlog = options.postType === 'blog';
  const lengthHint = isBlog
    ? (options.length === '短' ? '短=150-300字' : options.length === '中' ? '中=300-600字' : '長=600-1000字')
    : (options.length === '短' ? '短=1-2句' : options.length === '中' ? '中=3-5句' : '長=5-8句');

  const persona = isBlog
    ? '你係一個專業嘅內容行銷專家，擅長為品牌撰寫高質量嘅 Blog 文章'
    : '你係一個專業嘅社交媒體行銷專家，擅長為品牌構思 IG Post 靈感';

  return `${persona}。

用戶輸入嘅公司/產品資料：
${sourceText}

生成要求：
- 內容類型：${isBlog ? 'Blog 文章' : 'IG Post'}
- 語氣：${options.tone}
- 內容長度：${options.length}（${lengthHint}）
- Post 角度：${options.angle}

請嚴格按照以下 JSON 格式輸出 ${options.count} 個靈感：
[
  {
    "title": "靈感標題（繁體中文，10-20字內，吸引眼球）",
    "description": "靈感描述（繁體中文，解釋呢個內容可以講咩、點樣講、有咩具體建議、適合咩關鍵字）"
  }
]

注意：
- 輸出只係純 JSON
- 靈感要具體、可行、有創意
- 唔好離題，要同用戶輸入嘅業務相關`;
}

function parseJSONResponse(text: string): { title: string; description: string }[] {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => ({
        title: item.title || '靈感',
        description: item.description || '',
      }));
    }
    return [];
  } catch {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try { return JSON.parse(arrayMatch[0]); } catch {}
    }
    throw new Error('無法解析 AI 回覆，請重試');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceText,
      tone,
      length,
      angle,
      count,
      postType,
      userApiKey,
      userProvider,
      userModel,
    } = body;

    if (!sourceText) {
      return NextResponse.json({ error: '請提供來源文字' }, { status: 400 });
    }

    // Use user's key if provided, otherwise fall back to hardcoded key
    const apiKey = userApiKey || DEFAULT_DEEPSEEK_KEY;
    const provider = userProvider || 'DeepSeek';

    // Build prompt
    const prompt = buildPrompt(sourceText, { tone, length, angle, count, postType });

    // Only DeepSeek is supported server-side for the default key
    // If user provides their own key, they can use any provider
    let baseURL = DEEPSEEK_URL;
    let model = userModel || 'deepseek-chat';

    if (userApiKey) {
      // User key: use their provider's URL
      const providerURLs: Record<string, string> = {
        'OpenAI': 'https://api.openai.com/v1/chat/completions',
        'DeepSeek': DEEPSEEK_URL,
        'xAI Grok': 'https://api.x.ai/v1/chat/completions',
        'Mistral AI': 'https://api.mistral.ai/v1/chat/completions',
        'Together AI': 'https://api.together.xyz/v1/chat/completions',
        '阿里 Qwen': 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        'Perplexity Sonar': 'https://api.perplexity.ai/chat/completions',
        'Groq': 'https://api.groq.com/openai/v1/chat/completions',
      };
      baseURL = providerURLs[provider] || DEEPSEEK_URL;
      if (!userModel) {
        const defaultModels: Record<string, string> = {
          'OpenAI': 'gpt-4o',
          'DeepSeek': 'deepseek-chat',
          'xAI Grok': 'grok-2',
          'Mistral AI': 'mistral-large-latest',
          'Together AI': 'meta-llama/Llama-3.1-405B-Instruct-Turbo',
          '阿里 Qwen': 'qwen-max',
          'Perplexity Sonar': 'sonar',
          'Groq': 'llama-3.1-70b-versatile',
        };
        model = defaultModels[provider] || 'deepseek-chat';
      }
    }

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
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `AI API 錯誤 (${res.status}): ${err.slice(0, 200)}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const ideas = parseJSONResponse(content);

    return NextResponse.json({ success: true, ideas });
  } catch (err: any) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err.message || '生成失敗，請重試' },
      { status: 500 },
    );
  }
}
