import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    await dbConnect()

    try {
        const { username, email, password } = await request.json()
        const existingUserVerifiedByUsername = await UserModel.
            findOne({
                username,
                isVerified: true
            })
        if (existingUserVerifiedByUsername) {
            return NextResponse.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 })
        }
        const existingUserByEmail = await UserModel.findOne({ email })
        const verifyCode = Math.floor(100000 + Math.random()
            * 900000).toString()
        if (existingUserByEmail) {
            true
        } else {
            const hasedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date
            expiryDate.setHours(expiryDate.getHours() + 1)
            const newUser = new UserModel({
                username,
                email,
                password: hasedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessge: true,
                messages: []
            })
    

            // await newUser.save()

            // return NextResponse.json({
            //     success: true,
            //     message: "User registered succesfully"
            // }, { status: 200 })
        }
        // Send Verification eamil
    } catch (error) {
        console.error('Error registering user', error)
        return NextResponse.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        )
    }
}