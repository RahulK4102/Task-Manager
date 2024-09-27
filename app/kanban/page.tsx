"use client"

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Circle, Clock, AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from 'next/navigation'

enum Status {
    TO_DO = "TO_DO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE",
}
enum Priority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH"
}

type Task = {
    id: string
    title: string
    description: string
    status: Status
    priority: Priority
    dueDate: string | null
}

const PRIORITY_COLORS: { [key: string]: string } = {
    'LOW': 'bg-emerald-900 text-emerald-100',
    'MEDIUM': 'bg-amber-900 text-amber-100',
    'HIGH': 'bg-rose-900 text-rose-100'
}

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchTasks()
    }, [loading])

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }
            const response = await fetch('/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setTasks(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching tasks:', err)
            setError(`Failed to fetch tasks. ${err instanceof Error ? err.message : 'Please try again.'}`)
        } finally {
                setLoading(false)
        }
    }

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
    
        if (!destination) return;
    
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
    
        const newTasks = Array.from(tasks);
        const [reorderedTask] = newTasks.splice(source.index, 1);
        const updatedTask = {
            ...reorderedTask,
            status: destination.droppableId as Status
        };
        newTasks.splice(destination.index, 0, updatedTask);
        setTasks(newTasks);
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await fetch(`/api/tasks/${draggableId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedTask),
            });
            if(response.ok){
                setLoading(true)
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (err) {
            console.error('Error updating task status:', err);
            setError('Failed to update task status. ' + (err instanceof Error ? err.message : 'Please try again.'));
            fetchTasks(); 
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-gray-200" />
            </div>
        )
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="mx-auto p-4 space-y-4 bg-gray-900 h-screen text-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-100">Kanban Board</h1>
                    <div className="space-x-2">
                        <Button onClick={fetchTasks} variant="outline" size="sm" className="bg-gray-800 text-gray-100 hover:bg-gray-700">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={() => router.push('/task')} variant="outline" size="sm" className="bg-gray-800 text-gray-100 hover:bg-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Tasks
                        </Button>
                    </div>
                </div>
                {error && (
                    <Alert variant="destructive" className="bg-red-900 text-red-100 border-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Droppable droppableId={Status.TO_DO}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <Card className="bg-gray-800 overflow-hidden border-t-4 border-gray-600">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-semibold text-gray-100">TO DO</CardTitle>
                                        <Badge variant="secondary" className="bg-gray-700 text-gray-100">
                                            {tasks.filter((task) => task.status === Status.TO_DO).length}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {tasks.filter((task) => task.status === Status.TO_DO).map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow duration-200"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="font-semibold text-gray-100">{task.title}</h3>
                                                                <Circle className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                                                            <p className='text-sm text-gray-300 mb-2'>{task.status}</p>
                                                            <div className="flex justify-between items-center">
                                                                <Badge className={PRIORITY_COLORS[task.priority]}>
                                                                    {task.priority}
                                                                </Badge>
                                                                {task.dueDate && (
                                                                    <span className="text-xs text-gray-400">
                                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </Droppable>
                    <Droppable droppableId={Status.IN_PROGRESS}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <Card className="bg-gray-800 overflow-hidden border-t-4 border-blue-700">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-semibold text-gray-100">IN PROGRESS</CardTitle>
                                        <Badge variant="secondary" className="bg-gray-700 text-gray-100">
                                            {tasks.filter((task) => task.status === Status.IN_PROGRESS).length}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {tasks.filter((task) => task.status === Status.IN_PROGRESS).map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow duration-200"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="font-semibold text-gray-100">{task.title}</h3>
                                                                <Clock className="w-5 h-5 text-blue-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                                                            <p className='text-sm text-gray-300 mb-2'>{task.status}</p>
                                                            <div className="flex justify-between items-center">
                                                                <Badge className={PRIORITY_COLORS[task.priority]}>
                                                                    {task.priority}
                                                                </Badge>
                                                                {task.dueDate && (
                                                                    <span className="text-xs text-gray-400">
                                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </Droppable>
                    <Droppable droppableId={Status.DONE}>
                        {(provided) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                <Card className="bg-gray-800 overflow-hidden border-t-4 border-green-700">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-semibold text-gray-100">DONE</CardTitle>
                                        <Badge variant="secondary" className="bg-gray-700 text-gray-100">
                                            {tasks.filter((task) => task.status === Status.DONE).length}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {tasks.filter((task) => task.status === Status.DONE).map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow duration-200"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="font-semibold text-gray-100">{task.title}</h3>
                                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                            </div>
                                                            <p className="text-sm text-gray-300 mb-2">{task.description}</p>
                                                            <p className='text-sm text-gray-300 mb-2'>{task.status}</p>
                                                            <div className="flex justify-between items-center">
                                                                <Badge className={PRIORITY_COLORS[task.priority]}>
                                                                    {task.priority}
                                                                </Badge>
                                                                {task.dueDate && (
                                                                    <span className="text-xs text-gray-400">
                                                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </DragDropContext>
    )
}