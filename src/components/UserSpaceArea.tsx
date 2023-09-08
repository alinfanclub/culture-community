"use client";

import { getSpaceData, makeSpace } from "@/app/api/fireStore";
import UserWelcomMsg from "./UserWelcomMsg";
import { useEffect, useState } from "react";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { Timestamp } from "firebase/firestore";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { useQuery } from "react-query";
import SpaceBlock from "./SpaceBlock";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
export default function UserSpaceArea() {
  const user = useAuthContext();
  type spaceAreaType = {
    title: string;
    userInfos: {
      displayName: string;
      photoURL: string;
    };
    spaceId: string;
    uid: string;
    fixed: boolean;
    createdAt: Timestamp;
  };
  // const [spaceArea, setSpaceArea] = useState<any>([]);
  const handleMakeSpace = async () => {
    const spaceName = prompt("스페이스 이름을 입력하세요", "");
    try {
      spaceName
        ? await makeSpace(spaceName)
        : alert("스페이스 이름을 입력하세요");
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   if (user?.user) {
  //     getSpaceData(user.user).then((data) => {
  //       setSpaceArea(data);
  //       console.log(data);
  //     });
  //   }
  // }, [user]);

  const {
    data: spaceArea,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["spaceArea"],
    queryFn: () => getSpaceData(),
  });

  if (isLoading) return <div>loading</div>;
  if (isError) return <div>error</div>;

  return (
    <div className="bg-black">
      <div className="flex justify-between items-center">
        <UserWelcomMsg />
        <button type="button" onClick={() => handleMakeSpace()}>
          스페이스추가
        </button>
      </div>
      <div className="flex gap-4 py-2">
        {spaceArea
          ?.sort((a, b) => b.createdAt - a.createdAt)
          .map((data, index) => <SpaceBlock data={data} key={index} />)}
      </div>
    </div>
  );
}
