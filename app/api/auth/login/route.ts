import { NextRequest, NextResponse } from "next/server";
import {prismaClient} from "@/lib/db"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
export async function POST(req:NextRequest){
    const{email,password} = await req.json();
    if(!email || !password){
        return NextResponse.json({message:"Missing required fields"},{status:400})
    }
    try {
        const user = await prismaClient.user.findUnique({
            where:{
                email: email
            }
        })
        if(!user){
            return NextResponse.json({message:"Invalid user credentials"},{status:400})
        }
        const isValidPass = await bcrypt.compare(password, user.password)
        if(!isValidPass){
            return NextResponse.json({message:"Invalid password"},{status:400})
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
            expiresIn: '1d',
        });
        console.log(token)
        return NextResponse.json({message:"Login successful",token},{status:200});
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error'+error }, { status: 500 });
    }
}