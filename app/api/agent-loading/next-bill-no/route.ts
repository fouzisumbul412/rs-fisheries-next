import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const last = await prisma.agentLoading.findFirst({
            orderBy: { billNo: "desc" },
        });

        let nextNumber = 1;

        if (last?.billNo) {
            const parts = last.billNo.split("-");
            const numeric = Number(parts[2]); // RS-Agent-0001 → 0001
            nextNumber = numeric + 1;
        }

        const formatted = String(nextNumber).padStart(4, "0");

        return NextResponse.json({
            billNo: `RS-Agent-${formatted}`,
        });
    } catch (error) {
        console.error("Error generating agent bill no:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch bill number" },
            { status: 500 }
        );
    }
}
