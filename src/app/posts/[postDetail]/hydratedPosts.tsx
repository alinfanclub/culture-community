
import { dehydrate, HydrationBoundary as Hydrate} from '@tanstack/react-query'
import getQueryClient from '@/app/provider/GetQueryClient'
import PostDetailCompoent from './PostDetailCompoent'
import { getPostDetailData } from '@/app/api/fireStore'
export default async function HydratedPosts({postId}: {postId: string}) {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['postDetail'],
    queryFn: () => getPostDetailData(postId),
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <PostDetailCompoent postId={postId.toString()} />
    </Hydrate>
  )
}