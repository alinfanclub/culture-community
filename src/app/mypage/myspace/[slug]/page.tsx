"use client";

import {
  deleteOldImage,
  deletePost,
  getPostDetailData,
  getSpaceDataDetail,
  getSpacePostList,
  updateCriticState,
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
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import Cookies from "js-cookie";
import PostBlock from "@/components/PostBlock";
import QuillEditor from "@/components/QuillEditor";
import { deleteComment, getCommentData } from "@/app/api/fireStoreComments";
import { TfiMenuAlt } from "react-icons/tfi";
import Avvvatars from "avvvatars-react";
import { GoDotFill } from "react-icons/go";

export default function MypageSpaceDetail() {
  const queryClient = useQueryClient();
  const param = useParams().slug;
  const [customLoading, setCustomLoading] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();
  const [isView, setIsView] = useState(false);
  const [isComment, setIsComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>("");

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

  const { data: postDetail } = useQuery({
    queryKey: ["spacePostList", selectedPostId],
    queryFn: () => getPostDetailData(selectedPostId),
    enabled: !!setSelectedPostId,
  });

  const {data: commentsData = [], isLoading: commentLoading, isError: commentError} = useQuery({
    queryKey: ["postDetailComments", selectedPostId],
    queryFn: () => getCommentData(selectedPostId),
    enabled: !!setSelectedPostId,
  })

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
    {
      onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
    }
  );

  const CriticSateMutation = useMutation(
    ({ postId, state }: { postId: string; state: boolean }) =>
      updateCriticState(postId, state),
    {
      onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
    }
  );

  const commentDeleteMutation = useMutation(
    ({commentId}: {commentId: string}) => deleteComment(commentId), {
      onSuccess: () => queryClient.invalidateQueries(["postDetailComments"]),
    }
  )

  // ~ 수정하기 데이터 상태 저장
  const [postInfo, setPostInfo] = useState({
    title: postDetail?.title,
    name: postDetail?.author,
  });
  const [html, setHtml] = useState(postDetail?.content);

  useEffect(() => {
    const authToken = Cookies.get("authToken");
    if (authToken === undefined) {
      router.push("/");
      console.log("redirect");
      alert("로그인이 필요합니다.");
    }
  }, [router, user]);

  const hadleDeletPost = (postId: string) => {
    try {
      window.confirm("삭제하시겠습니까?")
        ? deletePostMutation.mutate(
            { postId },
            {
              onSuccess: () => {
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
          postId: postDetail?.postId,
          postInfo,
          content: html,
        },
        {
          onSuccess: () => {
            setIsEditing(false);
            queryClient.invalidateQueries(["spacePostList"]);
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    e.preventDefault();
    const selectedFile = e.target.files;
    //

    setCustomLoading(true);
    spaceArea && deleteOldImage(spaceArea.backgroundImage);
    uploadBgImage.mutate(
      { file: selectedFile, param: param.toString() },
      {
        onSuccess() {
          setCustomLoading(false);
          alert("사진이 변경되었습니다.");
        },
        onError() {
          setCustomLoading(false);
          alert("사진 변경에 실패하였습니다.");
        },
      }
    );
  };

  const handleCriticState = () => {
    try {
      CriticSateMutation.mutate({
        postId: postDetail?.postId,
        state: postDetail?.isOpenCritic,
      });
    } catch (error) {
      console.log("cirtic state error");
    }
  };

  // ~ 수정하기 데이터 상태 저장
  const handleChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPostInfo((item) => ({ ...item, [name]: value }));
    console.log(postInfo);
  };
  // ~ 수정하기 데이터 상태 저장
  const handleHtmlChange = (html: string) => {
    setHtml(html);
  };

  const handleCommentDelete = (commentId: string) => {
    commentDeleteMutation.mutate({commentId})
  }

  // ~ 수정하기 데이터 상태 저장
  useEffect(() => {
    if (postDetail) {
      setPostInfo({ title: postDetail.title, name: postDetail.author });
      setHtml(postDetail.content);
    }
  }, [isEditing, postDetail]);

  if (isLoading || spacePostListLoading) return <div>loading</div>;
  if (isError || spacePostListError) return <div>error</div>;

  return (
    spaceArea && (
      <>
        <section
          className={`text-white w-[95%] xl:w-[90%] mx-auto flex flex-col h-fit`}
        >
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
            {spacePostList?.map((data, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedPostId(data.postId), setIsView(true);
                }}
              >
                <PostBlock data={data} key={index} displayState={true} />
              </div>
            ))}
          </article>
        </section>

        <div
          className={`${
            isView ? "opacity-100 z-30" : "opacity-0 -z-10"
          } bg-[rgba(0,0,0,0.5)] w-screen h-screen fixed top-0 left-0 transition-all]`}
          onClick={() => {
            setIsView(false), setIsEditing(false), setIsComment(false);
          }}
        ></div>
        {
          <article
            className={`w-full xl:w-[50%] fixed ${
              isView ? "top-0 right-0" : "top-0 -right-[100%]"
            } transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col`}
          >
            {isEditing ? (
              <div className="h-full w-full">
                <form
                  onSubmit={handleSubmitPost}
                  className=" flex flex-col gap-2 h-full"
                >
                  <label htmlFor="" className="px-4">
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
                  <label htmlFor="" className="px-4">
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
                  <div className="h-full overflow-y-scroll px-4">
                    <QuillEditor
                      html={html}
                      handleHtmlChange={handleHtmlChange}
                    />
                  </div>
                  <div className="min-h-[5%] flex items-center gap-8 justify-end bg-zinc-800 px-4">
                    <button onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? "수정 취소" : "수정 하기"}
                    </button>
                    <button type="submit">제출</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-baseline gap-8 pb-10 px-4">
                  <p className="h-16  line  leading-[4rem] text-2xl">
                    {postDetail?.title}
                  </p>
                  <p className="h-8 line  leading-[2rem]">
                    {postDetail?.author}
                  </p>
                </div>

                <div className="grow overflow-y-scroll px-4 pb-4">
                  <div
                    className=" overflow-wrap break-words textView"
                    dangerouslySetInnerHTML={{ __html: postDetail?.content }}
                  />
                </div>
                <div className="min-h-[5%] flex items-center gap-4 justify-end bg-zinc-800 px-4">
                  <button onClick={handleCriticState}>
                    상태 변경  
                  </button>
                  <div className='flex gap-2 items-center'>
                  헌재: {postDetail?.isOpenCritic ? <GoDotFill className=" text-green-400" /> : <GoDotFill className=" text-red-400" /> }
                  </div>
                  <button onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "수정 취소" : "수정 하기"}
                  </button>
                  <button onClick={() => hadleDeletPost(postDetail?.postId)}>
                    삭제
                  </button>
                </div>


          <div
            className={`${
              isComment ? "opacity-100 z-[31]" : "opacity-0 -z-10"
            } bg-[rgba(0,0,0,0.8)] w-screen h-screen absolute top-0 left-0 transition-all]`}
            onClick={() => {
              setIsComment(false);
            }}
            ></div>
                <article
                    className={`absolute top-0 right-0 h-screen transition-all  xl:screen z-[32] ${
                      isComment ? "w-[79%] xl:w-[79%] border-l-[1px] border-white" : " w-[0%]"
                    }`}
                  >
                    <section className="w-full transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col p-4">
                      <div className="py-4 xl:overflow-y-auto flex flex-col gap-4 divide-y divide-white">
                          {commentsData?.map((data, index) => (
                            <div key={index} className="flex flex-col gap-4 p-4">
                              <div className='flex justify-between items-center'>
                                <div>
                                <div className='flex items-center gap-4'>
                                {data.userInfos.photoURL ? (
                                  <Image
                                    src={data.userInfos.photoURL}
                                    alt="userImage"
                                    width={500}
                                    height={500}
                                    className='w-8 aspect-square rounded-full'
                                  />
                                ) : (
                                  <Avvvatars value={data.userInfos.displayName} style="shape" />
                                )}
                                <p>{data.userInfos.displayName}</p>
                              </div>
                                </div>
                                {user?.uid === data.writer && (<div onClick={() => handleCommentDelete(data.commentId)} className='cursor-pointer'>x</div>)}
                              </div>
                              <div className="flex flex-col gap-2">
                                <div
                                  className="overflow-wrap break-words "
                                  dangerouslySetInnerHTML={{ __html: data.comment }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>
                    <div
                      className="w-10 h-16 absolute -left-10 top-[10%]  rounded-l-xl border-white border flex items-center justify-center flex-col gap-2 bg-zinc-900 border-r-0"
                      onClick={() => setIsComment(!isComment)}
                    >
                      <TfiMenuAlt />
                      <p>{commentsData? commentsData.length : "0"}</p>
                    </div>
                  </article>
              </div>
            )}
            <button
              onClick={() => {
                setIsView(false), setIsEditing(false);
              }}
              className="absolute top-4 right-4"
            >
              x
            </button>
          </article>
        }
      </>
    )
  );
}
