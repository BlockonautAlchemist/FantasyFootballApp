import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  scale?: number;
}

export default function MagneticButton({ 
  children, 
  className = "", 
  onClick,
  href,
  scale = 1.02
}: MagneticButtonProps) {
  const Component = href ? motion.a : motion.button;
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={`inline-block cursor-pointer ${className}`}
      whileHover={{ 
        scale, 
        y: -2,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      data-testid="magnetic-button"
    >
      <div>{children}</div>
    </Component>
  );
}