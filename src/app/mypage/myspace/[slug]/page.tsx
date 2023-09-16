"use client";

import {
  deleteOldImage,
  deletePost,
  getSpaceDataDetail,
  getSpacePostList,
  updatePost,
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
import {
  MutateOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import Cookies from "js-cookie";
import { DocumentData } from "firebase/firestore";
import PostBlock from "@/components/PostBlock";
import QuillEditor from "@/components/QuillEditor";

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
  const [isEditing, setIsEditing] = useState(false);
  const [html, setHtml] = useState(eachPost?.content);
  const [indexState, setIndexState] = useState<number>(0);
  const [postInfo, setPostInfo] = useState({
    title: eachPost?.title,
    name: eachPost?.author,
  });

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

  const EditPostMutation = useMutation(
    ({
      postId,
      postInfo,
      content,
    }: {
      postId: string;
      postInfo: { title: string; name: string };
      content: string;
    }) => updatePost(postId, postInfo, content),
    { onSuccess: () => queryClient.invalidateQueries(["spacePostList"]) }
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
    if (authToken === undefined) {
      router.push("/");
      console.log("redirect");
      alert("로그인이 필요합니다.");
    }
  }, [router, user]);

  const handleGetInex = (index: number) => {
    setIndexState(index);
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
                setIsView(false);
              },
            }
          )
        : false;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      EditPostMutation.mutate(
        {
          postId: eachPost?.postId,
          postInfo,
          content: html,
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            setIsView(false);
          },
        }
      );
      // await updatePost(eachPost?.postId, postInfo, html);
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

  const handleChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPostInfo((item) => ({ ...item, [name]: value }));
    console.log(postInfo);
  };

  const handleHtmlChange = (html: string) => {
    setHtml(html);
  };

  useEffect(() => {
    if (eachPost) {
      setPostInfo({ title: eachPost.title, name: eachPost.author });
      setHtml(eachPost.content);
    }
  }, [isEditing, eachPost]);

  if (isLoading || spacePostListLoading) return <div>loading</div>;
  if (isError || spacePostListError) return <div>error</div>;

  return (
    spaceArea && (
      <>
        <section className={`text-white w-[90%] mx-auto flex flex-col h-fit`}>
          <article
            className={`w-full h-20 xl:h-20 overflow-hidden relative flex justify-center items-center mx-auto bg-white`}
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
            <label htmlFor="file" className="absolute bottom-4 right-4">
              사진변경
            </label>
            {customLoading && <ClipSpinner color="#fff" />}
          </article>
          <article id="spaceBody" className={`h-fit xl:h-[10%]`}>
            <div className="flex xl:items-center justify-between py-4 border-b-2 border-white items-start">
              <div className="flex gap-4 xl:items-end flex-col xl:flex-row">
                <h1 className="text-3xl">{spaceArea.title}</h1>
                <div className="flex gap-4 items-end">
                  <p>{timeStampFormat(spaceArea.createdAt)}</p>
                  <small>
                    {formatAgo(timeStampFormat(spaceArea.createdAt))}
                  </small>
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
          <article className="grid grid-cols-2 h-auto gap-4 xl:flex py-2 xl:grow xl:h-full">
            {spacePostList.map((data, index) => (
              <PostBlock
                data={data}
                key={index}
                order={index}
                handleGetInex={handleGetInex}
              />
            ))}
          </article>
        </section>

        <div
          className={`${
            isView ? "opacity-100 z-30" : "opacity-0 -z-10"
          } bg-[rgba(0,0,0,0.5)] w-screen h-screen fixed top-0 left-0 transition-all]`}
          onClick={() => {
            setIsView(false), setIsEditing(false);
          }}
        ></div>
        {
          <div
            className={`w-full xl:w-[50%] fixed ${
              isView ? "top-0 right-0" : "top-0 -right-[100%]"
            } transition-all bg-zinc-900 h-screen p-4 px-6 text-white z-[30]`}
          >
            {isEditing ? (
              <div className="h-full w-full">
                <form
                  onSubmit={handleSubmitPost}
                  className=" flex flex-col gap-2 h-full"
                >
                  <label htmlFor="" className="">
                    <input
                      type="text"
                      name="title"
                      onChange={handleChange}
                      className="bg-transparent w-full h-16"
                      placeholder="제목을 입력해주세요"
                      required
                      value={postInfo.title}
                    />
                  </label>
                  <label htmlFor="" className="">
                    <input
                      type="text"
                      name="name"
                      onChange={handleChange}
                      className="bg-transparent w-full h-16"
                      placeholder="이름을 입력해주세요"
                      required
                      value={postInfo.name}
                    />
                  </label>
                  <div className="h-full overflow-y-scroll mb-24">
                    <QuillEditor
                      html={html}
                      handleHtmlChange={handleHtmlChange}
                    />
                  </div>
                  <div className="w-full h-20 bg-zinc-700 flex gap-4 fixed left-0 bottom-0 p-2 2xl:p-6 box-border">
                    <button type="submit">제출</button>
                    <button type="button">임시저장</button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-8 pb-10">
                  <p className="h-16  line  leading-[4rem] text-2xl">
                    {eachPost?.title}
                  </p>
                  <p className="h-8 line  leading-[2rem]">{eachPost?.author}</p>
                </div>

                <div className="h-full overflow-y-scroll">
                  <div
                    className=" overflow-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: eachPost?.content }}
                  />
                </div>
              </>
            )}
            <div className="absolute right-4 top-4 flex items-center gap-8">
              <button onClick={() => hadleDeletPost(eachPost?.postId)}>
                삭제
              </button>
              <button onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "수정 취소" : "수정 하기"}
              </button>
              <button
                onClick={() => {
                  setIsView(false), setIsEditing(false);
                }}
              >
                x
              </button>
            </div>
          </div>
        }
      </>
    )
  );
}
