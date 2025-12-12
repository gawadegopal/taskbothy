"use client";

import { useEffect, useState } from "react";
import { Board, ColumnWithTasks, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";
import { boardDataService, boardService, taskService } from "../services";

export function useBoard(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase]);

  async function loadBoard() {
    if (!boardId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithColumns(
        supabase!,
        boardId
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError("Failed to load board.");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError("Failed to update the board.");
    }
  }

  async function createNewTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority?: "backlog" | "low" | "medium" | "high" | "critical";
    }
  ) {
    try {
      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order: columns.find((v) => v.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((v) =>
          v.id === columnId ? { ...v, tasks: [...v.tasks, newTask] } : v
        )
      );
      return newTask;
    } catch (err) {
      setError("Failed to create the task.");
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);

    setColumns((prev) => {
      const newColumns = [...prev];

      let taskToMove: Task | null = null;

      for (const v of newColumns) {
        const taskIndex = v.tasks.findIndex((task) => task.id === taskId);

        if (taskIndex !== -1) {
          taskToMove = v.tasks[taskIndex];
          v.tasks.splice(taskIndex, 1);
          break;
        }
      }

      if (taskToMove) {
        const targetColumn = newColumns.find((col) => col.id === newColumnId);

        if (targetColumn) {
          targetColumn.tasks.splice(newOrder, 0, taskToMove);
        }
      }
      return newColumns;
    });
  }

  async function deleteBoard(boardId: string) {
    try {
      await boardService.deleteBoard(supabase!, boardId);
    } catch (err) {
      throw new Error("Failed to delete board!");
    }
  }

  return {
    loading,
    error,
    board,
    columns,
    setColumns,
    updateBoard,
    createNewTask,
    moveTask,
    loadBoard,
    deleteBoard,
  };
}
