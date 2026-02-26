"use client";

import React from "react";

interface HoverCardProps {
    children: React.ReactNode;
    className?: string;
}

export default function HoverCard({ children, className = "" }: HoverCardProps) {
    return (
        <div className={`group relative rounded-2xl overflow-hidden ${className}`}>
            {/* Pixelated glow layer — visible only on hover, silver/zinc grayscale tones */}
            <div
                className="pixel-glow-mask absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                style={{
                    background: "linear-gradient(135deg, #18181b 0%, #71717a 50%, #d4d4d8 100%)",
                }}
                aria-hidden="true"
            />
            {/* Foreground card */}
            <div className="relative m-px rounded-2xl bg-white transition-all duration-300 group-hover:shadow-lg">
                {children}
            </div>
        </div>
    );
}
