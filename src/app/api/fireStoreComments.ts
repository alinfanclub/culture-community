import { v1 as uuidv1 } from "uuid";
import { db } from "./firebase";
import { DocumentData, collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function createComment(
  postId: string,
  comment: string
): Promise<string> {
  const commentId = uuidv1();
  const user = getAuth().currentUser;
  try {
    user &&
      (await setDoc(doc(db, "comments", commentId), {
        createdAt: serverTimestamp(),
        comment: comment,
        writer: user.uid,
        userInfos: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        commentId: commentId,
        hostPostId: postId,
      }));
  } catch (error) {
    console.log(error);
  }

  return commentId;
}

// 댓글 가져오기
export async function getCommentData(postId: string): Promise<DocumentData[]> {
  const q = query(collection(db, "comments"), where("hostPostId", "==", postId));
  const querySnapshot = await getDocs(q);
  let data: DocumentData[] = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data.sort((a, b) => { return b.createdAt - a.createdAt });
}

