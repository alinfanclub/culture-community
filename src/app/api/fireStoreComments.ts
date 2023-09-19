import { v1 as uuidv1 } from "uuid";
import { db } from "./firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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
        coomment: comment,
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
