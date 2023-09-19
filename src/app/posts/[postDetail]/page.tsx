"use client";

import { getPostDetailData } from "@/app/api/fireStore";
import ClipSpinner from "@/components/common/ClipSpinner";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "react-query";
import { TfiMenuAlt } from "react-icons/tfi";
import QuillEditor from "@/components/QuillEditor";
import Avvvatars from "avvvatars-react";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import Image from "next/image";
import SubmitBtn from "@/components/common/SubmitBtn";

export default function PostDetailPage() {
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

  const handleHtmlChange = (html: string) => {
    setHtml(html);
    console.log(html);
  };

  if (isLoading) return <ClipSpinner color="#fff" />;
  if (isError) return <div>error...</div>;

  return (
    <section className="relative overflow-hidden h-full">
      <article className="h-full flex flex-col">
        <div className="flex items-baseline gap-8 pb-10 px-4">
          <p className="h-16  line  leading-[4rem] text-2xl">
            {postDetail?.title}
          </p>
          <p className="h-8 line  leading-[2rem]">{postDetail?.author}</p>
        </div>
        <div className="grow overflow-y-scroll px-4 pb-4">
          <div
            className=" overflow-wrap break-words"
            dangerouslySetInnerHTML={{ __html: postDetail?.content }}
          />
        </div>
      </article>
      <article
        className={`absolute top-0 right-0 w-full  h-full transition-all ${
          isView ? "max-w-[50%]" : "max-w-[0%]"
        }`}
      >
        <section className="w-full overflow-hidden transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col p-4 border-l-[1px] border-white">
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
                <form action="" className="w-full">
                  <div className="w-full flex flex-col itmes-end gap-4">
                    <div className="h-full min-h-[10rem]  max-h-60 overflow-y-auto border border-white rounded-2xl px-4 pb-4">
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
              <div className="py-4 overflow-y-auto">댓글 영역</div>
            </>
          )}
        </section>
        <div
          className="w-10 h-16 absolute -left-10 top-[5%]  rounded-l-xl border-white border flex items-center justify-center flex-col gap-2"
          onClick={() => setIsView(!isView)}
        >
          <TfiMenuAlt />
          <p>0</p>
        </div>
      </article>
    </section>
  );
}
