"use client"

import { getPostDetailData } from "@/app/api/fireStore";
import ClipSpinner from "@/components/common/ClipSpinner";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "react-query";
import { TfiMenuAlt } from "react-icons/tfi";

export default function PostDetailPage() {
  const param = useParams().postDetail;
  const [isView, setIsView] = useState(true);
  const { data: postDetail, isLoading, isError } = useQuery({
    queryKey: ["spacePostList"],
    queryFn: () => getPostDetailData(param.toString())
  });

  if(isLoading) return <ClipSpinner color="#fff" />;
  if(isError) return <div>error...</div>;

  return (
    <section className='relative overflow-hidden'>
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
            className=" overflow-wrap break-words"
            dangerouslySetInnerHTML={{ __html: postDetail?.content }}
          />
        </div>
      </div>
      <div className={`absolute top-0 right-0 w-full  h-full transition-all ${
                isView ? "max-w-[30%]" : "max-w-[0%]"
              }`}>
        <div className="w-full overflow-hidden transition-all bg-zinc-900 h-full  text-white z-[30] flex flex-col p-4"
          >
          댓글 접혔다 폈다
        </div>
        <div className='w-10 h-16 absolute -left-10 top-[5%]  rounded-l-xl border-white border flex items-center justify-center flex-col gap-2' onClick={()=>setIsView(!isView)}>
          <TfiMenuAlt />
          <p>0</p>
        </div>
      </div>

      

    </section>
  );
}

