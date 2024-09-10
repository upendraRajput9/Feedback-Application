import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect()
    try {
        const { username, code } = await request.json()
        const decodedUsername = await decodeURIComponent(username)
        const decodedCode = await decodeURIComponent(code)
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            },
                { status: 500 })
        }
        const isCodeValid = user.verifyCode === decodedCode
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return NextResponse.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                {
                    status: 200
                }
            )
        }else if(!isCodeNotExpired){
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code has expired please signup again to get new code"
                },
                {
                    status: 400
                }
            )
        }else{
            return NextResponse.json(
                {
                    success: false,
                    message: "Incorrect verifivation"
                },
                {
                    status: 400
                }
            )
        }
    } catch (error) {
        console.error('Error verifying user', error)
        return NextResponse.json(
            {
                success: false,
                message: "Error verifying user"
            },
            {
                status: 500
            }
        )
    }
}