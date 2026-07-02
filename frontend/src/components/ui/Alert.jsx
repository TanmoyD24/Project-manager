import { XMarkIcon, ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

function Alert({ message, type = "info", onClose, dismissible = false }) {
  const configs = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: CheckCircleIcon,
      title: "Success",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: ExclamationCircleIcon,
      title: "Error",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: ExclamationCircleIcon,
      title: "Warning",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: InformationCircleIcon,
      title: "Info",
    },
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start p-4 rounded-lg border ${config.bg} ${config.border} ${config.text}
        ${dismissible ? "relative" : ""}
      `}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm">{message}</p>
      </div>
      {dismissible && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-current opacity-50 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export default Alert;