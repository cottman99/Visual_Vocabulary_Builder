// AI 提供商类型
export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

// 基础配置接口
export interface BaseAIConfig {
  apiKey: string;
  provider: AIProvider;
  baseUrl?: string;
  modelName?: string;
}

// 通用响应格式
export interface AIResponse {
  text: string;
  error?: string;
}

// 图像分析结果接口
export interface ImageAnalysisResult {
  box_2d: number[] | null;
  label: string;
}

// 标签信息接口
export interface LabelInfo {
  english: string;
  chinese: string;
  phonetic: string;
}

// AI 服务接口
export interface AIService {
  analyzeImage(
    file: File,
    prompt: string,
    options: any
  ): Promise<ImageAnalysisResult[]>;
  
  processLabel(
    text: string
  ): Promise<LabelInfo>;
} 