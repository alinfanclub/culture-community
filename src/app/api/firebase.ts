// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  User,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { setUserData } from "./fireStore";
import Cookies from "js-cookie";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();

export function loginGoogle() {
  signInWithPopup(auth, provider).catch((error) => {
    const errorMessage = error.message;
    console.log(errorMessage);
  });
}

// ~ 유저 생성
export async function createUser(
  email: string,
  password: string,
  userName: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: userName });
    await setUserData(user);
    return user; // 여기에서 user 객체를 반환합니다.
  } catch (error) {
    console.error("Error creating user:");
    throw error;
  }
}

// ~ 유저 로그아웃
export async function logout() {
  await signOut(auth);
  Cookies.remove("authToken");
  return null;
}

//  ~ 유저 로그인
export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (userCredential.user) {
      const authToken = await userCredential.user.getIdToken();
      Cookies.set("authToken", authToken); // 쿠키에 토큰 저장
      return userCredential.user;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ~ 유저 상태관리 확인
export function onUserStateChanged(callback: (user: User | null) => void) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const authToken = await user.getIdToken();
      Cookies.set("authToken", authToken); // 로그인 시 쿠키 설정
    } else {
      Cookies.remove("authToken"); // 로그아웃 시 쿠키 제거
    }
    const currentUserToken = Cookies.get("authToken");
    callback(user);
    return currentUserToken;
  });
}

export const db = getFirestore(app);
