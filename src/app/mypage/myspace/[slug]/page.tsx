"use client";

import {
  deleteOldImage,
  getSpaceDataDetail,
  userSpaceBgUpdate,
} from "@/app/api/fireStore";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import ClipSpinner from "@/components/common/ClipSpinner";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Cookies from "js-cookie";

export default function MypageSpaceDetail() {
  const queryClient = useQueryClient();
  const param = useParams().slug;
  const [customLoading, setCustomLoading] = useState(false);
  const [userTokenCustom, setUserTokenCustom] = useState<string>("");
  const { user } = useAuthContext();
  const router = useRouter();

  const uploadBgImage = useMutation(
    ({ file, param }: { file: any; param: string }) =>
      userSpaceBgUpdate(file, param),
    {
      onSuccess: () => queryClient.invalidateQueries(["spaceAreaDetail"]),
    }
  );

  const handleFileChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    e.preventDefault();
    const selectedFile = e.target.files;
    //
    if (selectedFile) {
      setCustomLoading(true);
      spaceArea && deleteOldImage(spaceArea.backgroundImage);
      uploadBgImage.mutate(
        { file: selectedFile, param: param.toString() },
        {
          onSuccess() {
            queryClient.invalidateQueries(["spaceAreaDetail"]);
            setCustomLoading(false);
          },
          onError() {
            setCustomLoading(false);
          },
        }
      );
    }
  };

  const {
    data: spaceArea,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["spaceAreaDetail"],
    queryFn: () => getSpaceDataDetail(param.toString()),
  });

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    user
      ?.getIdToken()
      .then((data) => {
        setUserTokenCustom(data);
      })
      .then(() => {
        if (authToken == userTokenCustom) {
          router.push("/"); // 쿠키가 없거나 로그인 상태가 아니면 메인 페이지로 리다이렉트
        }
      });
  }, [router, user, userTokenCustom]);

  if (isLoading) return <div>loading</div>;
  if (isError) return <div>error</div>;

  return (
    spaceArea && (
      <section className="text-white w-[90%] mx-auto">
        <article
          className={`w-full h-80  overflow-hidden relative flex justify-center items-center mx-auto bg-white`}
        >
          <Image
            key={spaceArea.backgroundImage}
            src={spaceArea.backgroundImage}
            alt="spaceImage"
            width={1000}
            height={1000}
            priority={true}
            loading="eager"
            className="w-full h-full object-cover object-center z-[0] bg-white opacity-80"
          />
          <input
            type="file"
            title="file"
            id="file"
            className="absolute bottom-4 right-4 z-[10] hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file" className="absolute bottom-4 right-4 z-[10]">
            사진변경
          </label>
          {customLoading && <ClipSpinner color="#fff" />}
        </article>
        <article id="spaceBody">
          <div className="flex items-center justify-between py-4 border-b-2 border-white">
            <div className="flex gap-4 items-end">
              <h1 className="text-3xl">{spaceArea.title}</h1>
              <div className="flex gap-4 items-end">
                <p>{timeStampFormat(spaceArea.createdAt)}</p>
                <small>{formatAgo(timeStampFormat(spaceArea.createdAt))}</small>
              </div>
            </div>
            <Link href={`/mypage/write`}>글작성</Link>
          </div>
        </article>
      </section>
    )
  );
}
