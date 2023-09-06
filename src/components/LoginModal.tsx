"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { loginUser } from "@/app/api/firebase";

type LoginModalProps = {
  handleLoginModalState: () => void;
};

export default function LoginModal({ handleLoginModalState }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await loginUser(email, password).then(() => {
        handleLoginModalState();
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const firebaseError = error as FirebaseError;
        switch (firebaseError.code) {
          case "auth/invalid-email":
            setErrorMessages("유효하지 않은 이메일입니다.");
            break;
          case "auth/user-disabled":
            setErrorMessages("사용이 정지된 계정입니다.");
            break;
          case "auth/user-not-found":
            setErrorMessages("사용자를 찾을 수 없습니다.");
            break;
          case "auth/wrong-password":
            setErrorMessages("비밀번호가 틀렸습니다.");
            break;
          default:
            setErrorMessages("로그인에 실패했습니다.");
            break;
        }
        setTimeout(() => {
          setErrorMessages("");
        }, 3000);
      }
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <form onSubmit={handleSignUp}>
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`btn_default ${!email || !password ? "disabled" : ""}`}
          >
            로그인
          </button>
          {errorMessages && <span>{errorMessages}</span>}
        </div>
      </form>
    </div>
  );
}
