"use client";

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-stretch justify-between bg-gradient-to-br from-[#F5F5F7] via-white to-[#F5F5F7]">
            <Navbar />
            <div className='w-full flex flex-col items-center justify-center gap-2'>
                <h1 className="text-2xl sm:text-3xl mb-2 sm:mb-3 font-bold">
                    Something Went Wrong...
                </h1>

                <Link href={'/'}>
                    <Button
                        className="bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                        size="sm"
                    >
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <Footer />
        </div>
    )
}
