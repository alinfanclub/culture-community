import Link from "next/link";

export default function cultureinfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full h-full">
      <nav>
        <Link href="/cultureinfo/exhibition">MovetoexhitionMap</Link>
      </nav>
      <div className="flex-grow bg-green-200">{children}</div>
    </div>
  );
}
