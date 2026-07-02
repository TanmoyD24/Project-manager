function Card({ children, className = "", padding = "p-6", hover = false }) {
  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 shadow-sm
        ${hover ? "hover:shadow-md transition-shadow cursor-pointer" : ""}
        ${padding} ${className}
      `}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function CardFooter({ children, className = "" }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };