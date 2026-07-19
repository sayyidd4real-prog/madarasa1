"use client";

import React from "react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  iconSize?: string;
  showText?: boolean;
}

export function MadrasaLogoIcon({ className = "w-8 h-8", colorClass = "text-emerald-500 dark:text-emerald-400" }: { className?: string; colorClass?: string }) {
  return (
    <svg
      className={`${className} ${colorClass}`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Pointed Islamic Arch / Shield */}
      <path
        d="M50 5C50 5 85 20 85 50C85 75 70 90 50 95C30 90 15 75 15 50C15 20 50 5 50 5Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Minaret Crescent Accent */}
      <path
        d="M47 18C47 18 51.5 15 55 18C52.5 19.5 52.5 22.5 55 24C51.5 27 47 24 47 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="25"
        x2="50"
        y2="33"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Open Book pages */}
      <path
        d="M50 62C50 62 40 50 25 53V72C40 69 50 78 50 78C50 78 60 69 75 72V53C60 50 50 62 50 62Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Book spine line */}
      <line
        x1="50"
        y1="62"
        x2="50"
        y2="78"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Pen / Flame of knowledge (Top of the book) */}
      <path
        d="M50 38C48 42 45 46 45 50C45 52.76 47.24 55 50 55C52.76 55 55 52.76 55 50C55 46 52 42 50 38Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MadrasaLogo({ className = "h-9", iconSize = "w-8 h-8", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <MadrasaLogoIcon className={iconSize} />
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-extrabold text-sm md:text-base tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none font-serif">
            Badru-diin
          </span>
          <span className="text-[8px] md:text-[9px] block text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-0.5 leading-none">
            Educational Portal
          </span>
        </div>
      )}
    </div>
  );
}

export function MadrasaLoader({ message = "Loading Educational Portal..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative p-6 select-none overflow-hidden">
      {/* Soft background glows */}
      <div className="absolute w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />
      
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="relative p-8 bg-slate-900/40 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-md">
          {/* Animated Spinner Border */}
          <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-emerald-500/20 animate-[spin_20s_linear_infinite]" />
          <div className="absolute -inset-1.5 rounded-[30px] border-2 border-emerald-500/30 animate-pulse pointer-events-none" />
          
          <div className="relative animate-bounce duration-1000">
            <MadrasaLogoIcon className="w-16 h-16" colorClass="text-emerald-400" />
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-emerald-400 font-mono text-xs uppercase font-extrabold tracking-widest animate-pulse">
            Madarasah Badru-diin
          </h2>
          <p className="text-slate-400 text-sm font-semibold mt-1">
            {message}
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
