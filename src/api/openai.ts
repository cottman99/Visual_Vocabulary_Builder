import { AIService, ImageAnalysisResult, LabelInfo } from './types';

export class OpenAIService implements AIService {
  private apiKey: string;
  private baseUrl: string;
  private modelName: string;

  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    modelName?: string;
  }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.modelName = config.modelName || 'gpt-4-vision-preview';
  }

  private async makeRequest(endpoint: string, body: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return response.json();
  }

  async analyzeImage(
    file: File,
    prompt: string,
    options: any
  ): Promise<ImageAnalysisResult[]> {
    // 将图片转换为 base64
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: base64Image,
              detail: 'high'
            }
          }
        ]
      }
    ];

    const response = await this.makeRequest('/chat/completions', {
      model: this.modelName,
      messages,
      max_tokens: 4096,
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    try {
      const content = JSON.parse(response.choices[0].message.content);
      return content.objects.map((obj: any) => ({
        box_2d: obj.bbox || null,
        label: obj.label
      }));
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw error;
    }
  }

  async processLabel(text: string): Promise<LabelInfo> {
    const messages = [
      {
        role: 'user',
        content: `Analyze the following item: "${text}"
Please provide:
1. Standard English name
2. Chinese translation
3. IPA phonetic transcription

Return the response in JSON format:
{
  "english": "exact English name",
  "chinese": "准确的中文翻译",
  "phonetic": "IPA音标"
}`
      }
    ];

    const response = await this.makeRequest('/chat/completions', {
      model: 'gpt-4',
      messages,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    try {
      const content = JSON.parse(response.choices[0].message.content);
      return {
        english: content.english || text,
        chinese: content.chinese || text,
        phonetic: content.phonetic || ''
      };
    } catch (error) {
      console.error('Failed to parse OpenAI label response:', error);
      return {
        english: text,
        chinese: text,
        phonetic: ''
      };
    }
  }
} 