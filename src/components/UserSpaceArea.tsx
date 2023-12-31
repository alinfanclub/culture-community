"use client";

import { getSpaceData, makeSpace } from "@/app/api/fireStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import SpaceBlock from "./SpaceBlock";
import ClipSpinner from "./common/ClipSpinner";
import { use, useEffect, useState } from "react";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import getQueryClient from "@/app/provider/GetQueryClient";
import { QueryClient } from "@tanstack/react-query";

export default function UserSpaceArea() {
  const queryClient = useQueryClient();
  const [customLoading, setCustomLoading] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  const uploadNewPost = useMutation(
    
    {
      mutationFn: ({ spaceName }: { spaceName: string }) => makeSpace(spaceName),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["spaceArea"],
      })
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

  // useEffect(() => {
  //   const authToken = Cookies.get("authToken");
  //   if (authToken === undefined) {
  //     router.push("/");
  //     console.log("redirect");
  //     alert("로그인이 필요합니다.");
  //   }
  // }, [router, user]);

  if (isLoading || customLoading) return <ClipSpinner color="#fff" />;
  if (isError) return <div>error</div>;

  return (
    <div className="text-white p-4  bg-zinc-900">
      <div className="xl:flex gap-4 py-2 flex-wrap justify-center xl:justify-start grid grid-cols-2">
        {spaceArea
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((data, index) => (
            <SpaceBlock data={data} key={index} order={index} />
          ))}
        <button
          type="button"
          onClick={() => handleMakeSpace()}
          className="w-40 rounded-2xl aspect-[1/1.5] border border-dashed"
        >
          스페이스 추가 +
        </button>
      </div>
    </div>
  );
}
