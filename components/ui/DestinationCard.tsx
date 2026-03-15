import { ChevronRight, MapPin, Circle, Ban } from "lucide-react";
import Link from "next/link";

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
        <div className="group relative w-full max-w-[384px] md:w-[clamp(340px,25vw,400px)] shrink-0 h-[480px] md:h-[clamp(440px,60vh,500px)] rounded-none bg-transparent overflow-visible transition-all duration-500 mx-auto">

            {/* Pop-out building illustration */}
            <div
                className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 z-30 pointer-events-none"
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
                    className="w-full h-full object-contain grayscale opacity-90 drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.1] group-hover:-translate-y-2 will-change-transform"
                    style={{
                        imageRendering: 'crisp-edges',
                        WebkitFontSmoothing: 'antialiased',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)'
                    }}
                />
            </div>

            {/* Custom borders for extended intersecting lines */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
                {/* Top border: start relative to the fold, shoot past right */}
                <div className="absolute top-0 left-[100px] -right-3 h-px bg-zinc-300" />
                {/* Left border: start below the fold, shoot past bottom */}
                <div className="absolute top-[100px] -bottom-3 left-0 w-px bg-zinc-300" />

                {/* Diagonal clipped border overshoot */}
                <div
                    className="absolute top-[120px] left-[-10px] h-px bg-zinc-300/80 origin-top-left"
                    style={{ width: '185px', transform: 'rotate(-45deg)' }}
                />

                {/* Right border extending past top/bottom */}
                <div className="absolute -top-3 -bottom-5 right-0 w-px bg-zinc-200" />
                {/* Bottom border extending past left/right */}
                <div className="absolute bottom-0 -left-3 -right-5 h-px bg-zinc-200" />
            </div>

            {/* Main Card Content */}
            <div
                className="relative h-full w-full bg-gradient-to-t from-zinc-100 to-white flex flex-col justify-between shadow-sm transition-all group-hover:shadow-md"
                style={{
                    clipPath: 'polygon(110px 0, 100% 0, 100% 100%, 0 100%, 0 110px)',
                }}
            >

                {/* Background image inside card */}
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

                {/* Bayer Dithering Overlay */}
                <div
                    className="absolute inset-0 z-[10] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-multiply"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h2v2H0zM2 2h2v2H2z' fill='%2371717a' fill-opacity='0.18' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'repeat',
                        maskImage: 'linear-gradient(to bottom, transparent 60px, black 160px)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent 60px, black 160px)'
                    }}
                />

                <div className="px-6 flex-1 flex flex-col pt-24 relative z-[20]">
                    <div className="relative z-10">
                        <div className="relative z-30 inline-block text-zinc-500 text-[10px] font-mono mb-1 tracking-wider uppercase">
                            // {categoryCode}
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-zinc-900 leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">
                            {name}
                        </h3>
                        {/* Action + Status Row */}
                        <div className="flex items-center justify-between mb-4 mt-2 gap-4">
                            <button className="flex items-center gap-2 rounded-none bg-white text-zinc-500 border border-zinc-200 px-3 py-2 md:py-1.5 font-mono font-bold text-[10px] uppercase tracking-tighter hover:bg-black hover:text-white hover:border-black active:bg-black active:text-white transition-all shadow-sm w-max h-10 md:h-auto">
                                <MapPin size={12} className="shrink-0" />
                                Check Location
                            </button>

                            <div className="flex items-center gap-1.5 bg-zinc-50/80 p-1 md:p-0 md:bg-transparent">
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
                    <div className="space-y-3 mt-4 flex-1 relative z-10">
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
                <div className="w-full relative z-[20] bg-gradient-to-t from-zinc-50 to-transparent pt-4">
                    <div className="text-center text-[10px] md:text-[11px] font-mono text-zinc-500 mb-2 truncate px-6 font-semibold tracking-widest sm:block hidden">
                        &gt;&gt;&gt; Route Available &gt;&gt;&gt;
                    </div>
                    {/* Progress track overlay aesthetic */}
                    <div className="absolute bottom-[66px] md:bottom-[54px] left-0 right-0 flex justify-center items-center pointer-events-none sm:flex hidden">
                        <div className="w-3/4 h-px bg-zinc-300 flex justify-between items-center px-4">
                            <div className="w-2.5 h-2.5 bg-zinc-300 rotate-45" />
                            <div className="relative flex justify-center items-center">
                                <div className="absolute w-4 h-4 bg-zinc-800/20 rotate-45 transition-transform duration-300 group-hover:animate-ping" />
                                <div className="w-3.5 h-3.5 bg-zinc-800 border border-white rotate-45 z-10 shadow-sm" />
                            </div>
                            <div className="w-2.5 h-2.5 bg-zinc-300 rotate-45" />
                        </div>
                    </div>

                    <Link href="/student/document-view" className="w-full py-5 md:py-4 bg-white text-zinc-900 border-t border-zinc-200 text-sm font-bold transition-all hover:bg-zinc-900 hover:text-white active:bg-zinc-800 flex justify-center items-center uppercase tracking-wide h-16 md:h-auto">
                        Pack Documents
                    </Link>
                </div>
            </div>
        </div>
    );
}

