"use client";

import { getSpaceDataDetail } from "@/app/api/fireStore";
import { spaceAreaType } from "@/app/types/mySpaceType";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "react-query";

export default function MypageSpaceDetail() {
  const param = useParams().slug[0];
  const {
    data: spaceArea,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["spaceAreaDetail"],
    queryFn: () => getSpaceDataDetail(param),
    initialData: { title: "", backgroundImage: "", createdAt: undefined },
  });

  if (isLoading) return <div>loading</div>;
  if (isError) return <div>error</div>;

  return (
    spaceArea && (
      <section className="text-white w-[90%] mx-auto">
        <article
          className={`w-full h-80  overflow-hidden relative flex justify-center items-center mx-auto bg-white`}
        >
          {spaceArea.backgroundImage && (
            <Image
              src={spaceArea?.backgroundImage}
              alt="spaceImage"
              width={1000}
              height={1000}
              priority={true}
              className="w-full h-full object-cover object-center z-[0] bg-white opacity-80"
            />
          )}
        </article>
        <article id="spaceBody">
          <div className="flex items-center justify-between py-4 border-b-2 border-white">
            <div className="flex gap-4 items-end">
              <h1 className="text-3xl">{spaceArea.title}</h1>
              {spaceArea.createdAt && (
                <div className="flex gap-4 items-end">
                  <p>{timeStampFormat(spaceArea.createdAt)}</p>
                  <small>
                    {formatAgo(timeStampFormat(spaceArea.createdAt))}
                  </small>
                </div>
              )}
            </div>
            <button type="button">글작성</button>
          </div>
        </article>
      </section>
    )
  );
}
