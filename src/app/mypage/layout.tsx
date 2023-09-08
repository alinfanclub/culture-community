export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-grow px-2 bg-black">{children}</div>
    </div>
  );
}
