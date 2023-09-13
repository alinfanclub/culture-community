"use client";

import { getSpaceData, makeSpace } from "@/app/api/fireStore";
import UserWelcomMsg from "./UserWelcomMsg";
import { useMutation, useQuery, useQueryClient } from "react-query";
import SpaceBlock from "./SpaceBlock";
import ClipSpinner from "./common/ClipSpinner";
import { use, useEffect, useState } from "react";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function UserSpaceArea() {
  const queryClient = useQueryClient();
  const [customLoading, setCustomLoading] = useState(false);
  const { user, userToken } = useAuthContext();
  const router = useRouter();

  const uploadNewPost = useMutation(
    ({ spaceName }: { spaceName: string }) => makeSpace(spaceName),
    {
      onSuccess: () => queryClient.invalidateQueries(["spaceArea"]),
    }
  );

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
              onError() {
                setCustomLoading(false);
              },
            }
          )
        : (alert("스페이스 이름을 입력해주세요"), setCustomLoading(false));
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

  useEffect(() => {
    const authToken = Cookies.get("authToken");

    if (!authToken && authToken !== userToken) {
      router.push("/"); // 쿠키가 없거나 로그인 상태가 아니면 메인 페이지로 리다이렉트
    }
  }, [router, user, userToken]);

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
            <SpaceBlock data={data} key={index} order={index} />
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
