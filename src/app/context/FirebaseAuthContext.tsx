"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onUserStateChanged } from "../api/firebase";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { IdTokenResult } from "firebase/auth/cordova";

export const FirebaseAuthContext = createContext<{
  user: User | null;
  loading: Boolean;
  userToken: string | null;
}>({
  user: null,
  loading: false,
  userToken: "",
});

export const FirebaseAuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null); // Again, replace with exact user type if available
  const [loading, setLoading] = useState<Boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
    if (user) {
      user.getIdToken().then((idToken) => {
        setUserToken(idToken); // 토큰 값을 설정
      });
    } else {
      setUserToken(null); // 로그아웃
    }
  }, [user, router]);

  return (
    <FirebaseAuthContext.Provider value={{ user, loading, userToken }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export function useAuthContext() {
  return useContext(FirebaseAuthContext);
}
