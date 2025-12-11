// app/api/client-loading/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.clientName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Client name is required" },
        { status: 400 }
      );
    }

    if (!data.billNoNumeric || typeof data.billNoNumeric !== "number") {
      return NextResponse.json(
        { success: false, message: "Invalid or missing billNoNumeric" },
        { status: 400 }
      );
    }

    // Calculate totals safely
    const totalTrays = data.items?.reduce((sum: number, i: any) => sum + (Number(i.noTrays) || 0), 0) || 0;
    const totalTrayKgs = data.items?.reduce((sum: number, i: any) => sum + (Number(i.trayKgs) || 0), 0) || 0;
    const totalLooseKgs = data.items?.reduce((sum: number, i: any) => sum + (Number(i.loose) || 0), 0) || 0;
    const totalKgs = totalTrayKgs + totalLooseKgs;
    const totalPrice = data.items?.reduce((sum: number, i: any) => sum + (Number(i.totalPrice) || 0), 0) || 0;

    const saved = await prisma.clientLoading.create({
      data: {
        clientName: data.clientName.trim(),
        billNo: data.billNo,
        billNoNumeric: data.billNoNumeric,
        date: new Date(data.date),
        vehicleNo: data.vehicleNo || "",
        fishCode: data.fishCode || "",
        totalTrays,
        totalLooseKgs,
        totalTrayKgs,
        totalKgs,
        totalPrice,
        grandTotal: totalPrice,
        items: {
          create: (data.items || []).map((item: any) => ({
            varietyCode: item.varietyCode || "",
            noTrays: Number(item.noTrays) || 0,
            trayKgs: Number(item.trayKgs) || 0,
            loose: Number(item.loose) || 0,
            totalKgs: (Number(item.noTrays) || 0) * (Number(item.trayKgs) || 0) + (Number(item.loose) || 0),
            pricePerKg: Number(item.pricePerKg) || 0,
            totalPrice: Number(item.totalPrice) || 0,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, loading: saved });
  } catch (error: any) {
    console.error("Error saving client loading:", error);

    if (error.code === "P2002") {
      const field = error.meta?.target?.[0];
      return NextResponse.json(
        { success: false, message: `This ${field === "billNo" ? "bill number" : "bill number"} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to save client loading", error: error.message },
      { status: 500 }
    );
  }
}