export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className=" bg-zinc-900 h-full">{children}</div>;
}
