import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export type ConfirmModalType = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmModalType;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-red-600 dark:text-red-500" size={24} />,
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          btn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
        };
      case 'info':
        return {
          icon: <Info className="text-blue-600 dark:text-blue-500" size={24} />,
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="text-amber-600 dark:text-amber-500" size={24} />,
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white',
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="absolute inset-0" 
        onClick={() => !isLoading && onClose()}
      ></div>
      
      <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start">
            <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg} mr-4`}>
              {styles.icon}
            </div>
            <div className="flex-1 mt-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {message}
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-950/50 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center transition-colors shadow-sm ${styles.btn}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
