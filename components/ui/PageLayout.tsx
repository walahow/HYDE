import React from "react";

interface PageLayoutProps {
    children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-transparent pointer-events-none">
            <div className="mx-auto max-w-5xl px-6 py-10 pointer-events-auto">{children}</div>
        </div>
    );
}
