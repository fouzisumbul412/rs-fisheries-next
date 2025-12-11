import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const exists = await prisma.fishVariety.findUnique({
            where: { code: data.code },
        });

        if (exists) {
            return NextResponse.json(
                { success: false, message: "Code already exists!" },
                { status: 400 }
            );
        }

        const newVariety = await prisma.fishVariety.create({
            data: {
                code: data.code,
                name: data.name,
            },
        });

        return NextResponse.json({ success: true, newVariety });
    } catch (error) {
        console.error("Failed to add variety:", error);
        return NextResponse.json(
            { success: false, message: "Failed to add variety" },
            { status: 500 }
        );
    }
}
