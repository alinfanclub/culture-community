import { deletePost } from "@/app/api/fireStore";
import { timeStampFormat } from "@/app/util/timeStampFormat";
import { formatAgo } from "@/app/util/timeago";
import { DocumentData } from "firebase/firestore";
import { Ref } from "react";
import { GoDotFill } from "react-icons/go";

export default function PostBlock({
  data,
  displayState,
  hadleDeletPost,
  handleCriticState,
  isOpenModal,
  setIsOpenModal,
  modalStyle,
  ModalElement,
  setSelectedPostId,
  selectedPostId,
  setModalStyle,
}: {
  data: DocumentData;
  displayState?: boolean;
  hadleDeletPost: (postId: string) => void;
  handleCriticState: () => void;
  isOpenModal: boolean;
  setIsOpenModal: (isOpenModal: boolean) => void;
  modalStyle: object;
  ModalElement: Ref<HTMLDivElement>;
  setSelectedPostId: (postId: string) => void;
  selectedPostId: string;
  setModalStyle: (obj: object) => void;
}) {
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    function context() {
      setSelectedPostId(data.postId);
      setIsOpenModal(!isOpenModal);
    }
    context();
    setModalStyle({
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
      position: "fixed",
      zIndex: 1000,
    });
  };

  return (
    <div
      onClick={() => setSelectedPostId(data.postId)}
      onContextMenu={handleContextMenu}
      className={`w-full text-white h-fit p-4 border transition-all rounded-2xl ${
        selectedPostId === data.postId
          ? "bg-zinc-900 border-white"
          : "border-transparent"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <h1>{data.title}</h1>
          <div className="flex gap-2 items-center">
            <small>{data.author}</small>
            <span>-</span>
            <small>{formatAgo(data.createdAt)}</small>
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
      {/* <div className="flex items-center justify-between">
        <button onClick={handleCriticState}>
          {data.isOpenCritic ? "비공개하기" : "공개하기"}
        </button>
        <button onClick={() => hadleDeletPost(data.postId)}>삭제</button>
      </div> */}
      {isOpenModal && selectedPostId === data.postId && (
        <>
          <div
            className="w-screen h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.3)] z-20"
            onClick={() => setIsOpenModal(!isOpenModal)}
          ></div>
          <div
            ref={ModalElement}
            style={modalStyle}
            id="modal"
            className="w-32 h-fit bg-white text-zinc-900 rounded-lg flex items-center flex-col overflow-hidden"
          >
            <button
              onClick={handleCriticState}
              className="w-full h-10 hover:bg-zinc-300 hover:text-red-600  transition-all flex justify-center items-center"
            >
              {data.isOpenCritic === true ? "비공개하기" : "공개하기"}
            </button>

            <button
              onClick={() => hadleDeletPost(data.postId)}
              className="w-full h-10 hover:bg-zinc-300 hover:text-red-600  transition-all flex justify-center items-center"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}
