"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ColumnDef } from "@tanstack/react-table";
import { AddDriverDialog } from "./AddDriverDialog";
import { DataTable } from "../ui/data-table";
import { AssignDriverDialog } from "./AssignDriverDialog";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { UnassignDriverDialog } from "./UnassignDriverDialog";

export type OwnVehicle = {
  id: string;
  vehicleNumber: string;
  manufacturer: string | null;
  fuelType: string;
  capacityInTons: string | null;
  assignedDriver?: { name: string | null };
};

const columns: ColumnDef<OwnVehicle>[] = [
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle No",
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => row.original.manufacturer || "-",
  },
  {
    accessorKey: "fuelType",
    header: "Fuel",
  },
  {
    accessorKey: "capacityInTons",
    header: "Capacity",
    cell: ({ row }) => row.original.capacityInTons || "-",
  },
  {
    accessorKey: "assignedDriver",
    header: "Driver",
    cell: ({ row }) =>
      row.original.assignedDriver?.name ?? "No Driver Assigned",
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) =>
      row.original.assignedDriver ? (
        <UnassignDriverDialog vehicleId={row.original.id} />
      ) : (
        <AssignDriverDialog vehicleId={row.original.id} />
      ),
  },
];

export function OwnVehicleTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["own-vehicles"],
    queryFn: async () => {
      const { data: res } = await axios.get("/api/vehicles/own");
      return res.data;
    },
  });

  const [filters, setFilters] = useState({
    search: "",
    fuelType: "ALL",
    assigned: "ALL",
    sortBy: "NONE",
  });

  const filtered = useMemo(() => {
    if (!data) return [];

    let list = [...data];

    const s = filters.search.toLowerCase();

    // Search
    list = list.filter((v: any) => {
      return (
        v.vehicleNumber.toLowerCase().includes(s) ||
        v.manufacturer?.toLowerCase().includes(s) ||
        v.assignedDriver?.name?.toLowerCase().includes(s)
      );
    });

    // Fuel type filter
    list = list.filter((v: any) => {
      return filters.fuelType === "ALL"
        ? true
        : v.fuelType === filters.fuelType;
    });

    // Assigned filter
    list = list.filter((v: any) => {
      if (filters.assigned === "ALL") return true;
      if (filters.assigned === "ASSIGNED") return !!v.assignedDriver;
      if (filters.assigned === "AVAILABLE") return !v.assignedDriver;
    });

    // Sort by date
    if (filters.sortBy === "NEWEST") {
      list.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (filters.sortBy === "OLDEST") {
      list.sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return list;
  }, [data, filters]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-3">Own Vehicles</h2>
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Search */}
        <Input
          className="w-60"
          placeholder="Search vehicle / driver / manufacturer"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        {/* Fuel Type */}
        <Select
          value={filters.fuelType}
          onValueChange={(v) => setFilters({ ...filters, fuelType: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="DIESEL">Diesel</SelectItem>
            <SelectItem value="PETROL">Petrol</SelectItem>
            <SelectItem value="CNG">CNG</SelectItem>
            <SelectItem value="ELECTRIC">Electric</SelectItem>
          </SelectContent>
        </Select>

        {/* Driver Assignment */}
        <Select
          value={filters.assigned}
          onValueChange={(v) => setFilters({ ...filters, assigned: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(v) => setFilters((p) => ({ ...p, sortBy: v }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">None</SelectItem>
            <SelectItem value="NEWEST">Newest → Oldest</SelectItem>
            <SelectItem value="OLDEST">Oldest → Newest</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        <Button
          variant="outline"
          onClick={() =>
            setFilters({
              search: "",
              assigned: "ALL",
              fuelType: "ALL",
              sortBy: "NONE",
            })
          }
        >
          Clear Filters
        </Button>
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
