import prisma from "@/lib/prisma";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const GET = apiHandler(async () => {
  const drivers = await prisma.driver.findMany({
    where: {
      assignedVehicle: null,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      phone: true,
      licenseNumber: true,
    },
  });

  return NextResponse.json(
    new ApiResponse(200, drivers, "Available drivers fetched successfully")
  );
});
