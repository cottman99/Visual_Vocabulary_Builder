import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIService, ImageAnalysisResult, LabelInfo } from './types';

export class GeminiService implements AIService {
  private genAI: GoogleGenerativeAI;
  private visionModel: any;
  private textModel: any;

  constructor(config: {
    apiKey: string;
    modelName?: string;
  }) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    
    this.visionModel = this.genAI.getGenerativeModel({
      model: config.modelName || "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      },
    });

    this.textModel = this.genAI.getGenerativeModel({
      model: config.modelName || "gemini-1.5-pro"
    });
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private normalizeBox(box: any): { x1: number; y1: number; x2: number; y2: number } {
    if (Array.isArray(box)) {
      return {
        x1: Number(box[0]),
        y1: Number(box[1]),
        x2: Number(box[2]),
        y2: Number(box[3])
      };
    }
    
    if ('ymin' in box && 'xmin' in box) {
      return {
        x1: Number(box.xmin),
        y1: Number(box.ymin),
        x2: Number(box.xmax),
        y2: Number(box.ymax)
      };
    }
    
    if ('x1' in box && 'y1' in box) {
      return {
        x1: Number(box.x1),
        y1: Number(box.y1),
        x2: Number(box.x2),
        y2: Number(box.y2)
      };
    }
    
    return {
      x1: 0,
      y1: 0,
      x2: 1000,
      y2: 1000
    };
  }

  private cleanAndParseJSON(text: string) {
    try {
      return JSON.parse(text);
    } catch {
      const cleanText = text.replace(/```json\n|\n```|```/g, '').trim()
                           .replace(/,(\s*[}\]])/g, '$1');
      
      try {
        return JSON.parse(cleanText);
      } catch {
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
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    console.log('Original image dimensions:', { originalWidth, originalHeight });
    URL.revokeObjectURL(imageUrl);

    const basePrompt = `Detect items, with no more than ${options.detectLimit} items. For each item, provide:
1. A bounding box in [x1, y1, x2, y2] format, with coordinates in range [0-1000]
2. A clear label
Output format: JSON array where each object has "box_2d" (coordinates object with x1,y1,x2,y2) and "label" (text)`;

    const finalPrompt = prompt ? `${basePrompt}\n${prompt}` : basePrompt;

    const imageData = await file.arrayBuffer();
    const parts = [
      { text: finalPrompt },
      {
        inlineData: {
          data: this.arrayBufferToBase64(imageData),
          mimeType: file.type
        }
      }
    ];

    const result = await this.visionModel.generateContent(parts);
    const response = await result.response;
    const text = await response.text();
    
    const jsonResponse = this.cleanAndParseJSON(text);
    const items = Array.isArray(jsonResponse) ? jsonResponse : [jsonResponse];
    
    return items.map(item => {
      if (!item.box_2d) {
        return {
          box_2d: null,
          label: item.label
        };
      }

      const box = this.normalizeBox(item.box_2d);
      
      // 确保坐标在 [0, 1000] 范围内
      box.x1 = Math.max(0, Math.min(1000, box.x1));
      box.y1 = Math.max(0, Math.min(1000, box.y1));
      box.x2 = Math.max(0, Math.min(1000, box.x2));
      box.y2 = Math.max(0, Math.min(1000, box.y2));

      return {
        box_2d: box,
        label: item.label
      };
    });
  }

  async processLabel(text: string): Promise<LabelInfo> {
    const prompt = `Analyze the following item: "${text}"

Instructions:
1. Provide the standard English name
2. Provide the Chinese translation
3. Provide the IPA phonetic transcription

Requirements:
- Keep the English name simple and commonly used
- Use standard Mandarin Chinese for translation
- Use standard IPA symbols for phonetic transcription
- Return ONLY the JSON response in the following format:

{
  "english": "exact English name",
  "chinese": "准确的中文翻译",
  "phonetic": "IPA音标"
}`;

    try {
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const jsonText = await response.text();
      
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      const cleanJsonText = jsonMatch ? jsonMatch[0] : jsonText;
      
      const parsed = JSON.parse(cleanJsonText);
      
      return {
        english: parsed.english || text,
        chinese: parsed.chinese || text,
        phonetic: parsed.phonetic || ''
      };
    } catch (error) {
      console.error('Error processing label text:', error);
      return {
        english: text,
        chinese: text,
        phonetic: ''
      };
    }
  }
} 