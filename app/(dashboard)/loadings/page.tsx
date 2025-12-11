"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ClientLoading from "./components/ClientLoading";
import AgentLoading from "./components/AgentLoading";
import FormerLoading from "./components/FormerLoading";

export default function LoadingsPage() {
  const [activeTab, setActiveTab] = useState("fish");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loadings</h1>
        <p className="text-muted-foreground">
          Manage fish, client, and agent loadings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="fish">Farmer</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
          <TabsTrigger value="agent">Agent</TabsTrigger>
        </TabsList>

        <TabsContent value="fish" className="mt-6">
          <FormerLoading />
        </TabsContent>

        <TabsContent value="client" className="mt-6">
          <ClientLoading />
        </TabsContent>

        <TabsContent value="agent" className="mt-6">
          <AgentLoading />
        </TabsContent>
      </Tabs>
    </div>
  );
}
