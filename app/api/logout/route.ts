import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    // const token = req.cookies.get("session")?.value;
    const token = req.headers.get("cookie")?.split("; ").find(row => row.startsWith("session="))?.split("=")[1];

  

    const res = NextResponse.json({ success: true });
    res.cookies.set("session", "", { maxAge: 0 });

    return res;
}
