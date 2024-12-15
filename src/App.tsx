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

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Layout } from './components/Layout';
import { ImageDisplay } from './components/ImageDisplay';
import { LabelEditor } from './components/LabelEditor';
import { PromptPanel } from './components/PromptPanel';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Layout>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧图片区域 */}
          <div className="lg:flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <ImageDisplay />
            </div>
          </div>

          {/* 右侧编辑区域 */}
          <div className="lg:w-80">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <LabelEditor />
            </div>
          </div>
        </div>

        {/* 底部提示词面板 */}
        <div className="mt-6">
          <div className="bg-gray-800 rounded-lg shadow-sm">
            <PromptPanel />
          </div>
        </div>
      </Layout>
    </DndProvider>
  );
}

export default App;
