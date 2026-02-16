import jwt from "jsonwebtoken"
import { prisma } from "../utils/prisma"
import type { Context, Next } from "hono"
import { HTTPException } from "hono/http-exception"

export type AuthUser = {
    id: number
    username: string
}

export type AuthVariables = {
    user: AuthUser
}

export const authMiddleware = async (c: Context<{ Variables: AuthVariables }>, next: Next) => {
    const authHeader = c.req.header("Authorization")
    if (!authHeader?.startsWith("Bearer")) {
        throw new HTTPException(401, {
            message : "Unauthorized: Missing valid token"
        })
    }

    const token = authHeader.split(" ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: number
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {id: true, username:true}
        })

        if (!user) {
            throw new HTTPException(401, { message: "Unauthorize: User not found" })
        }

        c.set("user", user)
        await next()
    } catch (error) {
        if (error instanceof HTTPException) throw error
        throw new HTTPException(401, {message:"Invalid token"})
    }
}

