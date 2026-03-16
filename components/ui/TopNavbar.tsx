"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Power, Building2, LayoutDashboard, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile } from "@/lib/types";

interface TopNavbarProps {
    user: UserProfile;
}

export default function TopNavbar({ user }: TopNavbarProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pathname = usePathname();

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setOpen(true);
        }, 150); // Slight delay for elegance
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 300); // Grace period to reach the menu
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isOnRiwayat = pathname.endsWith("/riwayat");
    const dashboardHref = user.role === "ADMIN" ? "/admin" : "/";
    const riwayatHref = user.role === "ADMIN" ? "/admin/riwayat" : "/riwayat";

    const centerLink = isOnRiwayat
        ? { href: dashboardHref, label: "DASHBOARD", Icon: LayoutDashboard }
        : { href: riwayatHref, label: "HISTORY", Icon: History };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
            <div className="flex flex-col md:grid md:h-14 md:grid-cols-3 md:items-center px-4 md:px-6 py-2 md:py-0 gap-2 md:gap-0">

                {/* Left: Logo - Stacks with Profile on mobile */}
                <div className="flex items-center justify-between md:justify-start w-full md:w-auto">
                    <Link href={dashboardHref} className="flex items-baseline gap-1 group py-2 md:py-0">
                        <span className="text-xl font-extrabold tracking-tight text-zinc-900">
                            HYDE
                        </span>
                        <span className="text-[10px] font-mono font-light text-zinc-400 tracking-tight text-nowrap">
                            SYS.v1.0
                        </span>
                    </Link>

                    {/* Profile Dropdown (Mobile) */}
                    <div className="md:hidden flex items-center">
                        <ProfileDropdown user={user} open={open} setOpen={setOpen} dropdownRef={dropdownRef} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
                    </div>
                </div>

                {/* Center: Context-aware nav link - Full width on mobile */}
                <div className="flex items-center justify-center w-full md:w-auto">
                    <Link
                        href={centerLink.href}
                        className="group flex items-center justify-center gap-1.5 rounded-none w-full md:w-auto px-4 h-11 md:h-9 text-sm md:text-base font-light font-mono text-zinc-500 transition-colors hover:bg-black hover:text-white border border-zinc-100 md:border-none"
                    >
                        <span>[ DIR:</span>
                        {centerLink.Icon && <centerLink.Icon size={14} className="text-zinc-400 group-hover:text-white transition-colors" />}
                        <span>{centerLink.label} ]</span>
                    </Link>
                </div>

                {/* Right: Profile dropdown (Desktop Only) */}
                <div className="hidden md:flex items-center justify-end">
                    <ProfileDropdown user={user} open={open} setOpen={setOpen} dropdownRef={dropdownRef} handleMouseEnter={handleMouseEnter} handleMouseLeave={handleMouseLeave} />
                </div>

            </div>
        </nav>
    );
}

function ProfileDropdown({ user, open, setOpen, dropdownRef, handleMouseEnter, handleMouseLeave }: any) {
    return (
        <div
            className="relative group/profile"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className="flex items-center gap-2 rounded-none bg-transparent px-2 md:px-4 h-11 md:h-9 text-sm md:text-base font-bold font-mono text-zinc-700 transition-colors active:bg-zinc-100 md:active:bg-transparent"
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen(!open)}
            >
                <span>
                    ID: {user.name.split(" ")[0]}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-zinc-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute right-0 mt-2 w-64 origin-top-right rounded-none border border-zinc-200 bg-white p-1 shadow-xl ring-1 ring-black/5 z-[60] before:absolute before:-top-4 before:inset-x-0 before:h-4 before:content-['']"
                    >
                        {/* User info header */}
                        <div className="px-3 py-3">
                            <div className="flex flex-col gap-1">
                                <div className="font-mono font-light text-[10px] text-zinc-400">
                                    SECURE_SESSION_ACTIVE
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-zinc-900">
                                        {user.name}
                                    </p>
                                    <p className="truncate text-xs text-zinc-500">{user.nim}</p>
                                </div>
                            </div>
                            {user.institution && (
                                <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-2">
                                    <Building2 size={12} className="shrink-0 text-zinc-400" />
                                    <span className="truncate text-xs text-zinc-600">
                                        {user.institution}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="my-1 h-px bg-zinc-100" />

                        {/* Logout */}
                        <button
                            onClick={() => setOpen(false)}
                            className="flex w-full items-center justify-start gap-2.5 rounded-none px-3 py-3 md:py-2 text-sm font-mono font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                        >
                            <div className="flex items-center gap-2">
                                <span>[</span>
                                <Power size={14} strokeWidth={3} />
                                <span>LOG OUT ]</span>
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
