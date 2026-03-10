"use client";

import { cn } from "@/lib/utils";
import React, { useState, useRef, useCallback } from "react";

interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    className?: string;
    squaresClassName?: string;
    interactiveSource?: 'self' | 'window';
}

interface TrailItem {
    id: string;
    x: number;
    y: number;
}

/**
 * HIGH PERFORMANCE InteractiveGridPattern with Trail Effect
 * Uses SVG Pattern for the grid lines and a single snapping rect for the hover effect.
 * This reduces DOM elements from ~20,000+ to just a few, ensuring 60fps responsiveness.
 */
export function InteractiveGridPattern({
    width = 40,
    height = 40,
    className,
    squaresClassName,
    interactiveSource = 'self',
    ...props
}: InteractiveGridPatternProps) {
    const [trail, setTrail] = useState<TrailItem[]>([]);
    const containerRef = useRef<SVGSVGElement>(null);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const handleMouseMove = useCallback((clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Snap to grid
        const gridX = Math.floor(x / width) * width;
        const gridY = Math.floor(y / height) * height;

        // Damping: Only add if position changed
        if (lastPos.current?.x === gridX && lastPos.current?.y === gridY) return;
        lastPos.current = { x: gridX, y: gridY };

        const id = `${gridX}-${gridY}-${Date.now()}`;
        const newItem: TrailItem = { id, x: gridX, y: gridY };

        setTrail((prev) => [...prev, newItem]);

        // Remove item after animation completes (e.g., 1500ms)
        setTimeout(() => {
            setTrail((prev) => prev.filter((item) => item.id !== id));
        }, 1500);
    }, [width, height]);

    React.useEffect(() => {
        if (interactiveSource !== 'window') return;

        const onWindowMouseMove = (e: MouseEvent) => {
            handleMouseMove(e.clientX, e.clientY);
        };

        window.addEventListener('mousemove', onWindowMouseMove);
        return () => window.removeEventListener('mousemove', onWindowMouseMove);
    }, [interactiveSource, handleMouseMove]);

    return (
        <svg
            ref={containerRef}
            width="100%"
            height="100%"
            className={cn(
                "absolute inset-0 h-full w-full",
                className,
            )}
            onMouseMove={interactiveSource === 'self' ? (e) => handleMouseMove(e.clientX, e.clientY) : undefined}
            {...props}
        >
            <defs>
                <pattern
                    id="grid-pattern"
                    width={width}
                    height={height}
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d={`M ${width} 0 L 0 0 0 ${height}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-black/10"
                    />
                </pattern>
            </defs>

            {/* Repeating Grid Background */}
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />

            {/* Interactive Trail Squares */}
            {trail.map((item) => (
                <rect
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    width={width}
                    height={height}
                    className={cn(
                        "fill-black/15 origin-center pointer-events-none",
                        squaresClassName
                    )}
                    style={{
                        animation: "trail-elegant 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
                        transformOrigin: `${item.x + width / 2}px ${item.y + height / 2}px`
                    }}
                />
            ))}

            <style jsx>{`
                @keyframes trail-elegant {
                    0% { 
                        opacity: 0; 
                        transform: scale(0.9);
                    }
                    15% { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                    35% { 
                        opacity: 1; 
                        transform: scale(1);
                    }
                    100% { 
                        opacity: 0; 
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </svg>
    );
}
