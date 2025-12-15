// app/api/client-loading/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Types
type ClientLoadingItem = {
  varietyCode: string;
  noTrays: number;
  loose: number;
};

type CreateClientLoadingInput = {
  clientName: string;
  billNo: string;
  date: string;
  vehicleNo?: string;
  village?: string;
  fishCode?: string;
  items: ClientLoadingItem[];
};

// POST - Create new client loading
export async function POST(req: Request) {
  try {
    const body: CreateClientLoadingInput = await req.json();
    const { clientName, billNo, date, vehicleNo, village, fishCode, items } = body;

    if (!clientName?.trim())
      return NextResponse.json({ success: false, message: "Client name is required" }, { status: 400 });

    if (!billNo?.trim())
      return NextResponse.json({ success: false, message: "Bill number is required" }, { status: 400 });

    if (!vehicleNo)
      return NextResponse.json({ success: false, message: "Vehicle is required" }, { status: 400 });

    const vehicle = await prisma.vehicle.findUnique({
      where: { vehicleNumber: vehicleNo },
    });

    if (!vehicle)
      return NextResponse.json({ success: false, message: "Invalid vehicle number" }, { status: 400 });

    const totalTrays = items.reduce((s, i) => s + (Number(i.noTrays) || 0), 0);
    const totalTrayKgs = totalTrays * 35;
    const totalLooseKgs = items.reduce((s, i) => s + (Number(i.loose) || 0), 0);
    const totalKgs = totalTrayKgs + totalLooseKgs;

    const saved = await prisma.clientLoading.create({
      data: {
        clientName: clientName.trim(),
        billNo: billNo.trim(),
        date: new Date(date),
        vehicle: { connect: { id: vehicle.id } },
        village: village?.trim() || "",
        fishCode: fishCode?.trim() || "",
        totalTrays,
        totalTrayKgs,
        totalLooseKgs,
        totalKgs,
        totalPrice: 0,
        grandTotal: totalKgs,
        items: {
          create: items.map((i) => ({
            varietyCode: i.varietyCode,
            noTrays: Number(i.noTrays) || 0,
            trayKgs: (Number(i.noTrays) || 0) * 35,
            loose: Number(i.loose) || 0,
            totalKgs: (Number(i.noTrays) || 0) * 35 + (Number(i.loose) || 0),
            pricePerKg: 0,
            totalPrice: 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (e) {
    console.error("ClientLoading POST error:", e);
    return NextResponse.json({ success: false, message: "Failed to save loading" }, { status: 500 });
  }
}

// GET - All loadings (for list page)
export async function GET(req: Request) {
  try {
    const loadings = await prisma.clientLoading.findMany({
      include: {
        items: {
          select: {
            id: true,
            varietyCode: true,
            noTrays: true,
            trayKgs: true,
            loose: true,
            totalKgs: true,
            pricePerKg: true,     // ← CRITICAL: Now included
            totalPrice: true,     // ← CRITICAL: Now included
          },
        },
        vehicle: {
          select: {
            vehicleNumber: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const formatted = loadings.map((l) => ({
      ...l,
      vehicleNo: l.vehicle?.vehicleNumber ?? "",
      // Optional: clean up nested vehicle object if not needed on frontend
      vehicle: undefined,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("ClientLoading GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}