"use client"

import { getOpenCriticPostList } from "@/app/api/fireStore";
import { useQuery } from "react-query";
import PostBlock from "./PostBlock";
import Link from "next/link";

export default function IsOpenCriticPosts() {
  const {
    data: openCriticPosts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["openCriticPosts"],
    queryFn: () => getOpenCriticPostList(),
  });

  console.log(openCriticPosts)

  return (
    <section>
      <article className="grid grid-cols-2 h-auto gap-4 xl:flex py-2 xl:grow xl:h-full">
        {openCriticPosts?.map((data, index) => (
          <div
            key={index}
            onClick={() => {
              // setSelectedPostId(data.postId), setIsView(true);
            }}
          >
            <Link href={{
              pathname: `/posts/${data.postId}`,
              query: { postId: data.postId },
            }}>
              <PostBlock data={data} key={index} />
            </Link>
          </div>
        ))}
      </article>
    </section>
  );
}

