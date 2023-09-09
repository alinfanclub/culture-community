"use client";

import { getSpaceData, makeSpace } from "@/app/api/fireStore";
import UserWelcomMsg from "./UserWelcomMsg";
import { useMutation, useQuery, useQueryClient } from "react-query";
import SpaceBlock from "./SpaceBlock";
import ClipSpinner from "./common/ClipSpinner";
import { use, useEffect, useState } from "react";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { useRouter } from "next/navigation";
export default function UserSpaceArea() {
  const queryClient = useQueryClient();
  const [customLoading, setCustomLoading] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  const uploadNewPost = useMutation<
    string,
    Error,
    { spaceName: string },
    unknown
  >(({ spaceName }: { spaceName: string }) => makeSpace(spaceName), {
    onSuccess: () => queryClient.invalidateQueries(["spaceArea"]),
  });

  const handleMakeSpace = async () => {
    const spaceName = prompt("스페이스 이름을 입력하세요", "");
    try {
      setCustomLoading(true);
      spaceName
        ? uploadNewPost.mutate(
            { spaceName },
            {
              onSuccess() {
                setCustomLoading(false);
              },
            }
          )
        : alert("스페이스 이름을 입력하세요");
    } catch (error) {
      console.log(error);
    }
  };

  const {
    data: spaceArea = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["spaceArea"],
    queryFn: () => getSpaceData(),
  });

  if (isLoading || customLoading) return <ClipSpinner color="#fff" />;
  if (isError) return <div>error</div>;

  return (
    <div className="text-white p-4">
      <div className="flex justify-between items-center">
        <UserWelcomMsg />
        <button type="button" onClick={() => handleMakeSpace()}>
          스페이스추가
        </button>
      </div>
      <div className="flex gap-4 py-2">
        {spaceArea
          .sort((a, b) => b.createdAt - a.createdAt)
          .map((data, index) => (
            <SpaceBlock data={data} key={index} />
          ))}
        <button
          type="button"
          onClick={() => handleMakeSpace()}
          className="w-60 rounded-2xl aspect-[4/2] border border-dashed"
        >
          스페이스 추가 +
        </button>
      </div>
    </div>
  );
}
