import { FAABGuidance } from "@/services/types";

interface FAABSliderProps {
  guidance: FAABGuidance;
}

export default function FAABSlider({ guidance }: FAABSliderProps) {
  const percentage = guidance.likely;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text">{guidance.id}</span>
        <span className="text-xs text-textDim">{guidance.min}-{guidance.max}%</span>
      </div>
      <div className="bg-surface2 rounded-full h-2 mb-1">
        <div 
          className="bg-secondary h-2 rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-textDim">{guidance.rationale}</p>
    </div>
  );
}
