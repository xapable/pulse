import { NextRequest, NextResponse } from 'next/server';

// ── Analysis result type ──
interface AnalysisResult {
  companyDescription?: string;
  industry?: string;
  products?: string;
  brandTone?: string;
  targetAudience?: string;
  uniqueSellingPoint?: string;
}

// ── Normalize: AI might return array instead of string ──
function safeString(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed && trimmed !== '無法判斷' ? trimmed : undefined;
  }
  if (Array.isArray(val)) {
    const joined = val.filter(Boolean).join('、');
    return joined || undefined;
  }
  return undefined;
}

// ── Fetch website HTML as text ──
async function fetchWebsiteContent(url: string): Promise<string> {
  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; PulseBot/1.0; +https://pulse.xapto.studio)',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: 無法存取網站`);
    }

    const html = await res.text();

    // Strip HTML tags, scripts, styles
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 10000);
  } finally {
    clearTimeout(timeout);
  }
}

// ── Call DeepSeek API ──
async function analyzeWithDeepSeek(
  url: string,
  content: string,
  apiKey: string,
): Promise<AnalysisResult> {
  const prompt = `你係一個專業嘅行銷分析師。請分析以下公司網站嘅內容，並以 JSON 格式輸出：

網站 URL：${url}
網站內容：${content}

請輸出以下欄位（全部用繁體中文）：
{
  "companyDescription": "公司簡介（兩至三句，概括公司業務）",
  "industry": "行業類別（從以下揀一個：零售、餐飲、服務、科技、文創、教育、健康、美容、其他）",
  "products": "主要產品或服務（列出 3-5 項，用純文字，唔好用 array）",
  "brandTone": "品牌語氣（從以下揀一個：專業、親切、幽默、激勵、教育、大膽、簡約、溫暖）",
  "targetAudience": "目標客群（描述邊啲人會買）",
  "uniqueSellingPoint": "獨特賣點（同競爭對手有咩唔同）"
}

如果網站內容唔夠判斷，就填「無法判斷」。
請只輸出純 JSON，唔好有其他文字。`;

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你係一個專業嘅行銷分析師。請嚴格按照 JSON 格式回覆。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 錯誤 (${res.status}): ${err}`);
  }

  const data = await res.json();
  const rawContent = data.choices?.[0]?.message?.content ?? '';

  // Parse JSON from response
  const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      companyDescription: safeString(parsed.companyDescription),
      industry: safeString(parsed.industry),
      products: safeString(parsed.products),
      brandTone: safeString(parsed.brandTone),
      targetAudience: safeString(parsed.targetAudience),
      uniqueSellingPoint: safeString(parsed.uniqueSellingPoint),
    };
  } catch {
    const arrayMatch = rawContent.match(/\{[\s\S]*\}/);
    if (arrayMatch) {
      const parsed = JSON.parse(arrayMatch[0]);
      return {
        companyDescription: safeString(parsed.companyDescription),
        industry: safeString(parsed.industry),
        products: safeString(parsed.products),
        brandTone: safeString(parsed.brandTone),
        targetAudience: safeString(parsed.targetAudience),
        uniqueSellingPoint: safeString(parsed.uniqueSellingPoint),
      };
    }
    throw new Error('無法解析 AI 回覆');
  }
}

// ── POST handler ──
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, apiKey } = body;

    if (!url) {
      return NextResponse.json({ error: '請提供網站 URL' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '請先喺設定頁面設定 DeepSeek API Key' }, { status: 400 });
    }

    // Fetch website
    let content: string;
    try {
      content = await fetchWebsiteContent(url);
    } catch {
      return NextResponse.json(
        { error: '無法存取網站，請檢查 URL 是否正確' },
        { status: 422 },
      );
    }

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: '網站內容太少，無法分析' },
        { status: 422 },
      );
    }

    // Analyze
    const result = await analyzeWithDeepSeek(url, content, apiKey);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('分析錯誤:', err);
    return NextResponse.json(
      { error: err.message || '分析失敗，請重試' },
      { status: 500 },
    );
  }
}
