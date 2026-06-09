import React, { useState, useRef } from 'react';
import { Bold, Italic, Heading1, Heading2, List, ListOrdered, Eye, Edit2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  rows?: number;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  rows = 10,
  placeholder = "Write section content here..."
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${openTag}${selected}${closeTag}`;
    
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Reset selection/focus
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selected.length + closeTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const toolbarButtons = [
    { 
      name: 'Bold', 
      icon: <Bold size={16} />, 
      action: () => insertTag('<strong>', '</strong>') 
    },
    { 
      name: 'Italic', 
      icon: <Italic size={16} />, 
      action: () => insertTag('<em>', '</em>') 
    },
    { 
      name: 'Heading 1', 
      icon: <Heading1 size={16} />, 
      action: () => insertTag('<h2>', '</h2>') 
    },
    { 
      name: 'Heading 2', 
      icon: <Heading2 size={16} />, 
      action: () => insertTag('<h3>', '</h3>') 
    },
    { 
      name: 'Bullet List', 
      icon: <List size={16} />, 
      action: () => insertTag('<ul>\n  <li>', '</li>\n</ul>') 
    },
    { 
      name: 'Numbered List', 
      icon: <ListOrdered size={16} />, 
      action: () => insertTag('<ol>\n  <li>', '</li>\n</ol>') 
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
          {label}
        </label>
        
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${activeTab === 'write' ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <Edit2 size={12} /> Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            <Eye size={12} /> Preview
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
        {activeTab === 'write' ? (
          <div>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50 dark:bg-zinc-900/50">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.name}
                  type="button"
                  onClick={btn.action}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                  title={btn.name}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 focus:outline-none bg-transparent text-gray-900 dark:text-white text-sm leading-relaxed resize-y"
            />
          </div>
        ) : (
          <div className="p-4 min-h-[220px] max-h-[500px] overflow-y-auto prose dark:prose-invert max-w-none text-gray-800 dark:text-zinc-200 text-sm leading-relaxed custom-scrollbar">
            {value ? (
              <div 
                dangerouslySetInnerHTML={{ __html: value }} 
                className="space-y-4"
              />
            ) : (
              <p className="text-zinc-400 dark:text-zinc-500 italic text-center py-10">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
