"use client";

import React, { useState, useEffect } from "react";

export function TerminalSearchTrigger() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
                console.log("Command palette toggled via keyboard shortcut");
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleClick = () => {
        setIsOpen(true);
        console.log("Command palette opened via click");
    };

    return (
        <button
            onClick={handleClick}
            className="group flex items-center bg-transparent border-b-2 border-transparent hover:border-black/50 dark:hover:border-white/50 transition-colors duration-200 px-2 py-1 cursor-pointer focus:outline-none"
            aria-label="Open command palette"
        >
            <span className="font-mono text-sm sm:text-base text-black dark:text-gray-200 tracking-wider">
                [ ⌘K ] | &gt; SEARCH DESTINATION...
                <span className="animate-pulse">_</span>
            </span>
        </button>
    );
}
