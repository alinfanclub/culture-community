"use client";

import { useAuthContext } from "@/app/context/FirebaseAuthContext";

export default function UserWelcomMsg() {
  const { user } = useAuthContext();
  return (
    <h1 className="text-center h-20 flex justify-start items-center p-4">{`${
      user ? user.displayName : ""
    }의 공간`}</h1>
  );
}
