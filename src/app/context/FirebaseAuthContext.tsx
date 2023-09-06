"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { onUserStateChanged } from "../api/firebase";
import { User } from "firebase/auth";

export const FirebaseAuthContext = createContext<{ user: User | null }>({
  user: null,
});

export const FirebaseAuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null); // Again, replace with exact user type if available

  useLayoutEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ user }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export function useAuthContext() {
  return useContext(FirebaseAuthContext);
}
