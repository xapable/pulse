import type { AIProvider, AIProviderConfig } from '@/types';

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    name: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiKeyLabel: 'ANTHROPIC_API_KEY',
    baseURL: 'https://api.anthropic.com/v1/messages',
  },
  {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
    defaultModel: 'gpt-4o',
    apiKeyLabel: 'OPENAI_API_KEY',
    baseURL: 'https://api.openai.com/v1/chat/completions',
  },
  {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash',
    apiKeyLabel: 'GOOGLE_API_KEY',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  {
    name: 'DeepSeek',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    apiKeyLabel: 'DEEPSEEK_API_KEY',
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
  },
  {
    name: 'xAI Grok',
    models: ['grok-2', 'grok-2-vision'],
    defaultModel: 'grok-2',
    apiKeyLabel: 'XAI_API_KEY',
    baseURL: 'https://api.x.ai/v1/chat/completions',
  },
  {
    name: 'Mistral AI',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
    defaultModel: 'mistral-large-latest',
    apiKeyLabel: 'MISTRAL_API_KEY',
    baseURL: 'https://api.mistral.ai/v1/chat/completions',
  },
  {
    name: 'Together AI',
    models: ['meta-llama/Llama-3.1-405B-Instruct-Turbo', 'meta-llama/Llama-3.1-70B-Instruct-Turbo', 'Qwen/Qwen2.5-72B-Instruct-Turbo'],
    defaultModel: 'meta-llama/Llama-3.1-405B-Instruct-Turbo',
    apiKeyLabel: 'TOGETHER_API_KEY',
    baseURL: 'https://api.together.xyz/v1/chat/completions',
  },
  {
    name: '阿里 Qwen',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    defaultModel: 'qwen-max',
    apiKeyLabel: 'QWEN_API_KEY',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },
  {
    name: 'Perplexity Sonar',
    models: ['sonar', 'sonar-pro', 'sonar-reasoning'],
    defaultModel: 'sonar',
    apiKeyLabel: 'PERPLEXITY_API_KEY',
    baseURL: 'https://api.perplexity.ai/chat/completions',
  },
  {
    name: 'Groq',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    defaultModel: 'llama-3.1-70b-versatile',
    apiKeyLabel: 'GROQ_API_KEY',
    baseURL: 'https://api.groq.com/openai/v1/chat/completions',
  },
];

export function getProviderConfig(name: AIProvider): AIProviderConfig | undefined {
  return AI_PROVIDERS.find((p) => p.name === name);
}
