"use client";

import { logout } from "@/app/api/firebase";
import { useState } from "react";
import { User } from "firebase/auth";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";

export default function HeaderUserStateComponent() {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const { user } = useAuthContext();

  const handleLoginModalState = () => setIsLogin(!isLogin);
  const handleSignUpModalState = () => setIsSignUp(!isSignUp);
  const handleSetUser = (user: User) => setUserState(user);

  return (
    <div>
      {!user && (
        <div className="flex gap-4">
          <button onClick={() => handleLoginModalState()} type="button">
            로그인
          </button>
          <button onClick={() => setIsSignUp(true)} type="button">
            회원가입
          </button>
        </div>
      )}
      {user && (
        <div className="flex gap-4">
          <h1>{user.displayName}</h1>
          <button type="button" onClick={() => logout()}>
            로그아웃
          </button>
        </div>
      )}
      <div className="fixed top-1/2 left-1/2 -trnaslate-x-1/2 -translate-y-1/2 ">
        {isLogin && (
          <LoginModal handleLoginModalState={handleLoginModalState} />
        )}
        {isSignUp && (
          <SignupModal
            handleSignUpModalState={handleSignUpModalState}
            handleSetUser={handleSetUser}
          />
        )}
      </div>
    </div>
  );
}
