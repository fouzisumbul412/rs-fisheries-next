"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FishVarietyDialog({ open, setOpen }: any) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (!code.trim() || !name.trim())
      return toast.error("Enter both code & name");

    try {
      await axios.post("/api/fish-varieties/add", { code, name });

      toast.success("Fish variety added!");
      setCode("");
      setName("");
      setOpen(false);
    } catch {
      toast.error("Failed to add variety");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fish Variety</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <Input
            placeholder="Code (e.g., RL)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <Input
            placeholder="Fish Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button className="w-full rounded-2xl" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
