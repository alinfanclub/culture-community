"use client";

import { getPostDetailData } from "@/app/api/fireStore";
import ClipSpinner from "@/components/common/ClipSpinner";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { TfiMenuAlt } from "react-icons/tfi";
import QuillEditor from "@/components/QuillEditor";
import Avvvatars from "avvvatars-react";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import Image from "next/image";
import SubmitBtn from "@/components/common/SubmitBtn";
import { createComment, getCommentData } from "@/app/api/fireStoreComments";
import { comment } from "postcss";
import { set } from "firebase/database";

export default function PostDetailPage() {
  const queryClient = useQueryClient();
  const param = useParams().postDetail;
  const [isView, setIsView] = useState(false);
  const [html, setHtml] = useState("");
  const { user } = useAuthContext();
  const {
    data: postDetail,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["postDetail"],
    queryFn: () => getPostDetailData(param.toString()),
  });

  const {data: commentsData = [], isLoading: commentLoading, isError: commentError} = useQuery({
    queryKey: ["postDetailComments"],
    queryFn: () => getCommentData(param.toString()),
  })

  const commentCreateMutation = useMutation(
    ({postId, html }: { postId: string,html: string }) => createComment(postId,html), {
      onSuccess: () => queryClient.invalidateQueries(["postDetailComments"]),
    }
  )

  const handleHtmlChange = (html: string) => {
    setHtml(html);
    console.log(html);
  };

  const handleCommnetCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const postId = param.toString();
    commentCreateMutation.mutate({postId, html})
    setHtml("")
  }

  if (isLoading || commentLoading) return <ClipSpinner color="#fff" />;
  if (isError || commentError) return <div>error...</div>;

  return (
    <section className="relative overflow-y-auto xl:overflow-hidden">
      <article className="flex flex-col px-4 xl:p-0">
        <div className="flex items-baseline gap-8 pb-10 px-4">
          <p className="h-16  line  leading-[4rem] text-2xl">
            {postDetail?.title}
          </p>
          <p className="h-8 line  leading-[2rem]">{postDetail?.author}</p>
        </div>
        <div className="xl:grow px-4 pb-4 h-fit">
          <div
            className="break-words textView"
            dangerouslySetInnerHTML={{ __html: postDetail?.content }}
          />
        </div>
      </article>
      <article
        className={`xl:fixed top-[48px] right-0 w-full h-full transition-all mt-10 xl:mt-0 border-t-[1px] border-white xl:border-none xl:h-calc-body ${
          isView ? "xl:w-[50%]" : "xl:w-[0%]"
        }`}
      >
        <section className="w-full transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col p-4 xl:border-l-[1px] border-white">
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
                    />
                  ) : (
                    <Avvvatars value="user.displayName" style="shape" />
                  )}
                </div>
                <form onSubmit={handleCommnetCreate} className="w-full">
                  <div className="w-full flex flex-col itmes-end gap-4">
                    <div className="h-full min-h-[20rem] xl:min-h-[10rem]  max-h-60 overflow-y-auto border border-white rounded-2xl px-4 pb-4">
                      <QuillEditor
                        html={html}
                        handleHtmlChange={handleHtmlChange}
                        placeholder={"여려분의 다양한 관점이 궁금해요"}
                      />
                    </div>
                    <SubmitBtn text="비평 작성" style="mx-0 ml-auto" />
                  </div>
                </form>
              </div>
            </>
          )}

          <div className="py-4 xl:overflow-y-auto flex flex-col gap-4 divide-y divide-white">
              {commentsData?.map((data, index) => (
                <div key={index} className="flex flex-col gap-4 p-4">
                  <div className='flex items-center gap-4'>
                    {data.userInfos.photoURL ? (
                      <Image
                        src={data.userInfos.photoURL}
                        alt="userImage"
                        width={500}
                        height={500}
                      />
                    ) : (
                      <Avvvatars value="user.displayName" style="shape" />
                    )}
                    <p>{data.userInfos.displayName}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="overflow-wrap break-words textView"
                      dangerouslySetInnerHTML={{ __html: data.comment }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </section>
        <div
          className="w-10 h-16 absolute -left-10 top-[5%]  rounded-l-xl border-white border flex items-center justify-center flex-col gap-2"
          onClick={() => setIsView(!isView)}
        >
          <TfiMenuAlt />
          <p>{commentsData? commentsData.length : "0"}</p>
        </div>
      </article>
    </section>
  );
}
