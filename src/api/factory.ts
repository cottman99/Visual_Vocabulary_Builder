import { AIService, BaseAIConfig, AIProvider } from './types';
import { OpenAIService } from './openai';
import { GeminiService } from './gemini';
import { CustomService } from './custom';

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Map<AIProvider, AIService> = new Map();

  private constructor() {}

  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  getService(config: BaseAIConfig): AIService {
    const { provider } = config;
    
    if (this.services.has(provider)) {
      return this.services.get(provider)!;
    }

    let service: AIService;

    switch (provider) {
      case 'openai':
        service = new OpenAIService({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          modelName: config.modelName
        });
        break;

      case 'gemini':
        service = new GeminiService({
          apiKey: config.apiKey,
          modelName: config.modelName
        });
        break;

      case 'anthropic':
        // TODO: 添加 Anthropic 服务实现
        throw new Error('Anthropic service not implemented yet');

      case 'custom':
        service = new CustomService({
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          modelName: config.modelName
        });
        break;

      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }

    this.services.set(provider, service);
    return service;
  }

  clearService(provider: AIProvider) {
    this.services.delete(provider);
  }

  clearAllServices() {
    this.services.clear();
  }
} 