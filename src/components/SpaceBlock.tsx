"use client";

import {
  deleteOldImage,
  deleteSpace,
  userSpaceBgUpdate,
} from "@/app/api/fireStore";
import { useAuthContext } from "@/app/context/FirebaseAuthContext";
import { spaceAreaType } from "@/app/types/mySpaceType";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { DocumentData } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
type index = {
  order: number;
};
export default function SpaceBlock({ data, order }: DocumentData & index) {
  const queryClient = useQueryClient();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const ModalElement = useRef<HTMLDivElement>(null);
  const [modalStyle, setModalStyle] = useState({});
  const handleSpaceDelete = async () => {
    if (
      confirm("스페이스를 삭제하시겠습니까? 하위 게시글도 모두 삭제됩니다.")
    ) {
      await deleteSpace(data.spaceId);
      setIsOpenModal(!isOpenModal);
    }
  };
  const { user } = useAuthContext();

  const uploadBgImage = useMutation(
    {
      mutationFn: ({ file, param }: { file: any; param: string }) =>
      userSpaceBgUpdate(file, param),
      onSuccess: () => queryClient.invalidateQueries({
        queryKey: ["spaceArea"],
      })
    }
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLHtmlElement>) => {
    setIsOpenModal(!isOpenModal);
    event.preventDefault();
    setModalStyle({
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
      position: "fixed",
      zIndex: 1000,
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<EventTarget & HTMLInputElement>
  ) => {
    e.preventDefault();
    const selectedFile = e.target.files;
    //
    // data && deleteOldImage(data.backgroundImage);
    uploadBgImage.mutate(
      { file: selectedFile, param: data.spaceId },
      {
        onSuccess() {
          alert("사진이 변경되었습니다.");
          setIsOpenModal(!isOpenModal);
        },
        onError() {
          alert("사진 변경에 실패하였습니다.");
        },
      }
    );
  };
  return (
    <>
      <article
        className="w-content text-white"
        onContextMenu={handleContextMenu}
      >
        <Link href={`/mypage/myspace/${data.spaceId}`}>
          <div
            className={`w-40 bg-white aspect-[1/1.5] text-black relative p-6`}
          >
            <Image
              src={data.backgroundImage}
              alt="postImage"
              width={500}
              height={500}
              className="aspect-[1/1.5] object-cover object-center absolute top-0 left-0 z-[0]"
            />
            <div className="z-10 w-[80%] h-[80%] bg-white absolute top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2 p-4">
              <small className="text-right w-full block">
                {user?.displayName} 시인선{" "}
                {order < 10 ? "0" + (order + 1) : order + 1}
              </small>
              <h3 className="mt-4">{data.title}</h3>
            </div>
          </div>
        </Link>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <small>{data.userInfos.displayName}</small>
            <span>-</span>
            <small>{formatAgo(data.createdAt)}</small>
          </div>
        </div>
      </article>
      {isOpenModal && (
        <>
          <div
            className="w-screen h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.3)] z-20"
            onClick={() => setIsOpenModal(!isOpenModal)}
          ></div>
          <div
            ref={ModalElement}
            style={modalStyle}
            id="modal"
            className="w-fit h-fit bg-white text-zinc-900 rounded-lg text-center flex items-center overflow-hidden"
          >
            <ul className="flex flex-col">
              <li className="hover:bg-zinc-300 p-4 hover:text-red-600  transition-all">
                <input
                  type="file"
                  title="file"
                  id="file"
                  className="absolute bottom-4 right-4 z-[10] hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="file" className="">
                  사진변경
                </label>
              </li>
              <li className="hover:bg-zinc-300 p-4 hover:text-red-600  transition-all">
                <button type="button" onClick={handleSpaceDelete}>
                  삭제
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}
