"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

export interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "white" | "emerald" | "default" | "cyan" | "purple";
}

export function ShinyButton({
  children,
  className = "",
  onClick,
  variant = "white",
  ...props
}: ShinyButtonProps) {
  const getGlow = () => {
    switch (variant) {
      case "emerald":
        return "shadow-emerald-500/25 border-emerald-500/40 hover:border-emerald-400";
      case "purple":
        return "shadow-purple-500/25 border-purple-500/40 hover:border-purple-300";
      case "cyan":
      case "white":
      case "default":
      default:
        return "shadow-[0_0_25px_rgba(255,255,255,0.2)] border-white/30 hover:border-white hover:shadow-[0_0_35px_rgba(255,255,255,0.35)]";
    }
  };

  return (
    <motion.button
      initial={{ "--x": "100%", scale: 1 } as any}
      animate={{ "--x": "-100%" } as any}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 1.2,
        type: "spring",
        stiffness: 20,
        damping: 15,
        mass: 2,
        scale: {
          type: "spring",
          stiffness: 300,
          damping: 15,
        },
      }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20 bg-[#0D0F12] px-6 py-3 font-medium text-white shadow-xl backdrop-blur-md transition-all duration-300 ${getGlow()} ${className}`}
      {...props}
    >
      {/* Background Animated Sheen in Pure White #FFFFFF */}
      <span
        className="absolute inset-0 block rounded-[inherit] p-[1px] pointer-events-none"
        style={{
          background:
            "linear-gradient(-75deg, rgba(255,255,255,0.05) calc(var(--x) + 20%), rgba(255,255,255,0.75) calc(var(--x) + 25%), rgba(255,255,255,0.05) calc(var(--x) + 100%))",
        }}
      />

      {/* Radial soft white glow */}
      <span className="absolute -inset-px rounded-[inherit] bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 hover:opacity-100 transition-opacity" />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
        {children}
      </span>
    </motion.button>
  );
}

export default ShinyButton;
