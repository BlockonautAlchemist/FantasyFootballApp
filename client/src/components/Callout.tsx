import { ReactNode } from "react";

interface CalloutProps {
  variant: "success" | "warning" | "error" | "info";
  icon?: string;
  title?: string;
  children: ReactNode;
}

export default function Callout({ variant, icon, title, children }: CalloutProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getVariantClasses()}`} data-testid={`callout-${variant}`}>
      {(icon || title) && (
        <div className="flex items-center mb-2">
          {icon && <i className={`${icon} mr-2`}></i>}
          {title && <h4 className="font-medium">{title}</h4>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
