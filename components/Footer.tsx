import React from "react";

export default function Footer() {
    return (
        <footer className="bg-white/70 backdrop-blur-xl border-b border-[#e5e7eb] shadow-[0_8px_24px_rgba(0,0,0,0.06)] px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
            <div className="container mx-auto p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center">
                <div>
                    <span className="text-xl font-bold">
                        TaskBothy
                    </span>
                </div>

                <div>
                    <span>
                        ©2025 TaskBothy. All rights reserved.
                    </span>
                </div>
            </div>
        </footer>
    );
}
