import { ChevronRight, MapPin, Circle, Ban } from "lucide-react";

interface DestinationCardProps {
    id: string;
    categoryCode: string;
    name: string;
    faculty: string;
    documentCount: number;
    status: "open" | "closed";
    acceptedDocuments: string[];
}

export default function DestinationCard({
    categoryCode,
    name,
    faculty,
    documentCount,
    status,
    acceptedDocuments,
}: DestinationCardProps) {
    return (
        <div className="group relative w-96 shrink-0 h-[460px] rounded-none bg-transparent overflow-visible transition-transform duration-300">

            {/* Pop-out building illustration - fades at bottom/right to blend with background */}
            <div
                className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 z-30 pointer-events-none"
                style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%), linear-gradient(to bottom, black 50%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%), linear-gradient(to bottom, black 50%, transparent 100%)',
                    WebkitMaskComposite: 'destination-in',
                    maskComposite: 'intersect',
                }}
            >
                {/* Ensure the image is a grayscale or fits the monochrome theme. Grayscale filter applied. */}
                <img
                    src="/img/building-removebg-preview.png"
                    alt="Building pop-out"
                    className="w-full h-full object-contain grayscale opacity-90 drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.1] group-hover:-translate-y-2 will-change-transform"
                    style={{
                        imageRendering: 'crisp-edges',
                        WebkitFontSmoothing: 'antialiased',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)'
                    }}
                />
            </div>

            {/* Custom borders for extended intersecting lines in monochrome theme - PLACED OUTSIDE CLIP */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
                {/* Top border starting before the clipped corner and shooting past the right edge */}
                <div className="absolute top-0 left-[96px] -right-3 h-px bg-zinc-300" />
                {/* Left border starting above the clipped corner and shooting past the bottom edge */}
                <div className="absolute top-[96px] -bottom-3 left-0 w-px bg-zinc-300" />

                {/* Diagonal clipped border to match the clip path outline and overshoot */}
                <div
                    className="absolute top-[118px] left-[-8px] h-px bg-zinc-300 origin-top-left"
                    style={{ width: '178.2px', transform: 'rotate(-45deg)' }}
                />

                {/* Right border extending past the top and bottom edge */}
                <div className="absolute -top-3 -bottom-5 right-0 w-px bg-zinc-200" />
                {/* Bottom border extending past the left and right edge */}
                <div className="absolute bottom-0 -left-3 -right-5 h-px bg-zinc-200" />
            </div>

            {/* Main Card Content - clipped for document icon fold on top-left */}
            <div
                className="relative h-full w-full bg-gradient-to-t from-zinc-100 to-white flex flex-col justify-between shadow-sm transition-all group-hover:shadow-md"
                style={{
                    clipPath: 'polygon(110px 0, 100% 0, 100% 100%, 0 100%, 0 110px)',
                }}
            >

                {/* Background image inside the card, fading smoothly — naturally clipped by card's clip-path */}
                <div
                    className="absolute -top-16 left-0 right-0 h-72 z-[1] pointer-events-none opacity-[0.05] mix-blend-multiply"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                    }}
                >
                    <img
                        src="/img/building_background.png"
                        alt="Building illustration"
                        className="h-full w-full object-cover object-top drop-shadow-xl transition-transform duration-500 grayscale group-hover:scale-105"
                    />
                </div>

                <div className="px-6 flex-1 flex flex-col pt-24 relative z-[2]">
                    {/* Top Content */}
                    <div>
                        <div className="relative z-30 inline-block text-zinc-500 text-[10px] font-mono mb-1 tracking-wider uppercase">
                            // {categoryCode}
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">
                            {name}
                        </h3>
                        {/* Action + Status Row */}
                        <div className="flex items-center justify-between mb-4 mt-2">
                            <button className="flex items-center gap-1.5 rounded-full bg-zinc-900 text-white px-3 py-1 font-bold text-xs hover:bg-zinc-800 transition-colors shadow-sm w-max">
                                <MapPin size={14} className="text-zinc-100" />
                                Check Location
                            </button>

                            {/* Status Indicator (Open / Closed) */}
                            <div className="flex items-center gap-1.5">
                                <Circle
                                    size={16}
                                    strokeWidth={3}
                                    className={status === 'open' ? "text-zinc-900" : "text-zinc-300"}
                                />
                                <span className="text-zinc-300 font-light">/</span>
                                <Ban
                                    size={16}
                                    strokeWidth={3}
                                    className={status === 'closed' ? "text-zinc-900" : "text-zinc-300"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Middle Content Area */}
                    <div className="space-y-3 mt-4 flex-1">
                        <div className="h-px w-full bg-zinc-200" />

                        <div className="text-xs text-zinc-600 space-y-2 font-mono">
                            <p className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-sm inline-block mt-1 shrink-0" />
                                <span><span className="text-zinc-400">Faculty:</span> {faculty}</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-sm inline-block mt-1 shrink-0" />
                                <span><span className="text-zinc-400">Active Docs:</span> {documentCount}</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-zinc-800 rounded-sm inline-block mt-1 shrink-0 shadow-sm" />
                                <span className="line-clamp-2"><span className="text-zinc-400">Accepts:</span> {acceptedDocuments.join(", ")}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full-width Bottom Button Area */}
                <div className="w-full relative z-[2] bg-gradient-to-t from-zinc-50 to-transparent pt-4">
                    <div className="text-center text-[11px] font-mono text-zinc-500 mb-2 truncate px-6 font-semibold tracking-widest">
                        &gt;&gt;&gt; Route Available &gt;&gt;&gt;
                    </div>
                    {/* Progress track overlay aesthetic with prism shapes, resting on button */}
                    <div className="absolute bottom-[54px] left-0 right-0 flex justify-center items-center pointer-events-none">
                        <div className="w-3/4 h-px bg-zinc-300 flex justify-between items-center px-4">
                            {/* Left Prism */}
                            <div className="w-2.5 h-2.5 bg-zinc-300 rotate-45" />
                            {/* Center Animated Prism */}
                            <div className="relative flex justify-center items-center">
                                {/* Outer glowing/pulsing effect - activated on hover */}
                                <div className="absolute w-4 h-4 bg-zinc-800/20 rotate-45 transition-transform duration-300 group-hover:animate-ping" />
                                {/* Main larger prism */}
                                <div className="w-3.5 h-3.5 bg-zinc-800 border border-white rotate-45 z-10 shadow-sm" />
                            </div>
                            {/* Right Prism */}
                            <div className="w-2.5 h-2.5 bg-zinc-300 rotate-45" />
                        </div>
                    </div>

                    <button className="w-full py-4 bg-white text-zinc-900 border-t border-zinc-200 text-sm font-bold transition-all hover:bg-zinc-50 flex justify-center items-center uppercase tracking-wide">
                        Pack Documents
                    </button>
                </div>
            </div>
        </div>
    );
}

