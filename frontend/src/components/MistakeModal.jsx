import React from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MistakeModal = ({ question, onClose }) => {
  if (!question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            Mistake Notes
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Question:</span>
            <div className="font-medium text-gray-900 dark:text-white">{question.name}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg border border-red-100 dark:border-red-800/30 text-sm leading-relaxed overflow-y-auto max-h-96 markdown-content">
            {question.mistakes ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none prose-sm">
                {question.mistakes}
              </ReactMarkdown>
            ) : (
              "No mistakes recorded."
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MistakeModal;
