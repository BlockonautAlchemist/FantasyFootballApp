import { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
}

export default function Marquee({ 
  children, 
  className = "", 
  speed = 30,
  direction = "left" 
}: MarqueeProps) {
  const animationDirection = direction === "left" ? "normal" : "reverse";
  
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div 
        className="inline-block"
        style={{
          animation: `marquee ${speed}s linear infinite ${animationDirection}`,
        }}
      >
        {children}
        <span className="ml-8">{children}</span>
      </div>
    </div>
  );
}