"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";

interface ItemRow {
  id: string;
  varietyCode: string;
  name: string;
  noTrays: number;
  loose: number;
  trayKgs: number;
  totalKgs: number;
}

export default function AgentLoading() {
  const [billNo, setBillNo] = useState("");
  const [agentName, setAgentName] = useState("");
  const [village, setVillage] = useState("");
  const [date, setDate] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [fishCode, setFishCode] = useState("");

  const [items, setItems] = useState<ItemRow[]>([
    {
      id: crypto.randomUUID(),
      varietyCode: "",
      name: "",
      noTrays: 0,
      loose: 0,
      trayKgs: 0,
      totalKgs: 0,
    },
  ]);

  const [grandTotal, setGrandTotal] = useState(0);

  const { data: varieties = [] } = useQuery({
    queryKey: ["varieties"],
    queryFn: async () => {
      const res = await axios.get("/api/fish-varieties");
      return res.data.data || [];
    },
  });

  // Helper to get fish name
  const getVarietyName = (code: string) => {
    return varieties.find((v: any) => v.code === code)?.name || "";
  };
  const { data: billData, refetch: refetchBillNo } = useQuery({
    queryKey: ["agent-bill-no"],
    queryFn: async () => {
      const res = await fetch("/api/agent-loading/next-bill-no");
      const data = await res.json();
      return data.billNo;
    },
  });

  useEffect(() => {
    if (billData) setBillNo(billData);
  }, [billData]);

  const updateRow = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              trayKgs: field === "noTrays" ? value * 35 : row.trayKgs,
              totalKgs:
                (field === "noTrays" ? value * 35 : row.trayKgs) +
                (field === "loose" ? value : row.loose),
            }
          : row
      )
    );
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        varietyCode: "",
        name: "",
        noTrays: 0,
        loose: 0,
        trayKgs: 0,
        totalKgs: 0,
      },
    ]);
  };

  const deleteRow = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((row) => row.id !== id));
  };

  useEffect(() => {
    const total = items.reduce((sum, r) => sum + r.totalKgs, 0);
    setGrandTotal(total);
  }, [items]);

  const resetForm = () => {
    setAgentName("");
    setVillage("");
    setDate("");
    setVehicleNo("");

    setItems([
      {
        id: crypto.randomUUID(),
        varietyCode: "",
        name: "",
        noTrays: 0,
        loose: 0,
        trayKgs: 0,
        totalKgs: 0,
      },
    ]);

    setGrandTotal(0);

    // Reload bill number
    refetchBillNo();
  };

  const handleSave = async () => {
    if (!billNo) return toast.error("Bill number missing");
    if (!agentName.trim()) return toast.error("Enter Agent Name");
    const firstVariety = items[0]?.varietyCode;
    if (!firstVariety) return toast.error("Select at least one variety");
    const fishCodeValue = firstVariety.toUpperCase();
    const totals = {
      totalTrays: items.reduce((a, b) => a + b.noTrays, 0),
      totalLooseKgs: items.reduce((a, b) => a + b.loose, 0),
      totalTrayKgs: items.reduce((a, b) => a + b.noTrays * 35, 0),
      totalKgs:
        items.reduce((a, b) => a + b.noTrays * 35, 0) +
        items.reduce((a, b) => a + b.loose, 0),
    };

    try {
      await axios.post("/api/agent-loading", {
        agentName,
        fishCode: fishCodeValue,
        billNo,
        village,
        date,
        vehicleNo,
        ...totals,
        grandTotal,

        items: items.map((r) => ({
          varietyCode: r.varietyCode,
          noTrays: r.noTrays,
          trayKgs: r.noTrays * 35,
          loose: r.loose,
          totalKgs: r.totalKgs,
        })),
      });

      toast.success("Agent loading saved!");
      resetForm();
    } catch (err) {
      toast.error("Failed to save agent loading");
    }
  };
  return (
    <Card className="rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">B. Agent Loading</h2>

        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel>Agent Bill No</FieldLabel>
            <Input
              readOnly
              value={billNo}
              className="bg-gray-100 font-semibold"
            />
          </Field>

          <Field>
            <FieldLabel>Agent Name</FieldLabel>
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Village</FieldLabel>
            <Input
              value={village}
              onChange={(e) => setVillage(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Date</FieldLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Vehicle No</FieldLabel>
            <Input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
            />
          </Field>
        </div>

        {/* TABLE */}
        <div className="mt-6 border rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2 text-left">S.No</th>
                <th className="px-2 py-2 text-left">Variety</th>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Trays</th>
                <th className="px-2 py-2 text-left">Loose</th>
                <th className="px-2 py-2 text-left">Total</th>
                <th className="px-2 py-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.map((row, index) => (
                <tr key={row.id} className="border-b">
                  <td className="px-2 py-2">{index + 1}</td>

                  {/* Variety */}
                  <td className="px-2 py-2">
                    <Select
                      value={row.varietyCode}
                      onValueChange={(val) => {
                        updateRow(row.id, "varietyCode", val);
                        updateRow(row.id, "name", getVarietyName(val));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {varieties.map((v: any) => (
                          <SelectItem key={v.code} value={v.code}>
                            {v.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Name */}
                  <td className="p-2">{row.name}</td>

                  {/* Trays */}
                  <td className="p-2">
                    <Input
                      type="number"
                      value={row.noTrays}
                      className="w-24"
                      onChange={(e) =>
                        updateRow(row.id, "noTrays", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* Loose */}
                  <td className="p-2">
                    <Input
                      type="number"
                      value={row.loose}
                      className="w-24"
                      onChange={(e) =>
                        updateRow(row.id, "loose", Number(e.target.value))
                      }
                    />
                  </td>

                  {/* Total */}
                  <td className="px-2 py-2 font-semibold">{row.totalKgs}</td>

                  {/* Delete */}
                  <td className="px-2 py-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={items.length === 1}
                      onClick={() => deleteRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4">
            <Button
              className="rounded-2xl flex items-center gap-2"
              onClick={addRow}
            >
              <PlusCircle className="w-4 h-4" />
              Add Row
            </Button>
          </div>
        </div>

        {/* GRAND TOTAL */}
        <div className="text-right text-lg font-semibold">
          Grand Total: {grandTotal} Kgs
        </div>
      </CardContent>
    </Card>
  );
}
