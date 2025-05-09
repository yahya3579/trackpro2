"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const CardSpotlight = React.forwardRef(({
  className,
  children,
  color = "rgba(255, 255, 255, 0.05)",
  variants,
  ...props
}, ref) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    
    setPosition({ 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top 
    });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const MotionDiv = variants ? motion.div : "div";
  const motionProps = variants ? { variants } : {};

  return (
    <MotionDiv
      ref={ref}
      {...motionProps}
      className="relative"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
          className
        )}
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: `radial-gradient(650px circle at ${position.x}px ${position.y}px, ${color}, transparent 40%)`,
          }}
        />
        {children}
      </div>
    </MotionDiv>
  );
});

CardSpotlight.displayName = "CardSpotlight";