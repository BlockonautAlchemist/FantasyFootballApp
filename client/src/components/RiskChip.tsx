interface RiskChipProps {
  risk: "Low" | "Med" | "High";
  size?: "sm" | "md";
}

export default function RiskChip({ risk, size = "sm" }: RiskChipProps) {
  const getRiskClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low": return "risk-low";
      case "med": 
      case "medium": return "risk-med";
      case "high": return "risk-high";
      default: return "risk-med";
    }
  };

  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1";

  return (
    <span className={`${getRiskClass(risk)} ${sizeClass} rounded`} data-testid={`risk-chip-${risk.toLowerCase()}`}>
      {risk} Risk
    </span>
  );
}
