"use client"

import { getPostDetailData } from "@/app/api/fireStore";
import ClipSpinner from "@/components/common/ClipSpinner";
import { useParams } from "next/navigation";
import { useQuery } from "react-query";

export default function PostDetailPage() {
  const param = useParams().postDetail;
  const { data: postDetail, isLoading, isError } = useQuery({
    queryKey: ["spacePostList"],
    queryFn: () => getPostDetailData(param.toString())
  });

  if(isLoading) return <ClipSpinner color="#fff" />;
  if(isError) return <div>error...</div>;

  return (
    <section>
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
      <div>
        
      </div>
    </section>
  );
}

