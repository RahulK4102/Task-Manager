'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DialogDescription } from '@radix-ui/react-dialog'
import { LogOut } from 'lucide-react'

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

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Partial<Task>>({})
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [error, setError] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedTasks, setSortedTasks] = useState(tasks);
  const router = useRouter()

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  
    const sorted = [...tasks].sort((a, b) => {
      const valA = a[column as keyof Task];
      const valB = b[column as keyof Task];
      if (valA == null && valB == null) return 0; 
      if (valA == null) return direction === 'asc' ? -1 : 1; 
      if (valB == null) return direction === 'asc' ? 1 : -1;
      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  
    setSortedTasks(sorted);
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
        setSortedTasks(data)
      } else {
        throw new Error('Failed to fetch tasks')
      }
    } catch (err) {
      setError('Failed to fetch tasks. Please try again.' + err)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      })
      if (response.ok) {
        fetchTasks()
        setNewTask({})
      } else {
        throw new Error('Failed to create task')
      }
    } catch (err) {
      setError('Failed to create task. Please try again.' + err)
    }
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingTask),
      })
      if (response.ok) {
        fetchTasks()
        setEditingTask(null)
      } else {
        throw new Error('Failed to update task')
      }
    } catch (err) {
      setError('Failed to update task. Please try again.' + err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        fetchTasks()
      } else {
        throw new Error('Failed to delete task')
      }
    } catch (err) {
      setError('Failed to delete task. Please try again.' + err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  return (
    <div className="mx-auto p-4 bg-gray-900 min-h-screen text-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task List</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            className="bg-gray-800 text-gray-100 hover:bg-gray-700"
            onClick={() => router.push('/kanban')}
          >
            Go to Kanban
          </Button>
          <Button
            variant="outline"
            className="bg-gray-800 text-gray-100 hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Create New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Title</Label>
              <Input
                id="title"
                value={newTask.title || ''}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                required
                className="bg-gray-700 text-gray-100 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Input
                id="description"
                value={newTask.description || ''}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="bg-gray-700 text-gray-100 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select
                value={newTask.status || ''}
                onValueChange={(value) => setNewTask({ ...newTask, status: value as Task['status'] })}
              >
                <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                  <SelectItem value={Status.TO_DO}>To Do</SelectItem>
                  <SelectItem value={Status.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={Status.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority" className="text-gray-300">Priority</Label>
              <Select
                value={newTask.priority || ''}
                onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task['priority'] })}
              >
                <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                  <SelectItem value={Priority.LOW}>Low</SelectItem>
                  <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={Priority.HIGH}>High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
              <Input
                id="dueDate"
                type='date'
                value={newTask.dueDate ? new Date(newTask.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="bg-gray-700 text-gray-100 border-gray-600"
              />
            </div>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Create Task</Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-900 text-red-100 border-red-800">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-b border-gray-700">
            <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort('title')}>
              Title {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort('description')}>
              Description {sortColumn === 'description' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort('status')}>
              Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort('priority')}>
              Priority {sortColumn === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-gray-300 cursor-pointer" onClick={() => handleSort('dueDate')}>
              Due Date {sortColumn === 'dueDate' && (sortDirection === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead className="text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => (
            <TableRow key={task.id} className="border-b border-gray-700">
              <TableCell className="text-gray-300">{task.title}</TableCell>
              <TableCell className="text-gray-300">{task.description}</TableCell>
              <TableCell className="text-gray-300">{task.status}</TableCell>
              <TableCell className="text-gray-300">{task.priority}</TableCell>
              <TableCell className="text-gray-300">{task.dueDate}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mr-2 bg-gray-700 text-gray-100 hover:bg-gray-600" onClick={() => setEditingTask(task)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 text-gray-100">
                    <DialogHeader>
                      <DialogTitle className="text-gray-100">Edit Task</DialogTitle>
                      <DialogDescription className="text-gray-300">This will allow you to edit the details of your task.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTask} className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title" className="text-gray-300">Title</Label>
                        <Input
                          id="edit-title"
                          value={editingTask?.title || ''}
                          onChange={(e) => setEditingTask({ ...editingTask!, title: e.target.value })}
                          required
                          className="bg-gray-700 text-gray-100 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-description" className="text-gray-300">Description</Label>
                        <Input
                          id="edit-description"
                          value={editingTask?.description || ''}
                          onChange={(e) => setEditingTask({ ...editingTask!, description: e.target.value })}
                          className="bg-gray-700 text-gray-100 border-gray-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-status" className="text-gray-300">Status</Label>
                        <Select
                          value={editingTask?.status || ''}
                          onValueChange={(value) => setEditingTask({ ...editingTask!, status: value as Task['status'] })}
                        >
                          <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                            <SelectItem value={Status.TO_DO}>To Do</SelectItem>
                            <SelectItem value={Status.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={Status.DONE}>Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-priority" className="text-gray-300">Priority</Label>
                        <Select
                          value={editingTask?.priority || ''}
                          onValueChange={(value) => setEditingTask({ ...editingTask!, priority: value as Task['priority'] })}
                        >
                          <SelectTrigger className="bg-gray-700 text-gray-100 border-gray-600">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 text-gray-100 border-gray-600">
                            <SelectItem value={Priority.LOW}>Low</SelectItem>
                            <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={Priority.HIGH}>High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-dueDate" className="text-gray-300">Due Date</Label>
                        <Input
                          id="edit-dueDate"
                          type="date"
                          value={editingTask?.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ""}
                          onChange={(e) => setEditingTask({ ...editingTask!, dueDate: e.target.value })}
                          className="bg-gray-700 text-gray-100 border-gray-600"
                        />
                      </div>
                      <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Update Task</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={() => {handleDeleteTask(task.id)}}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}