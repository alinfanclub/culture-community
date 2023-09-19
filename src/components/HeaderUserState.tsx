"use client";

import { logout } from "@/app/api/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import Link from "next/link";
import Avvvatars from "avvvatars-react";
import Image from "next/image";
import ClipSpinner from "./common/ClipSpinner";
import { useRouter } from "next/navigation";

export default function HeaderUserStateComponent() {
  const [userState, setUserState] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isMenu, setIsMenu] = useState<boolean>(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const handleLoginModalState = () => setIsLogin(!isLogin);
  const handleSignUpModalState = () => setIsSignUp(!isSignUp);
  const handleSetUser = (user: User) => setUserState(user);
  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    const btns = document.querySelectorAll(".btn");
    if (btns) {
      btns.forEach((btn) => {
        btn.addEventListener("click", function () {
          setIsMenu(false);
        });
      });
    }
  }, [user]);
  return (
    <>
      <div className="hidden xl:flex gap-4 items-center">
        <Link href="/cultureinfo">CultureInfo</Link>
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
            <button type="button" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
      <div className="xl:hidden">
        <button onClick={() => setIsMenu(true)}>menu</button>
      </div>
      <div
        className={`${
          isMenu ? "opacity-100 block" : "opacity-0 hidden"
        } bg-[rgba(0,0,0,0.5)] w-screen h-screen fixed top-0 left-0 transition-all xl:hidden`}
        onClick={() => {
          setIsMenu(false);
        }}
      ></div>
      <div
        className={`w-full xl:hidden fixed ${
          isMenu ? "top-0 right-0" : "top-0 -right-[100%]"
        } transition-all bg-zinc-900 h-screen p-4 px-6 text-white flex flex-col z-[20]`}
      >
        <div className="flex justify-between items-center mb-20">
          <h1 className="text-3xl">
            <Link href="/" className="btn">
              Deo Web
            </Link>
          </h1>
          <button onClick={() => setIsMenu(false)}>X</button>
        </div>
        <div className="flex flex-col gap-4 text-2xl min-h-[40%]">
          <Link href="/cultureinfo" className="btn">
            CultureInfo
          </Link>
          {user && (
            <Link href="/mypage" className="btn">
              마이페이지
            </Link>
          )}
        </div>
        <div className="text-2xl border-t-[1px] border-white pt-4">
          {!user ? (
            <div className="flex gap-8">
              <button onClick={() => handleLoginModalState()} type="button">
                로그인
              </button>
              <button onClick={() => setIsSignUp(true)} type="button">
                회원가입
              </button>
            </div>
          ) : (
            <div className="flex gap-8  flex-col">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="userImage"
                    width={500}
                    height={500}
                  />
                ) : (
                  <Avvvatars value="user.displayName" style="shape" size={70} />
                )}
                <h1>{user.displayName}</h1>
              </div>
              {/* <Link href="/mypage">마이페이지</Link> */}
              <div className="border-t-[1px] border-white mt-20 pt-4">
                <button type="button" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isLogin || isSignUp ? (
        <div className="fixed top-0 left-0 w-screen h-screen bg-neutral-500 p-4  backdrop-blur-4xl opacity-50 z-20 "></div>
      ) : null}
      {isLogin || isSignUp ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-100 p-4 rounded-2xl z-20">
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
    </>
  );
}
