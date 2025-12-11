"use client";

export default function DashboardHeader({ user }: any) {
  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {user && (
        <p className="text-gray-700">
          Welcome <b>{user.email}</b> ({user.role})
        </p>
      )}
    </>
  );
}
