import { deletePost } from "@/app/api/fireStore";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { DocumentData } from "firebase/firestore";
import Image from "next/image";
import { GoDotFill } from "react-icons/go";

export default function PostBlock({
  data,
  displayState,
}: {
  data: DocumentData;
  displayState?: boolean;
}) {
  return (
    <div className="w-auto xl:w-60 rounded-2xl text-white h-fit">
      {/* <Link href={`/mypage/mypost/${data.postId}`}>
        <div className="rounded-lg max-w-full image-thumbnail-crop-frame overflow-hidden flex items-center justify-center aspect-[4/2]">
          <Image
            src={data.backgroundImage}
            alt="spaceImage"
            width={500}
            height={500}
            className="rounded-br-[30%] h-full w-full object-cover"
          />
        </div>
      </Link> */}
      <div className="rounded-lg max-w-full image-thumbnail-crop-frame overflow-hidden flex items-center justify-center aspect-[4/2]">
        <Image
          src={data.backgroundImage}
          alt="spaceImage"
          width={500}
          height={500}
          className="rounded-br-[30%] h-full w-full object-cover"
        />
        {/* <div>{data.content}</div> */}
      </div>
      <div className="flex justify-between">
        <div>
          <h1>{data.title}</h1>
          <div className="flex gap-2 items-center">
            <small>{data.author}</small>
            <span>-</span>
            <small>{formatAgo(timeStampFormat(data.createdAt))}</small>
          </div>
        </div>
        {displayState && (
          <div>
            {data.isOpenCritic ? (
              <GoDotFill className=" text-green-400" />
            ) : (
              <GoDotFill className="text-red-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
