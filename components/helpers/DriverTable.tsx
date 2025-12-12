"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { Badge } from "@/components/ui/badge";
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

export type DriverRow = {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  address: string;
  age: number;
  aadharNumber: string;
  assignedVehicle?: {
    vehicleNumber: string | null;
  } | null;
};

const columns: ColumnDef<DriverRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "licenseNumber",
    header: "License No",
  },
  {
    accessorKey: "aadharNumber",
    header: "Aadhar No",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "assignedVehicle",
    header: "Assigned Vehicle",
    cell: ({ row }) =>
      row.original.assignedVehicle?.vehicleNumber ? (
        <Badge variant="outline" className="text-green-700 border-green-600">
          {row.original.assignedVehicle.vehicleNumber}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-red-700 border-red-600">
          None
        </Badge>
      ),
  },
];

export function DriverTable() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data: res } = await axios.get("/api/driver");
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
    list = list.filter((d: any) => {
      return (
        d.name.toLowerCase().includes(s) ||
        d.phone.toLowerCase().includes(s) ||
        d.licenseNumber.toLowerCase().includes(s) ||
        d.aadharNumber.toLowerCase().includes(s) ||
        d.assignedVehicle?.vehicleNumber?.toLowerCase().includes(s)
      );
    });

    // Assigned Filter
    list = list.filter((d: any) => {
      if (filters.assigned === "ALL") return true;
      if (filters.assigned === "ASSIGNED") return !!d.assignedVehicle;
      if (filters.assigned === "AVAILABLE") return !d.assignedVehicle;
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

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <p className="text-red-600 text-sm">Failed to load drivers.</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 border rounded-md hover:bg-gray-100"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-xl font-semibold mb-3">Drivers</h2>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Search */}
        <Input
          placeholder="Search name / phone / license / vehicle"
          className="w-60"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        {/* Assigned Filter */}
        <Select
          value={filters.assigned}
          onValueChange={(v) => setFilters((p) => ({ ...p, assigned: v }))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assigned" />
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
