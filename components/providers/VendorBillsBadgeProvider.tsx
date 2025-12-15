"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

interface VendorBillsBadgeContextType {
  newVendorBillsCount: number;
  markVendorBillsAsSeen: () => void;
  refresh: () => void;
}

const VendorBillsBadgeContext = createContext<
  VendorBillsBadgeContextType | undefined
>(undefined);

export function VendorBillsBadgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newCount, setNewCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const STORAGE_KEY = "vendorBillsLastSeen";

  const refresh = useCallback(async () => {
    try {
      const [farmerRes, agentRes] = await Promise.all([
        axios.get("/api/former-loading"),
        axios.get("/api/agent-loading"),
      ]);

      const farmers = (farmerRes.data?.data ?? []) as any[];
      const agents = (agentRes.data?.data ?? []) as any[];

      const currentTotal = farmers.length + agents.length;
      setTotalCount(currentTotal);

      const stored = localStorage.getItem(STORAGE_KEY);
      const lastSeenTotal = stored ? JSON.parse(stored)?.total ?? 0 : 0;

      setNewCount(Math.max(0, currentTotal - lastSeenTotal));
    } catch (err) {
      console.error("Failed to refresh vendor bills badge count");
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  const markVendorBillsAsSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ total: totalCount }));
    setNewCount(0);
  }, [totalCount]);

  return (
    <VendorBillsBadgeContext.Provider
      value={{ newVendorBillsCount: newCount, markVendorBillsAsSeen, refresh }}
    >
      {children}
    </VendorBillsBadgeContext.Provider>
  );
}

export function useVendorBillsBadge() {
  const context = useContext(VendorBillsBadgeContext);
  if (!context) {
    throw new Error(
      "useVendorBillsBadge must be used within VendorBillsBadgeProvider"
    );
  }
  return context;
}
