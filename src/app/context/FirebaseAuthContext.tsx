"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onUserStateChanged } from "../api/firebase";
import { User } from "firebase/auth";

export const FirebaseAuthContext = createContext<{
  user: User | null;
  loading: Boolean;
}>({
  user: null,
  loading: false,
});

export const FirebaseAuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null); // Again, replace with exact user type if available
  const [loading, setLoading] = useState<Boolean>(true);
  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, [user]);

  return (
    <FirebaseAuthContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export function useAuthContext() {
  return useContext(FirebaseAuthContext);
}
