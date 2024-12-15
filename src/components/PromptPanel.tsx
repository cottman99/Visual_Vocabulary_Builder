import { useAtom } from 'jotai';
import { ImageSrcAtom, LabelsAtom, PromptSettingsAtom } from '../atoms';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { AIServiceFactory } from '../api/factory';
import { AIProvider } from '../api/types';

export function PromptPanel() {
  const [settings, setSettings] = useAtom(PromptSettingsAtom);
  const [imageSrc, setImageSrc] = useAtom(ImageSrcAtom);
  const [labels, setLabels] = useAtom(LabelsAtom);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(
    (import.meta.env.VITE_DEFAULT_AI_PROVIDER as AIProvider) || 'gemini'
  );

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setLabels([]); // 清除之前的标签
    }
  };

  // 处理发送请求
  const handleSend = async () => {
    if (!selectedFile) {
      toast.error('请先上传图片');
      return;
    }

    setIsAnalyzing(true);
    try {
      // 获取对应的 AI 服务
      const factory = AIServiceFactory.getInstance();
      const service = factory.getService({
        provider: selectedProvider,
        apiKey: getApiKey(selectedProvider),
        baseUrl: getBaseUrl(selectedProvider),
        modelName: getModelName(selectedProvider)
      });

      // 分析图片
      const result = await service.analyzeImage(selectedFile, settings.customPrompt, settings);
      
      // 处理每个标签的文本
      const processedItems = await Promise.all(
        result.map(async (item, index) => {
          const labelInfo = await service.processLabel(item.label);
          // API 返回的是 [ymin, xmin, ymax, xmax] 格式
          const [ymin, xmin, ymax, xmax] = item.box_2d || [0, 0, 0, 0];
          return {
            id: `label-${index}`,
            box_2d: item.box_2d ? [ymin, xmin, ymax, xmax] : null,  // 保持原始格式
            ...labelInfo,
            style: {
              borderColor: '#FF9800',
              textColor: '#000000',
              shadingColor: '#FFFFFF'
            },
            originalImageSize: {
              width: 1000,  // 使用 Gemini 的标准化空间
              height: 1000
            }
          };
        })
      );

      setLabels(processedItems);
      toast.success('分析完成');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 获取 API 密钥
  const getApiKey = (provider: AIProvider): string => {
    switch (provider) {
      case 'gemini':
        return import.meta.env.VITE_GEMINI_API_KEY;
      case 'openai':
        return import.meta.env.VITE_OPENAI_API_KEY;
      case 'anthropic':
        return import.meta.env.VITE_ANTHROPIC_API_KEY;
      case 'custom':
        return import.meta.env.VITE_CUSTOM_API_KEY;
      default:
        return '';
    }
  };

  // 获取基础 URL
  const getBaseUrl = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return import.meta.env.VITE_OPENAI_BASE_URL;
      case 'anthropic':
        return import.meta.env.VITE_ANTHROPIC_BASE_URL;
      case 'custom':
        return import.meta.env.VITE_CUSTOM_BASE_URL;
      default:
        return '';
    }
  };

  // 获取模型名称
  const getModelName = (provider: AIProvider): string => {
    switch (provider) {
      case 'custom':
        return import.meta.env.VITE_CUSTOM_MODEL_NAME;
      default:
        return '';
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="space-y-4">
        {/* AI 提供商选择 */}
        <div className="flex items-center space-x-4">
          <label className="text-sm">AI 提供商：</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
            className="bg-gray-700 rounded px-2 py-1"
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        {/* 文件上传和操作按钮 */}
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md"
          >
            上传图片
          </button>
          <button
            onClick={handleSend}
            className={`px-4 py-2 rounded-md flex items-center justify-center min-w-[100px] ${
              isAnalyzing 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={!selectedFile || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </>
            ) : '发送分析'}
          </button>
        </div>

        {/* 检测设置 */}
        <div className="flex items-center space-x-4">
          <label className="text-sm">
            显示以下物品位置：
          </label>
          <input
            type="text"
            className="bg-gray-700 rounded px-2 py-1 flex-1"
            placeholder="输入检测目标"
            value={settings.customPrompt}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              customPrompt: e.target.value
            }))}
          />
        </div>

        {/* 标签提示 */}
        <div className="flex items-center space-x-4">
          <label className="text-sm">
            Label each one with: (optional)
          </label>
          <input
            type="text"
            className="bg-gray-700 rounded px-2 py-1 flex-1"
            placeholder="e.g., English name, Chinese translation, and phonetic symbols"
            value={settings.labelPrompt}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              labelPrompt: e.target.value
            }))}
          />
        </div>

        {/* 控制选项 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.showRawPrompt}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  showRawPrompt: e.target.checked
                }))}
              />
              <span className="text-sm">显示原始提示词</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm">温度：</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                temperature: parseFloat(e.target.value)
              }))}
              className="w-24"
            />
            <span>{settings.temperature}</span>
          </div>
        </div>

        {/* 显示原始提示词 */}
        {settings.showRawPrompt && (
          <div className="mt-4 p-2 bg-gray-800 rounded">
            <pre className="text-xs text-gray-400 whitespace-pre-wrap">
              {`Detect items, with no more than ${settings.detectLimit} items. Output a json list where each entry contains the${settings.includeBoundingBox ? ' 2D bounding box in "box_2d" and' : ''} label.${settings.labelPrompt ? `\nFor each item: ${settings.labelPrompt}` : ''}${settings.customPrompt ? '\n' + settings.customPrompt : ''}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 