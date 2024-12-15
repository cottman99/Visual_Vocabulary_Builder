import { useAtom } from 'jotai';
import { ImageSrcAtom, LabelsAtom, ExportSettingsAtom } from '../atoms';
import toast from 'react-hot-toast';

export function ExportButton() {
  const [imageSrc] = useAtom(ImageSrcAtom);
  const [labels] = useAtom(LabelsAtom);
  const [exportSettings] = useAtom(ExportSettingsAtom);

  const handleExport = async () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        labels: labels.map(label => ({
          english: label.english,
          chinese: label.chinese,
          phonetic: label.phonetic,
          position: label.position
        }))
      };

      if (exportSettings.includeImage && imageSrc) {
        exportData['image'] = imageSrc;
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vocabulary-cards-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export successful');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow-sm"
    >
      Export
    </button>
  );
} 