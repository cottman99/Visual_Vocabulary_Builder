import { AIService, ImageAnalysisResult, LabelInfo } from './types';

export class CustomService implements AIService {
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
    try {
      console.log('Making request to:', `${this.baseUrl}${endpoint}`);
      console.log('Request body:', JSON.stringify(body, null, 2));

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Custom API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  private cleanAndParseJSON(text: string) {
    try {
      // 1. 尝试直接解析
      return JSON.parse(text);
    } catch {
      // 2. 清理 Markdown 代码块
      const cleanText = text.replace(/```json\n|\n```|```/g, '').trim()
                           .replace(/,(\s*[}\]])/g, '$1');
      
      try {
        // 3. 尝试解析清理后的文本
        return JSON.parse(cleanText);
      } catch {
        // 4. 尝试提取 JSON 部分
        const jsonMatch = cleanText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('无法解析响应格式');
      }
    }
  }

  async analyzeImage(
    file: File,
    prompt: string,
    options: any
  ): Promise<ImageAnalysisResult[]> {
    // 将图片转换为 base64
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // 移除 data:image/* 前缀
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(file);
    });

    const systemPrompt = `Analyze the image and detect objects. For each object:
1. Provide accurate bounding box coordinates
2. Provide a clear label
Output format: JSON array where each object has "bbox" (coordinates) and "label" (text)`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Detect and label objects in this image.' },
          {
            type: 'image_url',
            image_url: {
              url: `data:${file.type};base64,${base64Image}`,
              detail: 'high'
            }
          }
        ]
      }
    ];

    try {
      const response = await this.makeRequest('/chat/completions', {
        model: this.modelName,
        messages,
        max_tokens: 4096,
        temperature: options.temperature || 0.4,
        response_format: { type: 'json_object' }
      });

      let content;
      if (typeof response.choices[0].message.content === 'string') {
        content = this.cleanAndParseJSON(response.choices[0].message.content);
      } else {
        content = response.choices[0].message.content;
      }

      // 处理不同的响应格式
      let objects = content.objects || content.items || content;
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      return objects.map((obj: any) => ({
        box_2d: obj.bbox || obj.box_2d || obj.bounding_box || null,
        label: obj.label || obj.name || obj.text || ''
      }));
    } catch (error) {
      console.error('Failed to analyze image:', error);
      throw error;
    }
  }

  async processLabel(text: string): Promise<LabelInfo> {
    const systemPrompt = `For the given item, provide:
1. Standard English name
2. Chinese translation
3. IPA phonetic transcription
Format: JSON with "english", "chinese", and "phonetic" fields`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Analyze this item: "${text}"`
      }
    ];

    try {
      const response = await this.makeRequest('/chat/completions', {
        model: this.modelName,
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      let content;
      if (typeof response.choices[0].message.content === 'string') {
        content = this.cleanAndParseJSON(response.choices[0].message.content);
      } else {
        content = response.choices[0].message.content;
      }

      return {
        english: content.english || text,
        chinese: content.chinese || text,
        phonetic: content.phonetic || ''
      };
    } catch (error) {
      console.error('Failed to process label:', error);
      return {
        english: text,
        chinese: text,
        phonetic: ''
      };
    }
  }
} 