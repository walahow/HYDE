"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Power, Building2, LayoutDashboard } from "lucide-react";
import type { UserProfile } from "@/lib/types";

interface TopNavbarProps {
    user: UserProfile;
}

export default function TopNavbar({ user }: TopNavbarProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

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

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const isOnRiwayat = pathname.endsWith("/riwayat");
    const dashboardHref = user.role === "admin" ? "/admin" : "/";
    const riwayatHref = user.role === "admin" ? "/admin/riwayat" : "/riwayat";

    const centerLink = isOnRiwayat
        ? { href: dashboardHref, label: "Dashboard", Icon: LayoutDashboard }
        : { href: riwayatHref, label: "DIR: history", Icon: null };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
            <div className="grid h-14 w-full grid-cols-3 items-center px-6">

                {/* Left: Logo */}
                <div className="flex items-center">
                    <Link href={dashboardHref} className="flex items-baseline gap-1 group">
                        <span className="text-xl font-extrabold tracking-tight text-zinc-900">
                            HYDE
                        </span>
                        <span className="text-[10px] font-mono font-light text-zinc-400 tracking-tight">
                            SYS.v1.0
                        </span>
                    </Link>
                </div>

                {/* Center: Context-aware nav link */}
                <div className="flex items-center justify-center">
                    <Link
                        href={centerLink.href}
                        className="flex items-center gap-1.5 rounded-none px-4 py-2 text-base font-light font-mono text-zinc-500 transition-colors hover:bg-black hover:text-white"
                    >
                        {centerLink.Icon && <centerLink.Icon size={14} className="text-zinc-400 group-hover:text-white transition-colors" />}
                        {centerLink.label}
                    </Link>
                </div>

                {/* Right: Profile dropdown */}
                <div className="flex items-center justify-end">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className="group flex items-center gap-2 rounded-none bg-transparent px-4 py-2 text-base font-bold font-mono text-zinc-700 transition-colors hover:bg-black hover:text-white"
                            aria-expanded={open}
                            aria-haspopup="true"
                        >
                            <span>
                                [ ID: {user.name.split(" ")[0]} ]
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-zinc-400 transition-transform duration-200 group-hover:text-white ${open ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown panel */}
                        {open && (
                            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-none border border-zinc-200 bg-white p-1 shadow-xl ring-1 ring-black/5">
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

                                {/* Contextual link inside dropdown too */}
                                <Link
                                    href={centerLink.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 rounded-none px-3 py-2 text-sm font-mono text-zinc-700 transition-colors hover:bg-black hover:text-white"
                                >
                                    {centerLink.Icon && <centerLink.Icon size={15} className="text-zinc-400 group-hover:text-white transition-colors" />}
                                    {centerLink.label}
                                </Link>

                                <div className="my-1 h-px bg-zinc-100" />

                                {/* Logout */}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 rounded-none px-3 py-2 text-sm font-mono font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
                                >
                                    <span>[</span>
                                    <Power size={14} strokeWidth={3} />
                                    <span>LOG OUT ]</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
}
