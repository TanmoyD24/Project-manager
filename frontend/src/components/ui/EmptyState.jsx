import { PlusIcon, FolderIcon, CheckCircleIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

function EmptyState({
  title = "No items found",
  description = "Get started by creating your first item.",
  action,
  icon,
}) {
  const defaultIcons = {
    projects: FolderIcon,
    tasks: ClipboardDocumentListIcon,
    subtasks: CheckCircleIcon,
    default: PlusIcon,
  };

  const Icon = icon || defaultIcons.default;

  return (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 text-gray-300">
        <Icon className="h-full w-full" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{description}</p>
      {action && (
        <div className="mt-6">{action}</div>
      )}
    </div>
  );
}

export default EmptyState;