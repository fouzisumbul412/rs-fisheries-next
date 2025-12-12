import prisma from "@/lib/prisma";
import { ApiError } from "@/utils/ApiError";
import { apiHandler } from "@/utils/apiHandler";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextResponse } from "next/server";

export const POST = apiHandler(async (req: Request) => {
  const body = await req.json();
  const { vehicleId } = body;

  if (!vehicleId) {
    throw new ApiError(400, "vehicleId is required");
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { assignedDriver: true },
  });

  if (!vehicle) throw new ApiError(404, "Vehicle not found");

  if (!vehicle.assignedDriverId)
    throw new ApiError(400, "This vehicle has no assigned driver");

  const driverId = vehicle.assignedDriverId;

  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      assignedDriverId: null,
    },
  });

  await prisma.driver.update({
    where: { id: driverId },
    data: {
      assignedVehicle: { disconnect: true },
    },
  });

  return NextResponse.json(
    new ApiResponse(200, updatedVehicle, "Driver unassigned successfully"),
    { status: 200 }
  );
});
