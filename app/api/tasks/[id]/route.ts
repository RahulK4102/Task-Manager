import { NextRequest, NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prismaClient } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET || 'default-secret-key';

    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    let decodedToken: JwtPayload;
    try {
      decodedToken = jwt.verify(token, secret) as JwtPayload;
      console.log(decodedToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const taskId = params.id;

    try {
      const { title, description, status, priority, dueDate } = await req.json();
      const updatedTask = {
        title,
        description,
        status: status, 
        priority: priority,
        dueDate: dueDate ? new Date(dueDate) : '',
        userId,
      };

      const result = await prismaClient.task.update({
        where: {
          id: taskId, 
          userId: userId,
        },
        data: {
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          dueDate: updatedTask.dueDate,
          user: {
            connect: { id: updatedTask.userId },
          },
        },
      });

      if (!result) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
      } else {
        return NextResponse.json({ ...updatedTask, _id: taskId }, { status: 200 });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ message: 'Error updating task', error }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const token = req.headers.get('authorization')?.split(' ')[1];
  
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
      }
  
      const secret = process.env.JWT_SECRET || 'default-secret-key';
  
      if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }
  
      let decodedToken: JwtPayload;
      try {
        decodedToken = jwt.verify(token, secret) as JwtPayload;
      } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
      }
  
      const userId = decodedToken.userId;
      const taskId = params.id;
      console.log("userId: " + userId + " taskId: " + taskId);
  
      try {
        const deleteResult = await prismaClient.task.deleteMany({
          where: {
            id: taskId,
            userId: userId,
          },
        });
  
        if (deleteResult.count === 0) {
          return NextResponse.json({ message: 'Task not found' }, { status: 404 });
        } else {
          return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ message: 'Error deleting task', error }, { status: 500 });
      }
    } catch (error) {
      console.error('Server error:', error);
      return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
  }
