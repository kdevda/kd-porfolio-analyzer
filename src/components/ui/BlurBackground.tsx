
import React from "react";
import { cn } from "@/lib/utils";

interface BlurBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const BlurBackground = ({ children, className }: BlurBackgroundProps) => {
  return (
    <div className={cn(
      "relative bg-white bg-opacity-70 backdrop-blur-lg rounded-xl shadow-md border border-gray-200",
      className
    )}>
      {children}
    </div>
  );
};

export default BlurBackground;
