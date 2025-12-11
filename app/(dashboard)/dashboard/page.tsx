import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import DashboardHeader from "./components/DashboardHeader";
import AddFishButton from "./components/AddFishButton";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let user: any = null;

  if (token) {
    try {
      user = verifyToken(token);
    } catch (error) {
      console.log("Invalid token");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader user={user} />
      <AddFishButton />
    </div>
  );
}
