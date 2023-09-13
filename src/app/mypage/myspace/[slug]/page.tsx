"use client";

import {
  deleteOldImage,
  getSpaceDataDetail,
  getSpacePostList,
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
import { DocumentData } from "firebase/firestore";

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

  const {
    data: spacePostList = [],
    isLoading: spacePostListLoading,
    isError: spacePostListError,
  } = useQuery({
    queryKey: ["spacePostList"],
    queryFn: () => getSpacePostList(param.toString()),
  });

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    // console.log(authToken);
    // user?.getIdToken().then((data) => {
    //   console.log(data);
    //   if (authToken === undefined) {
    //     router.push("/");
    //     console.log("redirect");
    //   }
    // });
    if (authToken === undefined) {
      router.push("/");
      console.log("redirect");
      alert("로그인이 필요합니다.");
    }
  }, [router, user]);

  if (isLoading || spacePostListLoading) return <div>loading</div>;
  if (isError || spacePostListError) return <div>error</div>;

  return (
    spaceArea && (
      <section className="text-white w-[90%] mx-auto max-h-screen flex flex-col">
        <article
          className={`w-full h-40  overflow-hidden relative flex justify-center items-center mx-auto bg-white`}
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
            <Link
              href={{
                pathname: "/mypage/[slug]",
                query: { slug: param },
              }}
              as={`/mypage/${param}`}
            >
              글작성
            </Link>
          </div>
        </article>
        <article
          id=""
          className="py-4 flex  gap-2 flex-col  h-full overflow-y-scroll grow w-fit pr-4 "
        >
          {spacePostList.map((data, index) => (
            <div key={index} className="w-60 rounded-2xl text-white ">
              <Link href={`/mypage/myspace/${data.spaceId}`}>
                <div className="rounded-lg max-w-full image-thumbnail-crop-frame overflow-hidden flex items-center justify-center aspect-[4/2]">
                  <Image
                    src={data.backgroundImage}
                    alt="spaceImage"
                    width={500}
                    height={500}
                    className="rounded-br-[30%] h-full w-full object-cover"
                  />
                </div>
              </Link>
              <div className="flex justify-between">
                <div>
                  <Link href={`/mypage/myspace/${data.spaceId}`}>
                    <h1>{data.title}</h1>
                  </Link>
                  <div className="flex gap-2 items-center">
                    <small>{data.userInfos.displayName}</small>
                    <span>-</span>
                    <small>{formatAgo(timeStampFormat(data.createdAt))}</small>
                  </div>
                </div>
                <button type="button">삭제</button>
              </div>
            </div>
          ))}
        </article>
      </section>
    )
  );
}
