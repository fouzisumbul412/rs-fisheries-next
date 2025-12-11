import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const saved = await prisma.agentLoading.create({
            data: {
                fishCode: data.fishCode || "na",
                agentName: data.agentName,
                billNo: data.billNo,
                village: data.village,
                date: new Date(data.date),
                vehicleNo: data.vehicleNo,

                totalTrays: data.totalTrays,
                totalLooseKgs: data.totalLooseKgs,
                totalTrayKgs: data.totalTrayKgs,
                totalKgs: data.totalKgs,
                totalPrice: 0,
                grandTotal: data.grandTotal,

                items: {
                    create: data.items.map((item: any) => ({
                        varietyCode: item.varietyCode,
                        noTrays: item.noTrays,
                        trayKgs: item.noTrays * 35,
                        loose: item.loose,
                        totalKgs: item.noTrays * 35 + item.loose,
                    })),
                },
            },

            include: { items: true },
        });

        return NextResponse.json({ success: true, loading: saved });
    } catch (error) {
        console.error("Error saving agent loading:", error);
        return NextResponse.json(
            { success: false, message: "Failed to save agent loading" },
            { status: 500 }
        );
    }
}
