"use client";

import { useEffect, useState } from "react";
import { Board } from "../supabase/models";
import { useUser } from "@clerk/nextjs";
import { boardDataService, boardService, taskService } from "../services";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [allBoards, setAllBoards] = useState<Board[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [allError, setAllError] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [errors, setErrors] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadAllBoards();
    }
  }, [user, supabase]);

  async function loadAllBoards() {
    if (!user) {
      return;
    }
    try {
      setAllLoading(true);
      setAllError(null);
      const data = await boardService.getAllBoards(supabase!, user.id);
      setAllBoards(data ?? []);
      setAllLoading(false);
    } catch (err) {
      setAllError("Failed to load boards.");
      console.log(err);
      setAllLoading(false);
    }
  }

  async function loadBoards(
    from: number,
    to: number,
    setTotalPages: React.Dispatch<React.SetStateAction<number>>,
    pageSize: number
  ) {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      const data = await boardService.getBoards(supabase!, user.id, from, to);
      setBoards(data.data ?? []);
      setLoading(false);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch (err) {
      console.log(
        err instanceof Error ? err.message : "Failed to load boards."
      );
      setError(
        err instanceof Error
          ? err.message === "Cannot read properties of null (reading 'from')"
            ? ""
            : err.message || ""
          : "Failed to load boards."
      );
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
    author?: string;
  }) {
    if (!user) {
      throw new Error("User not authenticated");
    }
    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [...prev, newBoard]);
    } catch (err) {
      setErrors("Failed to create board.");
    }
  }

  return {
    loadAllBoards,
    allLoading,
    allBoards,
    allError,
    boards,
    loading,
    error,
    createBoard,
    loadBoards,
  };
}
