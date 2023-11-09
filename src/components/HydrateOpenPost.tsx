
import { dehydrate, HydrationBoundary as Hydrate} from '@tanstack/react-query'
import getQueryClient from '@/app/provider/GetQueryClient'
import { getOpenCriticPostList, getPostDetailData } from '@/app/api/fireStore'
import IsOpenCriticPosts from './IsOpenCriticPosts'
export default async function HydrateOpenPost() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['openCriticPosts'],
    queryFn: () => getOpenCriticPostList(),
  })
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <IsOpenCriticPosts />
    </Hydrate>
  )
}