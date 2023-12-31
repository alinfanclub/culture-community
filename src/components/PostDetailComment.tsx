"use client";

import { createComment, deleteComment, getCommentData } from "@/app/api/fireStoreComments";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import Avvvatars from "avvvatars-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import {  } from "react-query";
import QuillEditor from "./QuillEditor";
import SubmitBtn from "./common/SubmitBtn";
import { TfiMenuAlt } from "react-icons/tfi";
import { DocumentData } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import getQueryClient from "@/app/provider/GetQueryClient";


export default function PostDetailComment({ postDetail }: { postDetail: DocumentData }) {

  const { user } = useAuthContext();
  const param = useParams().postDetail;
  const queryClient = useQueryClient();
  const [isView, setIsView] = useState(false);
  const [html, setHtml] = useState("");

  const {
    data: commentsData = [],
    isLoading: commentLoading,
    isError: commentError,
  } = useQuery({
    queryKey: ["postDetailComments"],
    queryFn: () => getCommentData(param.toString()),
  });

  const commentCreateMutation = useMutation(
    {
      mutationFn: ({ postId, html }: { postId: string; html: string }) =>
        createComment(postId, html),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["postDetailComments"],
      })
    },
  );

  const commentDeleteMutation = useMutation(
    {
      mutationFn: ({ commentId }: { commentId: string}) =>
        deleteComment(commentId),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["postDetailComments"],
      })
    },
  );

  const handleHtmlChange = (html: string) => {
    setHtml(html);
    console.log(html);
  };

  const handleCommnetCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const postId = param.toString();

    if (!html || html === "" || html === "<p><br></p>")
      return alert("내용을 입력해주세요");
    commentCreateMutation.mutate({ postId, html },{
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["postDetailComments"],
      })
    });
    setHtml("");
  };

  const handleCommentDelete = (commentId: string) => {
    commentDeleteMutation.mutate({ commentId });
  };
  let displayName: string = user?.displayName ? user.displayName : "";
  return (
    <article
    className={`xl:fixed top-[48px] right-0 w-full h-full xl:h-calc-body transition-all mt-10 xl:mt-0 border-t-[1px] xl:border-t-0 ${
      isView ? "xl:w-[50%] xl:border-l-[1px] border-white" : "xl:w-[0%]"
    }`}
  >
    <section className="w-full transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col p-4 ">
      {postDetail?.isOpenCritic && (
        <>
          <div className="p-4 flex flex-col gap-4 w-full border-b-[1px] border-white">
            <div>
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="userImage"
                  width={500}
                  height={500}
                  className="w-8 aspect-square rounded-full"
                />
              ) : (
                <Avvvatars
                  value={displayName && displayName}
                  style="shape"
                />
              )}
            </div>
            <form onSubmit={handleCommnetCreate} className="w-full">
              <div className="w-full flex flex-col itmes-end gap-4">
                {user && (
                  <div className="h-full min-h-[20rem] xl:min-h-[10rem]  max-h-60 overflow-y-auto border border-white rounded-2xl px-4 pb-4">
                    <QuillEditor
                      html={html}
                      handleHtmlChange={handleHtmlChange}
                      placeholder={"여려분의 다양한 관점이 궁금해요"}
                    />
                  </div>
                )}
                {!user && (
                  <div className="h-full min-h-[20rem] xl:min-h-[10rem]  max-h-60 overflow-y-auto border border-white rounded-2xl px-4 pb-4 justify-center items-center flex">
                    <p>비평은 로그인 후에 가능합니다</p>
                  </div>
                )}
                <SubmitBtn
                  text="비평 작성"
                  style={`mx-0 ml-auto ${!user && "pointer-events-none"}`}
                />
              </div>
            </form>
          </div>
        </>
      )}

      <div className="py-4 xl:overflow-y-auto flex flex-col gap-4 divide-y divide-white">
        {commentsData?.map((data, index) => (
          <div key={index} className="flex flex-col gap-4 p-4">
            <div className="flex justify-between items-center">
              <div>
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
              </div>
              {user?.uid === data.writer && (
                <div
                  onClick={() => handleCommentDelete(data.commentId)}
                  className="cursor-pointer"
                >
                  x
                </div>
              )}
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
      className="w-10 h-16 absolute -left-10 top-[5%]  rounded-l-xl border-white border flex items-center justify-center flex-col gap-2 bg-zinc-900 border-r-0  cursor-pointer"
      onClick={() => setIsView(!isView)}
    >
      <TfiMenuAlt />
      <p>{commentsData ? commentsData.length : "0"}</p>
    </div>
  </article>
  );
}

