// app/api/payments/employee/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const userId = formData.get("userId") as string;
        const employeeName = formData.get("employeeName") as string;
        const date = formData.get("date") as string;
        const amount = parseFloat(formData.get("amount") as string);

        if (!userId || !employeeName || !date || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // You can create a new model later, or just saving in logs for now
        // Or create a new table EmployeePayment if needed

        console.log("Employee Payment Recorded:", {
            userId,
            employeeName,
            date: new Date(date),
            amount,
        });

        return NextResponse.json({ success: true, message: "Payment recorded" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
// const async function handleGET() {
//     try {
//         // For now, just return a static message or empty list
//         return NextResponse.json({ success: true, payments: [] });
//     } catch (error) {
//         console.error(error);
//         return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
//     }
// }