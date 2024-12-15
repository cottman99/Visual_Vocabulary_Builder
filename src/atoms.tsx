// Copyright 2024 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  colors,
  defaultPromptParts,
  defaultPrompts,
  imageOptions,
  modelOptions,
} from "./consts";
import { BoundingBox2DType, BoundingBox3DType, DetectTypes } from "./Types";

// 标注数据结构
export interface Label {
  id: string;
  box_2d: number[] | null;
  english: string;
  chinese: string;
  phonetic: string;
  style: {
    borderColor: string;
    textColor: string;
    shadingColor: string;
  };
  originalImageSize: {
    width: number;
    height: number;
  };
}

// 基础状态
export const ImageSrcAtom = atom<string | null>(null);
export const LabelsAtom = atom<Label[]>([]);
export const SelectedLabelAtom = atom<Label | null>(null);

// 样式设置
export const StyleSettingsAtom = atom({
  borderColor: '#FF9800',
  textColor: '#000000',
  shadingColor: '#FFFFFF80'
});

// 提示词设置
export interface PromptSettings {
  customPrompt: string;
  labelPrompt: string;
  detectLimit: number;
  includeBoundingBox: boolean;
  showRawPrompt: boolean;
  temperature: number;
}

export const PromptSettingsAtom = atom<PromptSettings>({
  showRawPrompt: false,
  temperature: 0.5,
  detectLimit: 20,
  outputFormat: 'json',
  labelLanguage: 'chinese',
  includeBoundingBox: true,
  customPrompt: ''
});

// 导出设置
export const ExportSettingsAtom = atom({
  includeImage: true,
  format: 'json' as 'json' | 'csv'
});

export const ImageSentAtom = atom(false);

export const BoundingBoxes2DAtom = atom<BoundingBox2DType[]>([]);

export const PromptsAtom = atom<Record<DetectTypes, string[]>>({
  ...defaultPromptParts,
});
export const CustomPromptsAtom = atom<Record<DetectTypes, string>>({
  ...defaultPrompts,
});

export type PointingType = {
  point: {
    x: number;
    y: number;
  };
  label: string;
};

export const RevealOnHoverModeAtom = atom<boolean>(true);

export const FOVAtom = atom<number>(60);

export const BoundingBoxes3DAtom = atom<BoundingBox3DType[]>([]);

export const PointsAtom = atom<PointingType[]>([]);

// export const PromptAtom = atom<string>("main objects");

export const TemperatureAtom = atom<number>(0.5);

export const ShareStream = atom<MediaStream | null>(null);

export const DrawModeAtom = atom<boolean>(false);

export const DetectTypeAtom = atom<DetectTypes>("2D bounding boxes");

export const ModelSelectedAtom = atom<string>(modelOptions[0]);

export const LinesAtom = atom<[[number, number][], string][]>([]);

export const JsonModeAtom = atom(false);

export const ActiveColorAtom = atom(colors[6]);

export const HoverEnteredAtom = atom(false);

export const HoveredBoxAtom = atom<number | null>(null);

export const VideoRefAtom = atom<{ current: HTMLVideoElement | null }>({
  current: null,
});

export const InitFinishedAtom = atom(false);

export const BumpSessionAtom = atom(0);

export const IsUploadedImageAtom = atom(false);

export const ShowConfigAtom = atom(true);

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description?: string;
}

// 预定义的提示词模板
const defaultTemplates: PromptTemplate[] = [
  {
    id: 'basic',
    name: '基础识别',
    template: 'Identify objects in this image and provide their English names, Chinese translations, and phonetic symbols.',
    description: '识别图片中的物体并提供英文名称、中文翻译和音标'
  },
  {
    id: 'detailed',
    name: '详细描述',
    template: 'Analyze this image in detail. For each visible object:\n1. English name\n2. Chinese translation\n3. IPA phonetic transcription\n4. Brief usage example',
    description: '详细分析图片中的物体，包括用法示例'
  },
  {
    id: 'educational',
    name: '教育场景',
    template: 'Identify educational elements in this image. For each item:\n1. English term\n2. Chinese equivalent\n3. Pronunciation guide\n4. Educational context',
    description: '识别教育相关的元素并提供教学上下文'
  }
];

export const PromptTemplatesAtom = atom<PromptTemplate[]>(defaultTemplates);
export const SelectedTemplateAtom = atom<string>('basic');
