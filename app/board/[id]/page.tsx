"use client";

import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoard";
import { taskService } from "@/lib/services";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import {
    Calendar,
    Delete,
    Edit,
    Plus,
    Trash,
    User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    rectIntersection,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const { supabase } = useSupabase();
    const router = useRouter();
    const {
        board,
        updateBoard,
        columns,
        setColumns,
        createNewTask,
        loadBoard,
        moveTask,
        deleteBoard,
    } = useBoard(id);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [addTask, setAddTask] = useState<boolean>(false);
    const [editTask, setEditTask] = useState<boolean>(false);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const [boardForm, setBoardForm] = useState({
        title: "",
        description: "",
        author: "",
        color: "",
    });

    const [taskForm, setTaskForm] = useState({
        id: "",
        title: "",
        description: "",
        assignee: "",
        priority: "medium" as "backlog" | "low" | "medium" | "high" | "critical",
        dueDate: "",
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (e: DragStartEvent) => {
        const taskId = e.active.id as string;
        const task = columns
            .flatMap((col) => col.tasks)
            .find((task) => task.id === taskId);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragOver = (e: DragOverEvent) => {
        const { active, over } = e;
        if (!over) {
            return;
        }
        const activeId = active.id as string;
        const overId = over.id as string;
        const sourceColumn = columns.find((col) =>
            col.tasks.some((task) => task.id === activeId)
        );
        const targetColumn = columns.find((col) =>
            col.tasks.some((task) => task.id === overId)
        );
        if (!sourceColumn || !targetColumn) {
            return;
        }
        if (sourceColumn.id === targetColumn.id) {
            const activeIndex = sourceColumn.tasks.findIndex(
                (task) => task.id === activeId
            );
            const overIndex = targetColumn.tasks.findIndex(
                (task) => task.id === overId
            );
            if (activeIndex !== overIndex) {
                setColumns((prev: ColumnWithTasks[]) => {
                    const newColumns = [...prev];
                    const column = newColumns.find((col) => col.id === sourceColumn.id);
                    if (column) {
                        const tasks = [...column.tasks];
                        const [removed] = tasks.splice(activeIndex, 1);
                        tasks.splice(overIndex, 0, removed);
                        column.tasks = tasks;
                    }
                    return newColumns;
                });
            }
        }
    };

    const handleDragEnd = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (!over) {
            return;
        }
        const taskId = active.id as string;
        const overId = over.id as string;
        const targetColumn = columns.find((col) => col.id === overId);
        if (targetColumn) {
            const sourceColumn = columns.find((col) =>
                col.tasks.some((task) => task.id === taskId)
            );
            if (sourceColumn && sourceColumn.id !== targetColumn.id) {
                await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
            }
        } else {
            const sourceColumn = columns.find((col) =>
                col.tasks.some((task) => task.id === taskId)
            );
            const targetColumn = columns.find((col) =>
                col.tasks.some((task) => task.id === overId)
            );
            if (sourceColumn && targetColumn) {
                const oldIndex = sourceColumn.tasks.findIndex(
                    (task) => task.id === taskId
                );
                const newIndex = targetColumn.tasks.findIndex(
                    (task) => task.id === overId
                );
                if (oldIndex !== newIndex) {
                    await moveTask(taskId, targetColumn.id, newIndex);
                }
            }
        }
    };

    const DeleteBoard = async () => {
        try {
            await deleteBoard(id);
            router.replace("/dashboard");
        } catch (err) {
            alert("Something went wrong while deleting the board. Please try again.");
        }
    };

    useEffect(() => {
        if (board) {
            setBoardForm({
                title: board.title || "",
                description: board.description || "",
                author: board.author || "",
                color: board.color || "",
            });
        }
    }, [isEdit]);

    const LoadTask = async (id: string) => {
        if (!id) {
            return;
        }

        try {
            const data = await taskService.getTask(supabase!, id);
            setTaskForm({
                id: data.id,
                title: data.title || "",
                description: data.description || "",
                assignee: data.assignee || "",
                priority: data.priority || "medium",
                dueDate: data.due_date || "",
            });
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (editTask && taskForm.id) {
            LoadTask(taskForm.id);
        }
    }, [editTask, taskForm.id]);

    const UpdateBoardFunc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!boardForm.title.trim() || !board) {
            return;
        }

        try {
            await updateBoard(board.id, {
                title: boardForm.title.trim(),
                description: boardForm.description.trim(),
                author: boardForm.author.trim(),
                color: boardForm.color || board.color,
            });
            setIsEdit(false);
        } catch (err) {
            alert("Something went wrong while updating the board. Please try again.");
        }
    };

    const CreateTaskFunc = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const taskData = {
            title: formData.get("title") as string,
            description: (formData.get("description") as string) || undefined,
            assignee: (formData.get("assignee") as string) || undefined,
            dueDate: (formData.get("dueDate") as string) || undefined,
            priority:
                (formData.get("priority") as typeof taskForm.priority) || "medium",
        };

        if (!taskData.title.trim()) {
            return;
        }

        const targetColumn = columns[0];
        if (!targetColumn) {
            alert(
                "Something went wrong: No column available to add a task. Please create a column first."
            );
        }

        await createNewTask(targetColumn.id, taskData);
        setAddTask(false);
    };

    const UpdateTaskFunc = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await taskService.updateTask(supabase!, taskForm.id, {
                title: taskForm.title,
                description: taskForm.description,
                assignee: taskForm.assignee,
                priority: taskForm.priority,
                due_date: taskForm.dueDate,
            });
            await loadBoard();
            setEditTask(false);
        } catch (err) {
            alert("Something went wrong while updating the task. Please try again.");
        }
    };

    const DeleteTaskFunc = async (id: string) => {
        try {
            await taskService.deleteTask(supabase!, id);
            await loadBoard();
        } catch (err) {
            alert("Something went wrong while deleting the task. Please try again.");
        }
    };

    function ColumnFunc({
        col,
        children,
    }: {
        col: ColumnWithTasks;
        children: React.ReactNode;
    }) {
        const { setNodeRef, isOver } = useDroppable({ id: col.id });
        return (
            <div
                ref={setNodeRef}
                className={`w-full lg:flex-shrink-0 lg:w-80 sm:min-h-80 ${isOver ? "bg-blue-50 rounded-lg" : ""}`}
            >
                <div className={`bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.16)] transition-shadow cursor-pointer border`}>
                    <div className="p-3 sm:p-4 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center m-2">
                                <h3 className="font-semibold text-[#1D1D1F] text-sm sm:text-base truncate">
                                    {col.title}
                                </h3>

                                <Badge variant="secondary" className="text-sm flex-shrink-0">
                                    {col?.tasks.length}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        {children}
                    </div>
                </div>
            </div>
        );
    }

    function TaskFunc({ task }: { task: Task }) {
        const getPriorityColor = (
            priority: "backlog" | "low" | "medium" | "high" | "critical"
        ): string => {
            switch (priority) {
                case "backlog":
                    return "bg-[#6E6E73]";
                case "low":
                    return "bg-[#34C759]";
                case "medium":
                    return "bg-[#FFCC00]";
                case "high":
                    return "bg-[#FF9500]";
                case "critical":
                    return "bg-[#FF3B30]";
                default:
                    return "bg-[#FFCC00]";
            }
        };

        return (
            <div>
                <Card className="cursor-pointer hover:shadow-md transition-shadow mb-2">
                    <CardContent className="p-2">
                        <div className="p-2">
                            <div className="flex items-start justify-between gap-1">
                                <h4 className="font-medium text-[#1D1D1F] text-sm flex-1 pr-2">
                                    {task.title}
                                </h4>

                                <div className="flex gap-2">
                                    <Edit
                                        className="h-4 w-4 text-[#0066CC]"
                                        onClick={() => {
                                            setEditTask(true);
                                            setTaskForm((prev) => ({ ...prev, id: task.id }));
                                        }}
                                    />

                                    <Trash
                                        className="h-4 w-4 text-[#FF3B30]"
                                        onClick={() => DeleteTaskFunc(task.id)}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-[#6E6E73] mt-1">
                                {task?.description}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                    {task.assignee && (
                                        <div className="flex items-center space-x-1 text-xs text-[#6E6E73]">
                                            <User className="h-4 w-4" />

                                            <span>
                                                {task.assignee}
                                            </span>
                                        </div>
                                    )}

                                    {task.due_date && (
                                        <div className="flex items-center space-x-1 text-xs text-[#6E6E73]">
                                            <Calendar className="h-3 w-3" />
                                            <span className="truncate">
                                                {task.due_date}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    function SortTaskFunc({ task }: { task: Task }) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: task.id });

        const styles = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        const getPriorityColor = (
            priority: "backlog" | "low" | "medium" | "high" | "critical"
        ): string => {
            switch (priority) {
                case "backlog":
                    return "bg-[#6E6E73]";
                case "low":
                    return "bg-[#34C759]";
                case "medium":
                    return "bg-[#FFCC00]";
                case "high":
                    return "bg-[#FF9500]";
                case "critical":
                    return "bg-[#FF3B30]";
                default:
                    return "bg-[#FFCC00]";
            }
        };

        return (
            <div
                ref={setNodeRef}
                style={styles} {...listeners} {...attributes}
            >
                <Card className="cursor-pointer hover:shadow-md transition-shadow mb-2">
                    <CardContent className="p-2">
                        <div className="p-2">
                            <div className="flex items-start justify-between gap-1">
                                <h4 className="font-medium text-[#1D1D1F] text-sm flex-1 pr-2">
                                    {task.title}
                                </h4>

                                <div className="flex gap-2">
                                    <Edit
                                        className="h-4 w-4 text-[#0066CC]"
                                        onClick={() => {
                                            setEditTask(true);
                                            setTaskForm((prev) => ({ ...prev, id: task.id }));
                                        }}
                                    />

                                    <Trash
                                        className="h-4 w-4 text-[#FF3B30]"
                                        onClick={() => DeleteTaskFunc(task.id)}
                                    />
                                </div>
                            </div>

                            <p className="text-xs text-[#6E6E73] mt-1">
                                {task?.description}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                    {task.assignee && (
                                        <div className="flex items-center space-x-1 text-xs text-[#6E6E73]">
                                            <User className="h-4 w-4" />

                                            <span>
                                                {task.assignee}
                                            </span>
                                        </div>
                                    )}

                                    {task.due_date && (
                                        <div className="flex items-center space-x-1 text-xs text-[#6E6E73]">
                                            <Calendar className="h-3 w-3" />
                                            <span className="truncate">
                                                {task.due_date}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F5F7] via-white to-[#F5F5F7]">
            <Navbar />

            <main className="container mx-auto p-4 sm:p-6 text-[#1D1D1F]">
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col items-stretch sm:items-end mb-4 sm:mb-6">
                        <Card className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:translate-y-[-2px] transition duration-150 w-full">
                            <CardContent className="p-4 sm:p-6">
                                <CardTitle className="flex items-center justify-start gap-2 text-md sm:text-lg mb-2">
                                    <div className={`w-6 h-6 ${board?.color} rounded`} />

                                    <span>
                                        {board?.title}
                                    </span>
                                </CardTitle>

                                <p className="text-[#6E6E73] text-sm sm:text-md">
                                    <span className="mb-1">
                                        Total Tasks:{" "}
                                        {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
                                    </span>
                                    <br />

                                    {board?.description}
                                </p>

                                <div className="flex-1 text-sm text-right pr-4 pt-2">
                                    <span>{board?.author ? `- ${board?.author}` : ""}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                            <Button
                                className="bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                size="sm"
                                onClick={() => setIsEdit(true)}
                            >
                                <Edit />
                                Edit Board
                            </Button>

                            <Button
                                className="bg-[#0066CC] text-white hover:bg-[#007AFF] transition-colors cursor-pointer"
                                size="sm"
                                onClick={() => setAddTask(true)}
                            >
                                <Plus />
                                Create Task
                            </Button>

                            <Button
                                className="bg-[#FF3B30] text-white hover:bg-[#FF3B30] transition-colors cursor-pointer"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Delete this board?")) {
                                        DeleteBoard();
                                    }
                                }}
                            >
                                <Delete />
                                Delete Board
                            </Button>
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex flex-col lg:flex-row lg:overflow-x-auto gap-4 pb-4">
                            {columns.map((v, i) => (
                                <ColumnFunc key={i} col={v}>
                                    <SortableContext
                                        items={v.tasks.map((task) => task.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {v?.tasks?.map((task, i) => (
                                            <SortTaskFunc key={i} task={task} />
                                        ))}
                                    </SortableContext>
                                </ColumnFunc>
                            ))}

                            <DragOverlay>
                                {activeTask ?
                                    <TaskFunc task={activeTask} /> :
                                    null
                                }
                            </DragOverlay>
                        </div>
                    </DndContext>
                </div>

                <Dialog open={isEdit} onOpenChange={setIsEdit}>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto text-[#1D1D1F]">
                        <DialogHeader className="px-4">
                            <DialogTitle className="text-md sm:text-xl">
                                Edit Board
                            </DialogTitle>
                        </DialogHeader>

                        <form className="px-2" onSubmit={UpdateBoardFunc}>
                            <div className="p-2">
                                <Label htmlFor="boardTitle" className="text-md sm:text-lg">
                                    Board Title *
                                </Label>

                                <Input
                                    id="boardTitle"
                                    value={boardForm.title}
                                    onChange={(e) =>
                                        setBoardForm({ ...boardForm, title: e.target.value })
                                    }
                                    placeholder="Enter board title"
                                    required
                                />
                            </div>

                            <div className="p-2">
                                <Label
                                    htmlFor="boardDescription"
                                    className="text-md sm:text-lg"
                                >
                                    Board Description *
                                </Label>

                                <Input
                                    id="boardDescription"
                                    value={boardForm.description}
                                    onChange={(e) =>
                                        setBoardForm({ ...boardForm, description: e.target.value })
                                    }
                                    placeholder="Enter board description"
                                    required
                                />
                            </div>

                            <div className="p-2">
                                <Label htmlFor="boardAuthor" className="text-md sm:text-lg">
                                    Board Author *
                                </Label>

                                <Input
                                    id="boardAuthor"
                                    value={boardForm.author}
                                    onChange={(e) =>
                                        setBoardForm({ ...boardForm, author: e.target.value })
                                    }
                                    placeholder="Enter board author"
                                    required
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">Board Color</Label>

                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                                    {[
                                        "bg-[#6E6E73]",
                                        "bg-[#007AFF]",
                                        "bg-[#34C759]",
                                        "bg-[#FF3B30]",
                                        "bg-[#FFCC00]",
                                        "bg-[#0066CC]",
                                        "bg-[#1D1D1F]",
                                        "bg-[#A1A1A6]",
                                    ].map((color, key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`w-8 h-8 rounded-full ${color} ${color === boardForm.color ? "ring-2 ring-offset-2 ring-[#1D1D1F]" : ""}`}
                                            onClick={() => setBoardForm({ ...boardForm, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between pt-4 p-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-black hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                    onClick={() => setIsEdit(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="sm"
                                    className="bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={addTask} onOpenChange={setAddTask}>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto text-[#1D1D1F]">
                        <DialogHeader className="px-4">
                            <DialogTitle className="text-md sm:text-xl">
                                Add Task
                            </DialogTitle>

                            <p className="text-md text-[#6E6E73]">
                                Add a task to the board
                            </p>
                        </DialogHeader>

                        <form className="px-2" onSubmit={CreateTaskFunc}>
                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Title *
                                </Label>

                                <Input
                                    id="title"
                                    name="title"
                                    placeholder="Enter task title"
                                    required
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Description
                                </Label>

                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter task description"
                                    rows={3}
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Assignee *
                                </Label>

                                <Input
                                    id="assignee"
                                    name="assignee"
                                    placeholder="Who should do this?"
                                    required
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Priority
                                </Label>

                                <Select
                                    name="priority"
                                    defaultValue="medium"
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {["backlog", "low", "medium", "high", "critical"].map(
                                            (priority) => (
                                                <SelectItem key={priority} value={priority}>
                                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Due Date *
                                </Label>

                                <Input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    required
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between pt-4 p-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-black hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setAddTask(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="sm"
                                    className="bg-[#007AFF] text-white hover:bg-[#0066CC] transition-colors cursor-pointer"
                                    type="submit"
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={editTask} onOpenChange={setEditTask}>
                    <DialogContent className="w-[95vw] max-w-[425px] mx-auto text-[#1D1D1F]">
                        <DialogHeader className="px-4">
                            <DialogTitle className="text-md sm:text-xl">
                                Edit Task
                            </DialogTitle>

                            <p className="text-md text-[#6E6E73]">
                                Add a task to the board
                            </p>
                        </DialogHeader>

                        <form className="px-2" onSubmit={UpdateTaskFunc}>
                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Title *
                                </Label>

                                <Input
                                    id="title"
                                    value={taskForm.title}
                                    required
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, title: e.target.value })
                                    }
                                    placeholder="Enter task title"
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Description
                                </Label>

                                <Textarea
                                    id="description"
                                    placeholder="Enter task description"
                                    rows={3}
                                    value={taskForm.description}
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, description: e.target.value })
                                    }
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Assignee *
                                </Label>

                                <Input
                                    id="assignee"
                                    placeholder="Who should do this?"
                                    required
                                    value={taskForm.assignee}
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, assignee: e.target.value })
                                    }
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Due Date *
                                </Label>

                                <Input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    required
                                    value={taskForm.dueDate}
                                    onChange={(e) =>
                                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                                    }
                                />
                            </div>

                            <div className="p-2">
                                <Label className="text-md sm:text-lg">
                                    Priority
                                </Label>

                                <Select
                                    value={taskForm.priority}
                                    onValueChange={(v) =>
                                        setTaskForm({
                                            ...taskForm,
                                            priority: v as typeof taskForm.priority,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {["backlog", "low", "medium", "high", "critical"].map(
                                            (p) => (
                                                <SelectItem key={p} value={p}>
                                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between pt-4 p-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="bg-white text-black hover:bg-[#F5F5F7]"
                                    onClick={() => setEditTask(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    size="sm"
                                    type="submit"
                                    className="bg-[#007AFF] text-white hover:bg-[#0066CC]"
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
