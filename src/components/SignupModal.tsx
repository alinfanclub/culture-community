"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { createUser } from "@/app/api/firebase";
import { User } from "firebase/auth";

type SignupModalProps = {
  handleSignUpModalState: () => void;
  handleSetUser: (user: User) => void;
};

export default function SignupModal({
  handleSignUpModalState,
  handleSetUser,
}: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState(""); // 추가
  const [errorMessages, setErrorMessages] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUser(email, password, userName).then((user) => {
        handleSignUpModalState();
        handleSetUser(user);
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        const firebaseError = error as FirebaseError;
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setErrorMessages("이미 사용중인 이메일입니다.");
            break;
          case "auth/invalid-email":
            setErrorMessages("유효하지 않은 이메일입니다.");
            break;
          case "auth/weak-password":
            setErrorMessages("비밀번호는 6자리 이상이어야 합니다.");
            break;
          default:
            setErrorMessages("회원가입에 실패했습니다.");
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
          <input
            type="text"
            name="userName"
            id="userName"
            placeholder="userName"
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          <button
            type="submit"
            className={`btn_default ${
              !email || !password || !userName ? "disabled" : ""
            }`}
          >
            회원가입
          </button>
          {errorMessages && <span>{errorMessages}</span>}
        </div>
      </form>
    </div>
  );
}
