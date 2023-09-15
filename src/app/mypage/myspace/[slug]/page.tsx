"use client";

import {
  deleteOldImage,
  deletePost,
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
import PostBlock from "@/components/PostBlock";
import QuillViewer from "@/components/QuillViewer";
import WritePage from "@/components/WritePage";
import { set } from "firebase/database";

export default function MypageSpaceDetail() {
  const queryClient = useQueryClient();
  const param = useParams().slug;
  const [customLoading, setCustomLoading] = useState(false);
  const [eachPost, setEachPost] = useState<DocumentData | null>();
  const { user } = useAuthContext();
  const router = useRouter();
  const [isView, setIsView] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [isSpaceBodyOut, setIsSpaceBodyOut] = useState(false);

  const uploadBgImage = useMutation(
    ({ file, param }: { file: any; param: string }) =>
      userSpaceBgUpdate(file, param),
    {
      onSuccess: () => queryClient.invalidateQueries(["spaceAreaDetail"]),
    }
  );

  const deletePostMutation = useMutation(
    ({ postId }: { postId: string }) => deletePost(postId),
    {
      onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
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

  const handleGetInex = (index: number) => {
    setEachPost(spacePostList[index]);
    setIsView(true);
    setIsCreate(false);
  };

  const hadleDeletPost = (postId: string) => {
    try {
      window.confirm("삭제하시겠습니까?")
        ? deletePostMutation.mutate(
            { postId },
            {
              onSuccess: () => {
                setEachPost(null);
              },
            }
          )
        : false;
    } catch (error) {
      console.log(error);
    }
  };

  const handleWirteState = () => {
    setIsCreate(!isCreate);
    setIsView(false);
  };

  useEffect(() => {
    const spaceBodyElement = document.getElementById("spaceBody");

    if (spaceBodyElement) {
      const handleScroll = () => {
        const spaceBodyRect = spaceBodyElement.getBoundingClientRect();
        if (spaceBodyRect.top < 0) {
          setIsSpaceBodyOut(true);
        } else {
          setIsSpaceBodyOut(false);
        }
      };

      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  if (isLoading || spacePostListLoading) return <div>loading</div>;
  if (isError || spacePostListError) return <div>error</div>;

  return (
    spaceArea && (
      <section className={`text-white w-[90%] mx-auto flex flex-col h-auto`}>
        {/* <article
          className={`w-full h-[10%] overflow-hidden relative flex justify-center items-center mx-auto bg-white`}
        >
          <Image
            key={spaceArea.backgroundImage}
            src={spaceArea.backgroundImage}
            alt="spaceImage"
            width={1000}
            height={1000}
            priority={true}
            loading="eager"
            className="w-full h-full object-cover object-center bg-white opacity-80"
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
        </article> */}
        <article
          id="spaceBody"
          className={`h-[10%] ${isSpaceBodyOut ? "fixed w-full top-0" : ""}`}
        >
          <div className="flex items-center justify-between py-4 border-b-2 border-white">
            <div className="flex gap-4 items-end">
              <h1 className="text-3xl">{spaceArea.title}</h1>
              <div className="flex gap-4 items-end">
                <p>{timeStampFormat(spaceArea.createdAt)}</p>
                <small>{formatAgo(timeStampFormat(spaceArea.createdAt))}</small>
              </div>
            </div>
            {/* <Link
              href={{
                pathname: "/mypage/[slug]",
                query: { slug: param },
              }}
              as={`/mypage/${param}`}
            >
              글작성
            </Link> */}
            <button onClick={() => handleWirteState()}>글작성</button>
          </div>
        </article>
        <article className="flex box-border py-2 grow h-full">
          <div
            id=""
            className="flex flex-col gap-2 overflow-y-scroll w-60 bg-[rgba(0,0,0,0.7)] h-[100vh] "
          >
            {spacePostList.map((data, index) => (
              <PostBlock
                data={data}
                key={index}
                order={index}
                handleGetInex={handleGetInex}
              />
            ))}
          </div>
          <div className="">
            {eachPost && isView && (
              <div className="">
                <div className="">
                  <h1>{eachPost.title}</h1>
                  <div onClick={() => hadleDeletPost(eachPost.postId)}>
                    삭제
                  </div>
                </div>
                <QuillViewer html={eachPost.content} />
              </div>
            )}
            {isCreate && <WritePage setIsCreate={setIsCreate} />}
          </div>
        </article>
      </section>
    )
  );
}
