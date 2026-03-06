"use client";

import React from "react";

interface HoverCardProps {
    children: React.ReactNode;
    className?: string;
}

export default function HoverCard({ children, className = "" }: HoverCardProps) {
    return (
        <div className={`group relative block w-full z-10 ${className}`}>
            {/* The Background Layer (The Fading Dithered Image Shadow) */}
            <div
                className="absolute inset-0 -z-10 translate-x-3 translate-y-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                style={{
                    WebkitMaskImage: "radial-gradient(circle at 100% 100%, black 0%, transparent 75%)",
                    maskImage: "radial-gradient(circle at 100% 100%, black 0%, transparent 75%)",
                    transform: "translateZ(0)",
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                    willChange: "opacity"
                }}
                aria-hidden="true"
            >
                <img
                    src="/img/dither_shadow.png"
                    alt=""
                    className="absolute right-0 bottom-0 w-[976px] max-w-none h-[80px] object-none object-right-bottom rounded-2xl pointer-events-none"
                    style={{ imageRendering: "pixelated" }}
                />
            </div>

            {/* The Front Layer (The Apple-esque Card) */}
            <div className="relative bg-white border border-zinc-200 rounded-2xl shadow-sm transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:-translate-x-1">
                {children}
            </div>
        </div>
    );
}


