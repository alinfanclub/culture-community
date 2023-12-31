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
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import PostBlock from "@/components/PostBlock";
import QuillEditor from "@/components/QuillEditor";
import { deleteComment, getCommentData } from "@/app/api/fireStoreComments";
import { TfiMenuAlt } from "react-icons/tfi";
import Avvvatars from "avvvatars-react";

export default function MypageSpaceDetail() {
  const queryClient = useQueryClient();
  const param = useParams().slug;
  const { user } = useAuthContext();
  const router = useRouter();
  const [isComment, setIsComment] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [spaceTitleFix, setSpceTitleFix] = useState(false);
  const [spaceTitle, setSpaceTitle] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalStyle, setModalStyle] = useState({});
  const ModalElement = useRef<HTMLDivElement>(null);

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
    refetchOnWindowFocus: false,
  });

  const {
    data: spacePostList = [],
    isLoading: spacePostListLoading,
    isError: spacePostListError,
  } = useQuery({
    queryKey: ["spacePostList"],
    queryFn: () => getSpacePostList(param.toString()),
  });

  const {
    data: postDetail,
    isLoading: postDetailLoading,
    isError: postDetailError,
  } = useQuery({
    queryKey: ["spacePostList", selectedPostId],
    queryFn: () => getPostDetailData(selectedPostId).then((res) => {
      setPostInfo({ title: res.title, name: res.author });
      setHtml(res.content);
      return res;
    }),
    enabled: !!selectedPostId,
    
  },);

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
   
    {
      mutationFn: ({ postId }: { postId: string }) => deletePost(postId),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["spacePostList"],
      })
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
    {
      mutationFn: ({ param, title }: { param: string; title: string }) =>
        updateSPaceName(param, title),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["spaceAreaDetail"],
      })
    }
  );
  const CriticSateMutation = useMutation(
   
    { mutationFn:  ({ postId, state }: { postId: string; state: boolean }) =>
    updateCriticState(postId, state),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey: ["spacePostList"],
    })
    }
  );

  const commentDeleteMutation = useMutation(
   
    {
      mutationFn:  ({ commentId }: { commentId: string }) => deleteComment(commentId),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["postDetailComments"],
      })
    }
  );

  const createPostMutaition = useMutation(
    {
      mutationFn: 
      ({ param, imgQuery }: { param: string; imgQuery?: string }) =>
        createPostContentOnly(param, imgQuery),
        onSuccess: () => queryClient.invalidateQueries({
          queryKey: ["spacePostList"],
        })
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
    {
      mutationFn:({
        postId,
        postInfo,
      }: {
        postId: string;
        postInfo: { title: string; name: string };
      }) => updateTitle(postId, postInfo)
    }
  );

  const updateContentMutation = useMutation(
    {
      mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      updatePostContentOnly(postId, content)
    }
  );

  // useEffect(() => {
  //   const authToken = Cookies.get("authToken");
  //   if (authToken === undefined) {
  //     router.push("/");
  //     console.log("redirect");
  //     alert("로그인이 필요합니다.");
  //   }
  // }, [router, user]);

  const hadleDeletPost = (postId: string) => {
    try {
      if (window.confirm("삭제하시겠습니까?")) {
        deletePostMutation.mutate(
          { postId },
          {
            onSuccess: () => {
              setSelectedPostId("");
              setIsOpenModal(!isOpenModal);
            },
          }
        );
      }
      return false;
    } catch (error) {
      console.log(error);
    }
  };

  const handleCriticState = () => {
    try {
      CriticSateMutation.mutate(
        {
          postId: postDetail?.postId,
          state: postDetail?.isOpenCritic,
        },
        {
          onSuccess: () => {
            setIsOpenModal(!isOpenModal);
          },
        }
      );
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

    queryClient.invalidateQueries({
      queryKey: ["spacePostList"],
    });
  };

  // ~ 수정하기 데이터 상태 저장
  useEffect(() => {
    // setPostInfo({ title: postDetail?.title, name: postDetail?.author });
    // setHtml(postDetail?.content);
    setSpaceTitle(spaceArea?.title);
  }, [postDetail, spaceArea]);

  if (isLoading || spacePostListLoading) return <ClipSpinner color="#fff" />;
  if (isError || spacePostListError) return <ClipSpinner color="#fff" />;

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
                  <p>{formatAgo(spaceArea.createdAt)}</p>
                  <small>
                    {formatAgo(spaceArea.createdAt)}
                  </small>
                </div>
              </div>
              <button onClick={handleCreateContent}>글 작성</button>
            </div>
          </article>
          <article className="flex justify-between h-[90%] gap-10">
            <div className="flex flex-col overflow-y-auto h-auto w-[20%]  min-w-[200px]    bg-zinc-800">
              {spacePostList.map((data, index) => (
                <PostBlock
                  key={index}
                  data={data}
                  displayState={true}
                  hadleDeletPost={hadleDeletPost}
                  handleCriticState={handleCriticState}
                  isOpenModal={isOpenModal}
                  setIsOpenModal={setIsOpenModal}
                  modalStyle={modalStyle}
                  ModalElement={ModalElement}
                  setSelectedPostId={setSelectedPostId}
                  selectedPostId={selectedPostId}
                  setModalStyle={setModalStyle}
                />
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
