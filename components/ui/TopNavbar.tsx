"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Clock, Building2, LayoutDashboard } from "lucide-react";
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
        : { href: riwayatHref, label: "Riwayat", Icon: Clock };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
            <div className="grid h-14 w-full grid-cols-3 items-center px-6">

                {/* Left: Logo */}
                <div className="flex items-center">
                    <Link href={dashboardHref} className="flex items-center">
                        <span className="text-xl font-extrabold tracking-tight text-zinc-900">
                            HYDE
                        </span>
                    </Link>
                </div>

                {/* Center: Context-aware nav link */}
                <div className="flex items-center justify-center">
                    <Link
                        href={centerLink.href}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        <centerLink.Icon size={14} className="text-zinc-400" />
                        {centerLink.label}
                    </Link>
                </div>

                {/* Right: Profile dropdown */}
                <div className="flex items-center justify-end">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
                            aria-expanded={open}
                            aria-haspopup="true"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white select-none">
                                {initials}
                            </span>
                            <span className="hidden max-w-[120px] truncate text-sm font-medium text-zinc-800 sm:block">
                                {user.name.split(" ")[0]}
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                            />
                        </button>

                        {/* Dropdown panel */}
                        {open && (
                            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1 shadow-xl ring-1 ring-black/5">
                                {/* User info header */}
                                <div className="px-3 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                                            {initials}
                                        </span>
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
                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
                                >
                                    <centerLink.Icon size={15} className="text-zinc-400" />
                                    {centerLink.label}
                                </Link>

                                <div className="my-1 h-px bg-zinc-100" />

                                {/* Logout */}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                >
                                    <LogOut size={15} />
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </nav>
    );
}
