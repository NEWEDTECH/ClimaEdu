'use client';

import { Editor } from 'primereact/editor';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  maxLength = 50000 
}: RichTextEditorProps) {

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
        <label htmlFor="content" className="text-lg font-semibold dark:text-white text-gray-800">
          Conteúdo *
        </label>
      </div>
      
      <div className="rich-text-editor-wrapper">
        <Editor
          value={value}
          onTextChange={(e) => onChange(e.htmlValue || '')}
          style={{ height: '400px' }}
          disabled={disabled}
        />
      </div>

      {error && (
        <p className="text-sm dark:text-red-400 text-red-600 flex items-center gap-2">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          {error}
        </p>
      )}

      <div className="flex justify-between items-center">
        <p className="text-xs dark:text-white/60 text-gray-500">
          {value.replace(/<[^>]*>/g, '').length}/{maxLength.toLocaleString()} caracteres • Rich Text Editor
        </p>
        <div className={`w-2 h-2 rounded-full ${value.replace(/<[^>]*>/g, '').length >= 10 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
      </div>

      <style jsx global>{`
        .rich-text-editor-wrapper .p-editor-container {
          border-radius: 0.5rem;
        }
        
        .rich-text-editor-wrapper .p-editor-toolbar {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem 0.5rem 0 0;
        }
        
        .dark .rich-text-editor-wrapper .p-editor-toolbar {
          background: rgba(255, 255, 255, 0.05);
        }
        
        .rich-text-editor-wrapper .p-editor-content {
          border: none;
          border-radius: 0 0 0.5rem 0.5rem;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          min-height: 350px;
          color: inherit;
        }
        
        .dark .rich-text-editor-wrapper .ql-editor {
          color: white;
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: rgba(156, 163, 175, 0.6);
          content: 'Escreva seu conteúdo aqui...\\A\\ACompartilhe suas experiências, conhecimentos e insights!';
          white-space: pre-wrap;
        }
        
        .dark .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.4);
        }
        
        .rich-text-editor-wrapper.has-error .p-editor-container {
          border-color: rgba(239, 68, 68, 0.5) !important;
        }
        
        .rich-text-editor-wrapper .ql-snow .ql-stroke {
          stroke: currentColor;
        }
        
        .rich-text-editor-wrapper .ql-snow .ql-fill {
          fill: currentColor;
        }
        
        .dark .rich-text-editor-wrapper .ql-snow .ql-stroke {
          stroke: rgba(255, 255, 255, 0.8);
        }
        
        .dark .rich-text-editor-wrapper .ql-snow .ql-fill {
          fill: rgba(255, 255, 255, 0.8);
        }
        
        .rich-text-editor-wrapper .ql-toolbar button:hover,
        .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: rgb(168, 85, 247);
        }
        
        .dark .rich-text-editor-wrapper .ql-toolbar button:hover,
        .dark .rich-text-editor-wrapper .ql-toolbar button.ql-active {
          color: rgb(192, 132, 252);
        }
      `}</style>
    </div>
  );
}
