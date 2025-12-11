"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

// TEMP user hook (replace later with JWT decode)
const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return { user };
};

export function TopNav() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await axios.post("/api/logout");
    localStorage.removeItem("user");
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white px-6 shadow-sm">
      {/* === FIXED: Proper Sidebar Trigger === */}
      <SidebarTrigger className=" mr-2">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SidebarTrigger>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="rounded-full bg-blue-700 p-1.5 cursor-pointer">
              <Avatar className="h-9 w-9 bg-transparent">
                <AvatarFallback className="text-white font-semibold text-lg bg-transparent">
                  {(user?.name?.charAt(0) || "O").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.name || "User"}</span>
                <span className="text-xs text-gray-500">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
