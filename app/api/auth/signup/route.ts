import { NextRequest, NextResponse } from "next/server";
import {prismaClient} from "@/lib/db"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest){
    const {username,email,password} = await req.json();
    if(!username || !email || !password){
        return NextResponse.json({message:"Missing required parameters"},{status: 404});
    }
    try {
        console.log("true");
        const existingUser = await prismaClient.user.findFirst({
            where:{
                email:email
            }
        })
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const users = await prismaClient.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        })
        console.log("user",users);
        const token = jwt.sign({ userId: users.id }, process.env.JWT_SECRET!, {
            expiresIn: '1d',
          });
          return NextResponse.json({ message: 'User created successfully', token }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error'+error }, { status: 500 });
    }
}

