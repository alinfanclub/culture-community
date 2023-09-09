"use client";

import { logout } from "@/app/api/firebase";
import { useState } from "react";
import { User } from "firebase/auth";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import Link from "next/link";
import Avvvatars from "avvvatars-react";
import Image from "next/image";
import ClipSpinner from "./common/ClipSpinner";

export default function HeaderUserStateComponent() {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const { user, loading } = useAuthContext();

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
        <div className="flex gap-4 items-center">
          <Link href="/mypage">마이페이지</Link>
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="userImage"
              width={500}
              height={500}
            />
          ) : (
            <Avvvatars value="user.displayName" style="shape" />
          )}
          <h1>{user.displayName}</h1>
          <button type="button" onClick={() => logout()}>
            로그아웃
          </button>
        </div>
      )}
      {isLogin || isSignUp ? (
        <div className="fixed top-0 left-0 w-screen h-screen bg-neutral-500 p-4  backdrop-blur-4xl opacity-50 "></div>
      ) : null}
      {isLogin || isSignUp ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-neutral-100 p-4 rounded-2xl">
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
      ) : null}
    </div>
  );
}
