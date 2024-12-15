import { useAtom } from 'jotai';
import { SelectedLabelAtom, StyleSettingsAtom, LabelsAtom } from '../atoms';
import { ColorPicker } from './ColorPicker';

export function LabelEditor() {
  const [selectedLabel, setSelectedLabel] = useAtom(SelectedLabelAtom);
  const [styleSettings, setStyleSettings] = useAtom(StyleSettingsAtom);
  const [labels, setLabels] = useAtom(LabelsAtom);

  const handleLabelChange = (field: 'english' | 'phonetic' | 'chinese', value: string) => {
    if (selectedLabel) {
      setLabels(prev => prev.map(label =>
        label.id === selectedLabel.id
          ? { ...label, [field]: value }
          : label
      ));
      setSelectedLabel(prev => prev ? { ...prev, [field]: value } : prev);
    }
  };

  const handleStyleChange = (field: 'borderColor' | 'textColor' | 'shadingColor', color: string) => {
    setStyleSettings(prev => ({
      ...prev,
      [field]: color
    }));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Label Editor
        </h2>
        {selectedLabel && (
          <button
            onClick={() => setSelectedLabel(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Selection
          </button>
        )}
      </div>

      {selectedLabel ? (
        <>
          {/* 标签内容编辑 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                English
              </label>
              <input 
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={selectedLabel.english}
                onChange={(e) => handleLabelChange('english', e.target.value)}
              />
            </div>
            
            {/* 音标和中文输入框 */}
            {/* ... 类似的输入框结构 */}
          </div>

          {/* 样式设置 */}
          <div className="space-y-4">
            <ColorPicker
              label="Border Color"
              value={styleSettings.borderColor}
              onChange={(color) => handleStyleChange('borderColor', color)}
            />
            {/* 其他颜色选择器 */}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Select a label to edit
        </div>
      )}
    </div>
  );
} 