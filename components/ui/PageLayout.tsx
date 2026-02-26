import React from "react";

interface PageLayoutProps {
    children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
        </div>
    );
}
