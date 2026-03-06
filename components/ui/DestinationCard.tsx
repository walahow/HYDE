import { ChevronRight } from "lucide-react";

interface DestinationCardProps {
    id: string;
    name: string;
    faculty: string;
    documentCount: number;
}

export default function DestinationCard({
    name,
    faculty,
    documentCount,
}: DestinationCardProps) {
    return (
        <div className="group relative w-96 shrink-0 h-[440px] rounded-none bg-transparent overflow-visible transition-transform duration-300 hover:-translate-y-2">

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
                <img
                    src="/img/building-removebg-preview.png"
                    alt="Building pop-out"
                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-[1.1] group-hover:-translate-y-2 will-change-transform"
                    style={{
                        imageRendering: 'crisp-edges',
                        WebkitFontSmoothing: 'antialiased',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)'
                    }}
                />
            </div>

            {/* Main Card Content - clipped for document icon fold on top-left */}
            <div
                className="relative h-full w-full bg-gradient-to-t from-blue-50/40 to-white flex flex-col justify-between shadow-sm transition-shadow group-hover:shadow-md"
                style={{
                    clipPath: 'polygon(110px 0, 100% 0, 100% 100%, 0 100%, 0 110px)',
                }}
            >

                {/* Background image inside the card, fading smoothly — naturally clipped by card's clip-path */}
                <div
                    className="absolute -top-16 left-0 right-0 h-72 z-[1] pointer-events-none"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                    }}
                >
                    <img
                        src="/img/building_background.png"
                        alt="Building illustration"
                        className="h-full w-full object-cover object-top drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Custom borders for extended intersecting lines */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-px bg-blue-200" />
                    <div className="absolute top-0 bottom-0 left-0 w-px bg-blue-200" />
                    {/* Right border extenbding down past the button */}
                    <div className="absolute top-0 -bottom-4 right-0 w-px bg-blue-300" />
                    {/* Bottom border extending right */}
                    <div className="absolute bottom-0 -right-4 left-0 h-px bg-blue-300" />
                    {/* Intersection point */}
                    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-blue-500 z-20 translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="px-6 flex-1 flex flex-col justify-between pt-24 relative z-[2]">
                    {/* Top Content */}
                    <div>
                        <div className="relative z-30 inline-block px-2 py-1 bg-blue-50/90 backdrop-blur-sm border border-blue-200 text-blue-600 text-[10px] font-mono mb-4 tracking-wider uppercase shadow-sm">
                            // Depot Node
                        </div>
                        <h3 className="text-xl font-bold text-blue-950 leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">
                            {name}
                        </h3>
                        <button className="flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors w-max shadow-sm">
                            Check Location
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    {/* Middle Content Area */}
                    <div className="space-y-4 mb-4 mt-6">
                        <div className="h-px w-full bg-blue-100" />

                        <div>
                            <p className="text-xs text-blue-900/70 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-sm inline-block" />
                                Faculty: {faculty}
                            </p>
                            <p className="text-xs text-blue-900/70 mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-sm inline-block" />
                                Active Documents: {documentCount}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full-width Bottom Button Area */}
                <div className="w-full mt-auto relative z-[2]">
                    <div className="text-center text-[10px] font-mono text-blue-600 mb-2 truncate px-6">
                        &gt;&gt;&gt; Ready for Processing &gt;&gt;&gt;
                    </div>
                    <button className="w-full py-5 bg-white text-blue-700 border-t border-blue-100/50 text-sm font-bold transition-colors hover:bg-zinc-50 flex justify-center items-center">
                        Pack Goods
                    </button>
                </div>
            </div>
        </div>
    );
}
