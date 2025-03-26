
import React from "react";
import { cn } from "@/lib/utils";

interface BlurBackgroundProps {
  children: React.ReactNode;
  className?: string;
  strength?: "sm" | "md" | "lg" | "xl";
  color?: "light" | "dark";
}

const BlurBackground = ({
  children,
  className,
  strength = "md",
  color = "light",
}: BlurBackgroundProps) => {
  const strengthMap = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };
  
  const colorMap = {
    light: "bg-white/40 border border-white/20",
    dark: "bg-black/40 border border-white/10",
  };
  
  return (
    <div
      className={cn(
        strengthMap[strength],
        colorMap[color],
        "shadow-soft rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
};

export default BlurBackground;
