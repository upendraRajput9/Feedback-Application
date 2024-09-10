import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod"
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextResponse } from "next/server";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    try {
        const { searchParams } = new URL(request.url)
        const queryparams = {
            username: searchParams.get("username")
        }
        const result = UsernameQuerySchema.safeParse(queryparams)
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return NextResponse.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters"
            },
                { status: 400 }
            )
        }
        const {username} = result.data
        const existingUserByEmail = await UserModel.findOne({username}) 
        if(existingUserByEmail){
            return NextResponse.json({
                success: true,
                message: 'Username is already taken'
            }, {status: 400})
        }
        return NextResponse.json({
            success: true,
            message: 'Username is unique'
        }, {status: 200})
    } catch (error) {
        console.error("Error checking username", error)
        return NextResponse.json({
            success: false,
            message: "Error checking username"
        },
            { status: 500 }
        )
    }
}