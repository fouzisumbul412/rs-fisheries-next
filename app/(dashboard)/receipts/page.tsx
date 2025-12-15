// app/(dashboard)/receipts/page.tsx
"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { CardCustom } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button";
import { IndianRupee, Calendar, User, Package, FileText } from "lucide-react";
import { toast } from "sonner";

type Tab = "vendor" | "client" | "employee" | "packing";

interface BaseReceipt {
  id: string;
  date: string | Date | null;
  createdAt?: string;
  amount: number;
  totalAmount?: number;
  paymentMode?: string;
  reference?: string | null;
  imageUrl?: string;
  billNo?: string;
}

interface VendorReceipt extends BaseReceipt {
  vendorName: string;
  source: string;
}

interface ClientReceipt extends BaseReceipt {
  clientName: string;
}

interface EmployeeReceipt extends BaseReceipt {
  employeeName: string;
  user?: { name: string };
}

interface PackingReceipt extends BaseReceipt {
  mode: string;
  workers: number;
  temperature: number;
  createdBy?: { name: string | null };
  paymentMode?: string;
  reference?: string | null;
  billNo?: string;
}

type Receipt = BaseReceipt;

const formatCurrency = (amt: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amt);

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN");
};

export default function ReceiptsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("vendor");
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "vendor" as const, label: "Vendor Receipt", icon: User },
    { id: "client" as const, label: "Client Receipt", icon: User },
    { id: "employee" as const, label: "Employee Receipt", icon: User },
    { id: "packing" as const, label: "Packing Receipt", icon: Package },
  ];

  const apiMap: Record<Tab, string> = {
    vendor: "/api/payments/vendor",
    client: "/api/payments/client",
    employee: "/api/payments/employee",
    packing: "/api/payments/packing-amount",
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(apiMap[activeTab]);
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();

        const rawData = json.payments || json.records || json.data || [];
        const data: Receipt[] = rawData.map((item: any) => ({
          ...item,
          date: item.date || item.createdAt || new Date(),
        }));

        setReceipts(data);
      } catch (err) {
        console.error(err);
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTab]);

  const generatePDF = async (receipt: Receipt) => {
    if (activeTab !== "packing") {
      toast.error("Custom receipt design available only for Packing");
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Logo (top-right)
      try {
        doc.addImage("/favicon.jpg", "JPEG", pageWidth - 70, 10, 50, 50);
      } catch (e) {
        console.warn("Logo failed to load");
      }

      // Company Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("RS Fisheries", 20, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Fresh & Frozen Seafood Suppliers", 20, 35);
      doc.text("123 Fishery Road, Coastal Town", 20, 43);
      doc.text("Hyderabad, India - 500001", 20, 51);
      doc.text("Phone: +91 98765 43210", 20, 59);
      doc.text("Email: info@rsfisheries.com", 20, 67);

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("PACKING AMOUNT RECEIPT", pageWidth / 2, 90, {
        align: "center",
      });

      // Bill No & Date
      doc.setFontSize(12);
      doc.text(`Bill No: ${receipt.billNo || "N/A"}`, pageWidth - 90, 105);
      doc.text(`Date: ${formatDate(receipt.date)}`, pageWidth - 90, 115);

      // Separator
      doc.setLineWidth(0.5);
      doc.line(20, 125, pageWidth - 20, 125);

      // Details
      let y = 140;
      const addRow = (label: string, value: string | number) => {
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${label}:`, 30, y);
        doc.setFont("helvetica", "bold");
        doc.text(String(value), pageWidth - 30, y, { align: "right" });
        y += 15;
      };

      const r = receipt as PackingReceipt;
      addRow("Created By", r.createdBy?.name || "RS Fisheries Admin");
      addRow("Mode", r.mode === "loading" ? "Loading" : "Unloading");
      addRow("Number of Workers", r.workers);
      addRow("Temperature", `${r.temperature}°C`);

      const payMode =
        r.paymentMode === "CASH"
          ? "Cash"
          : r.paymentMode === "AC"
          ? "A/C Transfer"
          : r.paymentMode === "UPI"
          ? "UPI / PhonePe"
          : r.paymentMode === "CHEQUE"
          ? "Cheque"
          : "N/A";
      addRow("Payment Mode", payMode);

      if (r.reference) addRow("Reference", r.reference);

      // Total
      doc.setLineWidth(1);
      doc.line(30, y - 5, pageWidth - 30, y - 5);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      addRow("Total Amount", formatCurrency(r.amount));

      // Footer
      y += 40;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for your service!", pageWidth / 2, y, {
        align: "center",
      });
      y += 15;
      doc.text("Authorized Signature ___________________", pageWidth - 80, y);

      doc.save(`packing-receipt-${r.billNo || "draft"}.pdf`);
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } catch (err) {
      toast.error("Failed to generate receipt");
    }
  };

  const getTitle = () => {
    const map: Record<Tab, string> = {
      vendor: "Vendor Payment Receipts",
      client: "Client Payment Receipts",
      employee: "Employee Salary Receipts",
      packing: "Packing Amount Receipts",
    };
    return map[activeTab];
  };

  const total = receipts.reduce(
    (sum, r) => sum + (r.amount || r.totalAmount || 0),
    0
  );

  const getPartyName = (r: Receipt) => {
    if (activeTab === "vendor") return (r as VendorReceipt).vendorName || "—";
    if (activeTab === "client") return (r as ClientReceipt).clientName || "—";
    if (activeTab === "employee")
      return (r as EmployeeReceipt).employeeName || "—";
    if (activeTab === "packing")
      return (r as PackingReceipt).createdBy?.name || "RS Fisheries Admin";
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      <CardCustom title={getTitle()}>
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading...
          </div>
        ) : receipts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No receipts found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 px-4 font-medium">Date</th>
                  <th className="pb-3 px-4 font-medium">Party</th>
                  <th className="pb-3 px-4 font-medium">Details</th>
                  <th className="pb-3 px-4 text-right font-medium">Amount</th>
                  <th className="pb-3 px-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b hover:bg-muted/50 transition"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(r.date || r.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium">{getPartyName(r)}</div>
                      {activeTab === "packing" && r.billNo && (
                        <div className="text-xs font-medium text-blue-600 mt-1">
                          Bill: {r.billNo}
                        </div>
                      )}
                      {activeTab === "packing" &&
                        (r as PackingReceipt).mode && (
                          <div className="text-xs text-muted-foreground capitalize mt-1">
                            {(r as PackingReceipt).mode}
                          </div>
                        )}
                    </td>
                    <td className="py-4 px-4">
                      {activeTab === "packing" ? (
                        <>
                          <div className="text-xs text-muted-foreground">
                            Payment:{" "}
                            {r.paymentMode === "CASH"
                              ? "Cash"
                              : r.paymentMode === "AC"
                              ? "A/C Transfer"
                              : r.paymentMode === "UPI"
                              ? "UPI/PhonePe"
                              : r.paymentMode === "CHEQUE"
                              ? "Cheque"
                              : "N/A"}
                            {r.reference && ` | Ref: ${r.reference}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Workers: {(r as PackingReceipt).workers} | Temp:{" "}
                            {(r as PackingReceipt).temperature}°C
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          {r.paymentMode || "—"}
                          {r.reference && (
                            <span className="block mt-1">
                              Ref: {r.reference}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-lg font-bold text-green-600">
                        <IndianRupee className="w-5 h-5" />
                        {formatCurrency(r.amount || r.totalAmount || 0)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => generatePDF(r)}
                      >
                        <FileText className="w-4 h-4" />
                        Generate Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold">
                  Total ({receipts.length} receipts)
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardCustom>
    </div>
  );
}
