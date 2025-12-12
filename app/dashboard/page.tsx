"use client";

import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { Label } from "@radix-ui/react-label";
import {
    Activity,
    Filter,
    Grid3x3,
    List,
    Plus,
    ShieldCheck,
    SquareKanban,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function DashboardPage() {
    const { user } = useUser();
    const { supabase } = useSupabase();
    const { allBoards, createBoard, boards, loadBoards, loading, error } = useBoards();
    const [view, setView] = useState<"grid" | "list">("grid");
    const [filter, setFilter] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const pageSize = 7;
    const [filters, setFilters] = useState({
        search: "",
        dateRange: {
            start: null as string | null,
            end: null as string | null,
        },
    });

    const FilteredBoards = boards.filter((v: Board) => {
        const matchesSearch = v.title
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        const matchesDateRange =
            (!filters.dateRange.start ||
                new Date(v.created_at) >= new Date(filters.dateRange.start)) &&
            (!filters.dateRange.end ||
                new Date(v.created_at) <= new Date(filters.dateRange.end));

        return matchesSearch && matchesDateRange;
    });

    const ClearFilters = () => {
        setFilters({
            search: "",
            dateRange: {
                start: null as string | null,
                end: null as string | null,
            },
        });
    };

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        if (user) {
            loadBoards(from, to, setTotalPages, pageSize);
        }
    }, [user, supabase, page]);

    const CreateBoardFunc = async () => {
        createBoard({ title: "New" });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] via-white to-[#F5F5F7]">
            <Navbar />

            <main className="container mx-auto p-4 sm:p-6 text-[#1D1D1F]">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl mb-2 sm:mb-3 font-bold">
                        Welcome back,{" "}
                        {user?.firstName ?? user?.emailAddresses[0].emailAddress}!
                    </h1>
                </div>

                <div className="grid grid-cols md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <Card className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition duration-150">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-md md:text-lg font-medium mb-1 sm:mb-2">
                                        Total Boards
                                    </p>

                                    <p className="text-xl sm:text-2xl font-bold">
                                        {allBoards?.length ?? 0}
                                    </p>
                                </div>

                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#007AFF] rounded-lg flex items-center justify-center">
                                    <SquareKanban className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition duration-150">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between ">
                                <div>
                                    <p className="text-sm sm:text-md md:text-lg font-medium mb-1 sm:mb-2">
                                        Active Projects
                                    </p>

                                    <p className="text-xl sm:text-2xl font-bold">
                                        {allBoards.length}
                                    </p>
                                </div>

                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#34C759] rounded-lg flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition duration-150">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm sm:text-md md:text-lg font-medium mb-1 sm:mb-2">
                                        Recent Activity
                                    </p>

                                    <p className="text-xl sm:text-2xl font-bold">
                                        {
                                            allBoards.filter((v) => {
                                                const updatedAt = new Date(v.updated_at);
                                                const oneWeekAgo = new Date();
                                                oneWeekAgo.setDate(oneWeekAgo.getDate() - 2);
                                                return updatedAt > oneWeekAgo;
                                            }).length
                                        }
                                    </p>
                                </div>

                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-[#0066CC] rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                        <div className="mb-2 sm:mb-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mb-1 sm:mb-2">
                                Your Boards
                            </h2>

                            <p className="text-[#6E6E73]">
                                Manage your projects and tasks efficiently
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="flex items-center space-x-2 rounded bg-white border p-1">
                                <Button
                                    size="sm"
                                    variant={"outline"}
                                    className={
                                        view === "grid"
                                            ? "bg-[#007AFF] text-white hover:bg-[#0066CC] hover:text-white transition-colors cursor-pointer"
                                            : "bg-white text-black hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                    }
                                    onClick={() => setView("grid")}
                                >
                                    <Grid3x3 />
                                </Button>

                                <Button
                                    size="sm"
                                    variant={"outline"}
                                    className={
                                        view === "list"
                                            ? "bg-[#007AFF] text-white hover:bg-[#0066CC] hover:text-white transition-colors cursor-pointer"
                                            : "bg-white text-black hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                    }
                                    onClick={() => setView("list")}
                                >
                                    <List />
                                </Button>
                            </div>

                            <Button
                                className="bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                size="sm"
                                onClick={() => setFilter(true)}
                            >
                                <Filter />
                                Filter
                            </Button>

                            <Button
                                className="bg-[#0066CC] text-white hover:bg-[#007AFF] transition-colors cursor-pointer"
                                size="sm"
                                onClick={CreateBoardFunc}
                            >
                                <Plus />
                                Create Board
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div>
                        <p>Loading...</p>
                    </div>
                ) : error ? (
                    <div>
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        {!boards || boards.length === 0 ? (
                            <div>
                                <p>No boards yet</p>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={
                                        view === "grid"
                                            ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
                                            : `flex flex-col gap-4`
                                    }
                                >
                                    {FilteredBoards.map((v: any, i: any) => {
                                        return (
                                            <Link href={`/board/${v.id}`} key={i}>
                                                <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.16)] transition-shadow cursor-pointer group min-h-60">
                                                    <CardHeader className="pb-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className={`w-6 h-6 ${v.color} rounded`} />

                                                            {new Date(v.created_at).getTime() >
                                                                Date.now() - 24 * 60 * 60 * 1000 && (
                                                                    <Badge className="text-sm" variant="secondary">
                                                                        New
                                                                    </Badge>
                                                                )}
                                                        </div>
                                                    </CardHeader>

                                                    <CardContent className="p-2 sm:p-4">
                                                        <CardTitle className="text-md sm:text-lg mb-2 group-hover:text-[#0066CC] transition-colors">
                                                            {view === "grid" && v?.title?.length > 15
                                                                ? v.title.slice(0, 15) + "..."
                                                                : v.title}
                                                        </CardTitle>

                                                        <CardDescription className="mb-2 text-[#6E6E73]">
                                                            <p className="text-sm">
                                                                {view === "grid" && v?.description?.length > 25
                                                                    ? v.description.slice(0, 25) + "..."
                                                                    : v.description}
                                                            </p>

                                                            <p className="text-md flex-1 text-right">
                                                                {v?.author &&
                                                                    view === "grid" &&
                                                                    v?.author?.length > 15
                                                                    ? `- ${v.author.slice(0, 15)} ...`
                                                                    : v?.author
                                                                        ? `- ${v.author}`
                                                                        : ""}
                                                            </p>
                                                        </CardDescription>

                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-[#6E6E73]">
                                                            <span>
                                                                Created{" "}
                                                                {new Date(v.created_at).toLocaleDateString()}
                                                            </span>

                                                            <span>
                                                                Updated{" "}
                                                                {new Date(v.updated_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        );
                                    })}

                                    <Card
                                        className="border-2 border-dashed border-[#D2D2D7] hover:border-[#007AFF] shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.16)] transition-shadow cursor-pointer group h-60"
                                        onClick={CreateBoardFunc}
                                    >
                                        <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                                            <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-[#6E6E73] group-hover:text-[#007AFF] mb-2" />
                                            <p className="text-sm sm:text-base text-[#6E6E73] group-hover:text-[#007AFF] font-medium">
                                                Create new board
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="flex items-center justify-center mt-6">
                                    <Button
                                        size="sm"
                                        className="w-18 bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>

                                    <span className="text-sm m-2 text-[#6E6E73]">
                                        Page {page} of {totalPages}
                                    </span>

                                    <Button
                                        size="sm"
                                        className="w-18 bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                )}

                <Dialog
                    open={filter}
                    onOpenChange={setFilter}
                >
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto text-[#1D1D1F]">
                        <DialogHeader className="px-4">
                            <DialogTitle className="text-md sm:text-xl">
                                Filter Boards
                            </DialogTitle>

                            <p className="text-md text-[#6E6E73]">
                                Search and sort boards by title or date.
                            </p>
                        </DialogHeader>

                        <div className="px-2">
                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Search
                                </Label>

                                <Input
                                    id="search"
                                    placeholder="Search board titles..."
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            search: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Date Range
                                </Label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-sm">
                                            Start Date
                                        </Label>

                                        <Input
                                            type="date"
                                            value={filters.dateRange.start ?? ""}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateRange: {
                                                        ...prev.dateRange,
                                                        start: e.target.value || null,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-sm">
                                            End Date
                                        </Label>

                                        <Input
                                            type="date"
                                            value={filters.dateRange.end ?? ""}
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    dateRange: {
                                                        ...prev.dateRange,
                                                        end: e.target.value || null,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between pt-4 p-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-black hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                    onClick={ClearFilters}
                                >
                                    Clear Filters
                                </Button>

                                <Button
                                    size="sm"
                                    className="bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                    onClick={() => setFilter(false)}
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
