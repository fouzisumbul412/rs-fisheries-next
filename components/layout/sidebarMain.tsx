"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Truck,
  FileText,
  Receipt,
  CreditCard,
  Car,
  Wallet,
  Warehouse,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { useVendorBillsBadge } from "../providers/VendorBillsBadgeProvider";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/loadings", label: "Loadings", icon: Truck },
  { href: "/stocks", label: "Stock", icon: Warehouse },
  { href: "/vendor-bills", label: "Vendor Bills", icon: FileText },
  { href: "/client-bills", label: "Client Bills", icon: Receipt },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/receipts", label: "Receipts", icon: Receipt },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/salaries", label: "Salaries", icon: Wallet },
  { href: "/teams-members", label: "Team Members", icon: Users },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const { newVendorBillsCount, markVendorBillsAsSeen } = useVendorBillsBadge();
  useEffect(() => {
    if (pathname === "/vendor-bills") {
      markVendorBillsAsSeen();
    }
  }, [pathname, markVendorBillsAsSeen]);

  return (
    <Sidebar collapsible="icon" className="border-r bg-white">
      {/* HEADER */}
      <SidebarHeader className="border-b p-4">
        {!collapsed ? (
          <div>
            <h2 className="text-lg font-bold">RS Fisheries</h2>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        ) : (
          <div className="text-center font-bold text-lg">RS</div>
        )}
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                // Compute badge for vendor-bills
                const showBadge =
                  item.href === "/vendor-bills" && newVendorBillsCount > 0;
                const badgeCount = newVendorBillsCount;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {showBadge && !collapsed && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs"
                          >
                            {badgeCount > 99 ? "99+" : badgeCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
