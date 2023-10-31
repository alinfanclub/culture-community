
import PostDetailComment from "@/components/PostDetailComment";

const checkEnvironment = () => {
  let base_url =
    process.env.NEXT_PUBLIC_ENV === "development"
      ? "http://localhost:3000"
      : "https://culture-community.vercel.app"; // https://v2ds.netlify.app

  return base_url;
};

async function getPostDetailData(postId: string) {
  const res = await fetch(checkEnvironment().concat(`/api/post/${postId}`), {cache: "no-cache"});
  const data = await res.json();
  return data;
}

export default async function PostDetailPage({params: {postDetail}}: {params: {postDetail: string}}) {
  const postDetailData = await getPostDetailData(postDetail);


  return (
    <section className="relative overflow-y-auto xl:overflow-hidden">
      <article className="flex flex-col px-4 xl:p-0">
        <div className="flex items-baseline gap-8 pb-10 px-4">
          <p className="h-16  line  leading-[4rem] text-2xl">
            {postDetailData.title}
          </p>
          <p className="h-8 line  leading-[2rem]">{postDetailData.author}</p>
        </div>
        <div className="xl:grow px-4 pb-4 h-fit">
          <div
            className="break-words textView"
            dangerouslySetInnerHTML={{ __html: postDetailData.content }}
          />
        </div>
      </article>
     <PostDetailComment postDetail={postDetailData} />
    </section>
  );
}
