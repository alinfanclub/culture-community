import HeaderUserStateComponent from "@/components/HeaderUserState";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext";
import Script from "next/script";
import ReactQueryProvider from "./provider/ReactQueryProvider";
import "react-quill/dist/quill.snow.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const KAKAO_SDK_URL = `//dapi.kakao.com/v2/maps/sdk.js?appkey=3e1a77f956eae1e9dd319a03071ce091&autoload=false`;
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <Script src={KAKAO_SDK_URL} strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <FirebaseAuthProvider>
          <header className="flex justify-between p-2 items-center h-[48px] min-h-[48px]  xl:h-[48px] sticky top-0 z-[15] bg-white">
            <h1>
              <Link href="/">Deo Web</Link>
            </h1>
            <nav className="flex gap-4 items-center">
              <HeaderUserStateComponent />
            </nav>
          </header>
          <div className="xl:h-calc-body h-auto min-h-full text-white bg-zinc-900">
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </div>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
