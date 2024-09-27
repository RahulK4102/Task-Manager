import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/db'; 
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decodedToken: JwtPayload;
    const secret = process.env.JWT_SECRET || 'default-secret-key';

    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    try {
      decodedToken = jwt.verify(token, secret) as JwtPayload; 
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.userId; 

    try {
      const tasks = await prismaClient.task.findMany({
        where: { userId },
      });
      return NextResponse.json(tasks, { status: 200 });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ message: 'Error fetching tasks', error }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
      decodedToken = jwt.verify(token,secret) as JwtPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json({ message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const { title, description, status, priority, dueDate } = await req.json();

    
    const newTask = {
      title,
      description,
      status: status, 
      priority: priority,
      dueDate: dueDate ? new Date(dueDate) : '',
      userId,
    };
    

    try {
      const createdTask = await prismaClient.task.create({
        data: {
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          user: {
            connect: { id: newTask.userId },
          },
        },
      });
      
      return NextResponse.json(createdTask, { status: 201 });
    } catch (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ message: 'Error creating task', error }, { status: 500 });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
  }
}
