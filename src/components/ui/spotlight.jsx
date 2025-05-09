"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";

export function Spotlight({
  children,
  className = "",
  fill = "white",
}) {
  const containerRef = useRef(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0 });
  const containerSize = useRef({ w: 0, h: 0 });
  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  useEffect(() => {
    if (!render) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const updateContainerSize = () => {
      const rect = container.getBoundingClientRect();
      containerSize.current.w = rect.width;
      containerSize.current.h = rect.height;
    };
    
    window.addEventListener("resize", updateContainerSize);
    updateContainerSize();
    
    return () => {
      window.removeEventListener("resize", updateContainerSize);
    };
  }, [render]);

  useEffect(() => {
    if (!render) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mousePosition.current = { x, y };
    };
    
    const handleMouseLeave = () => {
      mousePosition.current = {
        x: containerSize.current.w / 2,
        y: containerSize.current.h / 2
      };
    };
    
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    
    // Set initial position
    handleMouseLeave();
    
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [render]);

  useEffect(() => {
    if (!render) return;
    
    const updateMouse = () => {
      const { x, y } = mousePosition.current;
      
      // Add some easing
      mouse.current.x += (x - mouse.current.x) * 0.1;
      mouse.current.y += (y - mouse.current.y) * 0.1;
      
      if (containerRef.current) {
        const spotlight = containerRef.current.querySelector(".spotlight");
        if (spotlight) {
          spotlight.style.background = `radial-gradient(700px circle at ${mouse.current.x}px ${mouse.current.y}px, ${fill}, transparent 40%)`;
        }
      }
      
      requestAnimationFrame(updateMouse);
    };
    
    const animationId = requestAnimationFrame(updateMouse);
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [render, fill]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full overflow-hidden absolute inset-0 pointer-events-none",
        className
      )}
    >
      <div className="spotlight absolute inset-0 opacity-[0.15]" />
      {children}
    </div>
  );
} 