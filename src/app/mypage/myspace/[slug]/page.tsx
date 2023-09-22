"use client";

import {
  createPostContentOnly,
  deleteOldImage,
  deletePost,
  getPostDetailData,
  getSpaceDataDetail,
  getSpacePostList,
  updateCriticState,
  updatePost,
  updatePostContentOnly,
  updateSPaceName,
  updateTitle,
  userSpaceBgUpdate,
} from "@/app/api/fireStore";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import ClipSpinner from "@/components/common/ClipSpinner";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Cookies from "js-cookie";
import PostBlock from "@/components/PostBlock";
import QuillEditor from "@/components/QuillEditor";
import { deleteComment, getCommentData } from "@/app/api/fireStoreComments";
import { TfiMenuAlt } from "react-icons/tfi";
import Avvvatars from "avvvatars-react";

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
  const [spaceTitleFix, setSpceTitleFix] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState("");
  // ~ 수정하기 데이터 상태 저장
  const [postInfo, setPostInfo] = useState({
    title: "",
    name: "",
  });
  const [html, setHtml] = useState("");

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
    onSuccess(data) {
      setPostInfo({ title: data.title, name: data.author });
      setHtml(data.content);
    },
  });

  const {
    data: commentsData = [],
    isLoading: commentLoading,
    isError: commentError,
  } = useQuery({
    queryKey: ["postDetailComments", selectedPostId],
    queryFn: () => getCommentData(selectedPostId),
    enabled: !!setSelectedPostId,
  });

  const deletePostMutation = useMutation(
    ({ postId }: { postId: string }) => deletePost(postId),
    {
      onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
    }
  );

  // const uploadBgImage = useMutation(
  //   ({ file, param }: { file: any; param: string }) =>
  //     userSpaceBgUpdate(file, param),
  //   {
  //     onSuccess: () => queryClient.invalidateQueries(["spaceAreaDetail"]),
  //   }
  // );

  // const EditPostMutation = useMutation(
  //   ({
  //     postId,
  //     postInfo,
  //     content,
  //   }: {
  //     postId: string;
  //     postInfo: { title: string; name: string };
  //     content: string;
  //   }) => updatePost(postId, postInfo, content),
  //   {
  //     onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
  //   }
  // );

  const SpaceTitleFixMutaion = useMutation(
    ({ param, title }: { param: string; title: string }) =>
      updateSPaceName(param, title),
    {
      onSuccess: () => queryClient.invalidateQueries(["spaceAreaDetail"]),
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
    ({ commentId }: { commentId: string }) => deleteComment(commentId),
    {
      onSuccess: () => queryClient.invalidateQueries(["postDetailComments"]),
    }
  );

  const createPostMutaition = useMutation(
    ({ param, imgQuery }: { param: string; imgQuery?: string }) =>
      createPostContentOnly(param, imgQuery),
    {
      onSuccess: () => queryClient.invalidateQueries(["spacePostList"]),
    }
  );

  const handleCreateContent = () => {
    createPostMutaition.mutate(
      {
        param: param.toString(),
      },
      {
        onSuccess: (data) => {
          setSelectedPostId(data);
        },
      }
    );
  };

  const updateTitleMutation = useMutation(
    ({
      postId,
      postInfo,
    }: {
      postId: string;
      postInfo: { title: string; name: string };
    }) => updateTitle(postId, postInfo)
  );

  const updateContentMutation = useMutation(
    ({ postId, content }: { postId: string; content: string }) =>
      updatePostContentOnly(postId, content)
  );

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
      if (window.confirm("삭제하시겠습니까?")) {
        deletePostMutation.mutate(
          { postId },
          {
            onSuccess: () => {
              setIsView(false);
              setSelectedPostId("");
            },
          }
        );
      }
      return false;
    } catch (error) {
      console.log(error);
    }
  };

  // const handleSubmitPost = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   try {
  //     EditPostMutation.mutate(
  //       {
  //         postId: postDetail?.postId,
  //         postInfo,
  //         content: html,
  //       },
  //       {
  //         onSuccess: () => {
  //           setIsEditing(false);
  //           queryClient.invalidateQueries(["spacePostList"]);
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const handleFileChange = (
  //   e: React.ChangeEvent<EventTarget & HTMLInputElement>
  // ) => {
  //   e.preventDefault();
  //   const selectedFile = e.target.files;
  //   //

  //   setCustomLoading(true);
  //   spaceArea && deleteOldImage(spaceArea.backgroundImage);
  //   uploadBgImage.mutate(
  //     { file: selectedFile, param: param.toString() },
  //     {
  //       onSuccess() {
  //         setCustomLoading(false);
  //         alert("사진이 변경되었습니다.");
  //       },
  //       onError() {
  //         setCustomLoading(false);
  //         alert("사진 변경에 실패하였습니다.");
  //       },
  //     }
  //   );
  // };

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
  const handleChange = async (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPostInfo((postInfo) => ({ ...postInfo, [name]: value }));
    const texts = {
      title: postInfo.title,
      author: postInfo.name,
    };
    name === "title" ? (texts.title = value) : (texts.author = value);
    updateTitleMutation.mutate({
      postId: postDetail?.postId,
      postInfo: { title: texts.title, name: texts.author },
    });
  };
  // ~ 수정하기 데이터 상태 저장
  const handleHtmlChange = (html: string) => {
    setHtml(html);
    const texts = {
      html: html,
    };
    updateContentMutation.mutate({
      postId: postDetail?.postId,
      content: texts.html,
    });
  };

  const handleCommentDelete = (commentId: string) => {
    commentDeleteMutation.mutate({ commentId });
  };

  const handleSpaceTitleFix = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSpceTitleFix(!spaceTitleFix);
      SpaceTitleFixMutaion.mutate({
        param: param.toString(),
        title: spaceTitle,
      });
    }
  };

  const handleBlurSpaceTitleFix = () => {
    setSpceTitleFix(!spaceTitleFix);
    SpaceTitleFixMutaion.mutate({
      param: param.toString(),
      title: spaceTitle,
    });
  };

  const handlePostInfoBlur = () => {
    queryClient.invalidateQueries(["spacePostList"]);
  };

  // ~ 수정하기 데이터 상태 저장
  useEffect(() => {
    // setPostInfo({ title: postDetail?.title, name: postDetail?.author });
    // setHtml(postDetail?.content);
    setSpaceTitle(spaceArea?.title);
  }, [postDetail, spaceArea]);

  if (isLoading || spacePostListLoading) return <div>loading</div>;
  if (isError || spacePostListError) return <div>error</div>;

  return (
    spaceArea && (
      <>
        <section
          className={`text-white w-[95%] xl:w-[90%] mx-auto flex flex-col h-full max-h-screen`}
        >
          {/* <article
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
          </article> */}
          <article id="spaceBody" className={`h-fit xl:h-[10%]`}>
            <div className="flex xl:items-center justify-between py-4 border-b-2 border-white items-start">
              <div className="flex gap-4 xl:items-end flex-col xl:flex-row">
                {spaceTitleFix ? (
                  <input
                    type="text"
                    className="bg-transparent text-3xl w-fit"
                    autoFocus
                    value={spaceTitle}
                    onKeyDown={handleSpaceTitleFix}
                    onChange={(e) => setSpaceTitle(e.target.value)}
                    onBlur={handleBlurSpaceTitleFix}
                  />
                ) : (
                  <h1
                    className="text-3xl"
                    onDoubleClick={() => setSpceTitleFix(!spaceTitleFix)}
                  >
                    {spaceArea.title}
                  </h1>
                )}
                <div className="flex gap-4 items-end">
                  <p>{timeStampFormat(spaceArea.createdAt)}</p>
                  <small>
                    {formatAgo(timeStampFormat(spaceArea.createdAt))}
                  </small>
                </div>
              </div>
              <button onClick={handleCreateContent}>글 작성</button>
            </div>
          </article>
          <article className="flex justify-between h-[90%] gap-10">
            <div className="flex flex-col overflow-y-auto h-full min-h-full   w-[20%] bg-zinc-800">
              {spacePostList?.map((data, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedPostId(data.postId);
                  }}
                  className={`p-4 w-full border transition-all rounded-2xl ${
                    selectedPostId === data.postId
                      ? "bg-zinc-900 border-white"
                      : "border-transparent"
                  }`}
                >
                  <PostBlock data={data} key={index} displayState={true} />
                  <div className="flex items-center justify-between">
                    <button onClick={handleCriticState}>
                      {data.isOpenCritic ? "비공개하기" : "공개하기"}
                    </button>
                    <button onClick={() => hadleDeletPost(data.postId)}>
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-full w-full overflow-y-scroll">
              {selectedPostId !== "" && (
                <>
                  <label htmlFor="" className="">
                    <input
                      type="text"
                      name="title"
                      onChange={handleChange}
                      className="bg-transparent w-full h-16 border-none "
                      placeholder="제목을 입력해주세요"
                      required
                      value={postInfo?.title || ""}
                      onBlur={handlePostInfoBlur}
                    />
                  </label>
                  <label htmlFor="" className="">
                    <input
                      type="text"
                      name="name"
                      onChange={handleChange}
                      className="bg-transparent w-full h-16 border-none "
                      placeholder="이름을 입력해주세요"
                      required
                      value={postInfo?.name || ""}
                      onBlur={handlePostInfoBlur}
                    />
                  </label>
                  <div className="h-auto">
                    <QuillEditor
                      html={html}
                      handleHtmlChange={handleHtmlChange}
                    />
                  </div>

                  <article
                    className={`fixed top-0 right-0 h-screen transition-all  xl:screen z-[32] ${
                      isComment
                        ? "w-[79%] xl:w-[50%] border-l-[1px] border-white"
                        : " w-[0%]"
                    }`}
                  >
                    <section className="w-full transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col p-4">
                      <div className="py-4 xl:overflow-y-auto flex flex-col gap-4 divide-y divide-white">
                        {commentsData?.map((data, index) => (
                          <div key={index} className="flex flex-col gap-4 p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                {data.userInfos.photoURL ? (
                                  <Image
                                    src={data.userInfos.photoURL}
                                    alt="userImage"
                                    width={500}
                                    height={500}
                                    className="w-8 aspect-square rounded-full"
                                  />
                                ) : (
                                  <Avvvatars
                                    value={data.userInfos.displayName}
                                    style="shape"
                                  />
                                )}
                                <p>{data.userInfos.displayName}</p>
                              </div>
                              {user?.uid === data.writer && (
                                <div
                                  onClick={() =>
                                    handleCommentDelete(data.commentId)
                                  }
                                  className="cursor-pointer"
                                >
                                  x
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <div
                                className="overflow-wrap break-words "
                                dangerouslySetInnerHTML={{
                                  __html: data.comment,
                                }}
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
                      <p>{commentsData ? commentsData.length : "0"}</p>
                    </div>
                  </article>
                </>
              )}
            </div>
          </article>
        </section>
      </>
    )
  );
}
