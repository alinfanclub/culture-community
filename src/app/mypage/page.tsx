import UserSpaceArea from "@/components/UserSpaceArea";
import UserWelcomMsg from "@/components/UserWelcomMsg";

export default function MyPage() {
  return (
    <div className="h-full">
      <UserWelcomMsg />
      <UserSpaceArea />
    </div>
  );
}
