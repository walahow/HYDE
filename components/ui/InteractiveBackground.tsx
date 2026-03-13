"use client";

import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { cn } from "@/lib/utils";

interface InteractiveBackgroundProps {
    className?: string;
    maskSize?: string;
    interactiveSource?: 'self' | 'window';
}

export function InteractiveBackground({
    className,
    maskSize = "min(90vw, 85vh, 1200px)",
    interactiveSource = 'window'
}: InteractiveBackgroundProps) {
    return (
        <div className={cn("fixed inset-0 z-0 pointer-events-none", className)}>
            <InteractiveGridPattern
                className="pointer-events-auto"
                width={40}
                height={40}
                squaresClassName="hover:fill-black/15"
                interactiveSource={interactiveSource}
                style={{
                    WebkitMaskImage: `radial-gradient(${maskSize} circle at center, white, transparent)`,
                    maskImage: `radial-gradient(${maskSize} circle at center, white, transparent)`
                }}
            />
        </div>
    );
}
