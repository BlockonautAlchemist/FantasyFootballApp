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
        return "bg-green-600/10 border-green-600/20 text-green-400";
      case "warning":
        return "bg-yellow-600/10 border-yellow-600/20 text-yellow-400";
      case "error":
        return "bg-red-600/10 border-red-600/20 text-red-400";
      case "info":
      default:
        return "bg-blue-600/10 border-blue-600/20 text-blue-400";
    }
  };

  return (
    <div className={`border rounded-2xl p-6 backdrop-blur-sm ${getVariantClasses()}`} data-testid={`callout-${variant}`}>
      {(icon || title) && (
        <div className="flex items-center mb-2">
          {icon && <i className={`${icon} mr-2`}></i>}
          {title && <h4 className="font-display font-semibold text-white">{title}</h4>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
