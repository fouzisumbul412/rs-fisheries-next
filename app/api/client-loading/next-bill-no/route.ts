import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const last = await prisma.clientLoading.findFirst({
            orderBy: { billNoNumeric: "desc" },
        });

        const nextNumber = last ? last.billNoNumeric + 1 : 1;

        const formatted = String(nextNumber).padStart(4, "0");

        return NextResponse.json({
            billNo: `RS-Client-${formatted}`,
            billNoNumeric: nextNumber,
        });
    } catch (err) {
        console.error("Bill no error:", err);
        return NextResponse.json({
            billNo: "RS-Client-0001",
            billNoNumeric: 1,
        });
    }
}
