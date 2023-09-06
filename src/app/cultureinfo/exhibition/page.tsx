import KaKaoMapComponent from "@/components/KaKaoMap";

export default function ExhibitionPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <h1>전시 페이지</h1>
      <div className="grow">
        <KaKaoMapComponent />
      </div>
    </div>
  );
}
