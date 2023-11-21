import HydratedPosts from "./hydratedPosts";


export default async function PostDetailPage({params: {postDetail}}: {params: {postDetail: string}}) {


  return (
   <HydratedPosts postId={postDetail.toString()} />
  );
}
