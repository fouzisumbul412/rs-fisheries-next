import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const last = await prisma.formerLoading.findFirst({
            orderBy: { billNo: "desc" }, // FIXED: sort by billNo instead of id
        });

        let nextNumber = 1;

        if (last?.billNo) {
            const parts = last.billNo.split("-");
            const numeric = Number(parts[2] || "0");
            nextNumber = numeric + 1;
        }

        const formatted = String(nextNumber).padStart(4, "0");

        return NextResponse.json({
            billNo: `RS-Former-${formatted}`,
        });
    } catch (err) {
        console.error("Bill no error:", err);
        return NextResponse.json({ billNo: "RS-Former-0001" });
    }
}
