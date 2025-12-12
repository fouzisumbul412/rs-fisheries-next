"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ColumnDef } from "@tanstack/react-table";
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
import { Button } from "@/components/ui/button";

export type RentVehicle = {
  id: string;
  vehicleNumber: string;
  rentalAgency: string | null;
  rentalRatePerDay: string;
  assignedDriver?: { name: string | null };
};

const columns: ColumnDef<RentVehicle>[] = [
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle No",
  },
  {
    accessorKey: "rentalAgency",
    header: "Agency",
    cell: ({ row }) => row.original.rentalAgency || "-",
  },
  {
    accessorKey: "rentalRatePerDay",
    header: "Rental Rate Per Day",
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
    cell: ({ row }) => <AssignDriverDialog vehicleId={row.original.id} />,
  },
];

export function RentVehicleTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["rent-vehicles"],
    queryFn: async () => {
      const { data: res } = await axios.get("/api/vehicles/rent");
      return res.data;
    },
  });

  const [filters, setFilters] = useState({
    search: "",
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
        v.rentalAgency?.toLowerCase().includes(s) ||
        v.assignedDriver?.name?.toLowerCase().includes(s)
      );
    });

    // Assigned Filter
    list = list.filter((v: any) => {
      if (filters.assigned === "ALL") return true;
      if (filters.assigned === "ASSIGNED") return !!v.assignedDriver;
      if (filters.assigned === "AVAILABLE") return !v.assignedDriver;
    });

    // Sort by createdAt
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
      <h2 className="text-xl font-semibold mb-3">Rent Vehicles</h2>

      {/* ---------------- Filters ---------------- */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Search */}
        <Input
          placeholder="Search vehicle / driver / agency"
          className="w-60"
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
        />

        {/* Assigned Filter */}
        <Select
          value={filters.assigned}
          onValueChange={(v) => setFilters((p) => ({ ...p, assigned: v }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Driver filter" />
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
