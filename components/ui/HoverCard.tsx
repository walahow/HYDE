"use client";

import React from "react";

interface HoverCardProps {
    children: React.ReactNode;
    className?: string;
}

export default function HoverCard({ children, className = "" }: HoverCardProps) {
    return (
        <div className={`group relative block w-full z-10 ${className}`}>
            {/* The Front Layer (Terminal Block Card) */}
            <div className="relative bg-gradient-to-t from-zinc-50 to-white border border-zinc-200 rounded-none shadow-sm transition-all duration-300 ease-out group-hover:border-black group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-1 group-hover:-translate-x-1 overflow-hidden">
                {/* Retro-tech Bayer Dithering Overlay - Right-to-Left Gradient */}
                <div
                    className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-multiply"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h2v2H0zM2 2h2v2H2z' fill='%2371717a' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 100%)',
                        maskImage: 'linear-gradient(to left, black 0%, transparent 100%)'
                    }}
                />
                <div className="relative z-20 transition-all duration-300">
                    {children}
                </div>
            </div>
        </div>
    );
}


