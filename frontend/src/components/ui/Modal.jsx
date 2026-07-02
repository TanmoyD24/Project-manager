import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div
            className={`${sizes[size]} w-full bg-white rounded-lg shadow-xl transform transition-all text-left relative z-50`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default Modal;