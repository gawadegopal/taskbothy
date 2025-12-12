"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";

export default function Navbar() {
    const { isSignedIn, user } = useUser();
    const pathname = usePathname();

    const isDashboard = pathname === "/dashboard";
    const isBoard = pathname.startsWith("/board/");

    if (isDashboard) {
        return (
            <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 text-[#1D1D1F]">
                <div className="container mx-auto p-6 flex items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-xl sm:text-2xl font-semibold`}>
                            TaskBothy
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        {isSignedIn && (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm sm:text-md hidden sm:block">
                                    Welcome,{" "}
                                    {user.firstName ?? user.emailAddresses[0].emailAddress}
                                </span>

                                <UserButton />
                            </div>
                        )}
                    </div>
                </div>
            </header>
        );
    }

    return (
        <div>
            <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 text-[#1D1D1F]">
                <div className="container mx-auto p-6 flex items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-xl sm:text-2xl font-semibold`}>
                            TaskBothy
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        {isSignedIn ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm sm:text-[16px] hidden sm:block">
                                    Welcome,{" "}
                                    {user.firstName ?? user.emailAddresses[0].emailAddress}
                                </span>

                                <Link href="/dashboard">
                                    <Button
                                        size="sm"
                                        className="p-2 cursor-pointer bg-[#007AFF] text-white hover:bg-[#0066CC] hover:text-white transition-colors"
                                    >
                                        <span className="text-sm sm:text-[16px] p-1">
                                            {isBoard ? "Back" : "Go"} to Dashboard
                                        </span>
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <SignInButton>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white text-black hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                    >
                                        <span className="p-2 text-sm sm:text-[16px]">
                                            Sign In
                                        </span>
                                    </Button>
                                </SignInButton>
                                <SignUpButton>
                                    <Button
                                        size="sm"
                                        className="p-2 cursor-pointer bg-[#007AFF] text-white hover:bg-[#0066CC] hover:text-white transition-colors"
                                    >
                                        <span className="p-1 text-sm sm:text-[16px]">
                                            Sign Up
                                        </span>
                                    </Button>
                                </SignUpButton>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </div>
    );
}
