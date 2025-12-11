"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Fish } from "lucide-react";
import FishVarietyDialog from "./FishVarietyDialog";

export default function AddFishButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="flex items-center gap-2 rounded-2xl shadow-md"
        onClick={() => setOpen(true)}
      >
        <Fish className="w-5 h-5" />
        Add Fish Variety
      </Button>

      <FishVarietyDialog open={open} setOpen={setOpen} />
    </>
  );
}
