// ── Pulse by Xapto Studio ── Type Definitions ──

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  companyName: string;
  companyUrl?: string;
  companyDescription?: string;
  industry?: string;
  products?: string;
  brandTone?: string;
  targetAudience?: string;
  uniqueSellingPoint?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Idea {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  description: string;
  type: 'ig_post';
  status: 'saved' | 'used' | 'pinned';
  isPinned: boolean;
  sourceText: string;
  tone: Tone;
  length: ContentLength;
  angle: PostAngle;
  createdAt: Date;
  sortOrder?: number;
}

export interface ApiSettings {
  userId: string;
  selectedProvider: AIProvider;
  selectedModel: string;
  updatedAt: Date;
}

// ── Generation Options ──

export type Tone = '專業' | '親切' | '幽默' | '激勵' | '教育' | '大膽';
export type ContentLength = '短' | '中' | '長';
export type PostAngle = '教育' | '娛樂' | '故事' | '提問' | '清單' | '產品' | '社會證明';
export type GenerationCount = 3 | 5 | 10;

export interface GenerationOptions {
  tone: Tone;
  length: ContentLength;
  angle: PostAngle;
  count: GenerationCount;
}

export const TONE_OPTIONS: Tone[] = ['專業', '親切', '幽默', '激勵', '教育', '大膽'];
export const LENGTH_OPTIONS: ContentLength[] = ['短', '中', '長'];
export const ANGLE_OPTIONS: PostAngle[] = ['教育', '娛樂', '故事', '提問', '清單', '產品', '社會證明'];
export const COUNT_OPTIONS: GenerationCount[] = [3, 5, 10];

export const LENGTH_LABELS: Record<ContentLength, string> = {
  '短': '短（1-2 句）',
  '中': '中（3-5 句）',
  '長': '長（5-8 句）',
};

// ── AI Providers ──

export type AIProvider =
  | 'Anthropic Claude'
  | 'OpenAI'
  | 'Google Gemini'
  | 'DeepSeek'
  | 'xAI Grok'
  | 'Mistral AI'
  | 'Together AI'
  | '阿里 Qwen'
  | 'Perplexity Sonar'
  | 'Groq';

export interface AIProviderConfig {
  name: AIProvider;
  models: string[];
  defaultModel: string;
  apiKeyLabel: string;
  baseURL: string;
}

// ── View Mode ──

export type ViewMode = 'generate' | 'library';

// ── Idea Filter ──

export type IdeaFilter = '全部' | '未使用' | '已使用' | '已釘選';
