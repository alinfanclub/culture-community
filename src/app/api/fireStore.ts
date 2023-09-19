import { User, getAuth } from "firebase/auth";
import {
  DocumentData,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  or,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { v1 as uuidv1 } from "uuid";
import { db } from "./firebase";
import axios from "axios";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";

export async function setUserData(user: User): Promise<void> {
  await setDoc(doc(db, "account", user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
  });
}

// ~ 유저 정보 가져오기
export async function getUserDate(user: User): Promise<DocumentData> {
  const q = query(
    collection(db, "account"),
    where("username", "==", user.email)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " =>", doc.data());
  });
  return querySnapshot.docs[0].data();
}

// ~ 스페이스 데이터 리스트 가져오기
export async function getSpaceData(): Promise<DocumentData[]> {
  const user = getAuth().currentUser;
  const q = query(collection(db, "spaces"), where("Useruid", "==", user?.uid));

  const querySnapshot = await getDocs(q);
  let data: DocumentData[] = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

// ~ 스페이스 데이터 디테일 가져오기
export async function getSpaceDataDetail(param: string): Promise<DocumentData> {
  const q = query(collection(db, "spaces"), where("spaceId", "==", param));
  const querySnapshot = await getDocs(q);
  let data: DocumentData = {};
  querySnapshot.forEach((doc) => {
    data = Object(doc.data());
  });
  return data;
}

//  ~ 스페이스 생성
export async function makeSpace(spaceName: string): Promise<string> {
  const spaceId = uuidv1();
  const user = getAuth().currentUser;
  try {
    user &&
      (await setDoc(doc(db, "spaces", spaceId), {
        createdAt: serverTimestamp(),
        title: spaceName,
        userInfos: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        spaceId: spaceId,
        Useruid: user.uid,
        fix: false,
        backgroundImage: (await getImage()).toString(),
      }));
  } catch (error) {
    console.log(error);
  }

  return spaceId;
}

// ~ 스페이스 생성시 언스프래쉬에서 랜덤 이미지 가져오기
const getImage = async (): Promise<string> => {
  let state = "";
  await axios
    .get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: process.env.NEXT_PUBLIC_UNSPLASH_CLIENTID,
        query: "wave",
        count: 1,
        fit: "clamp",
      },
    })
    .then((res) => {
      state = res.data[0].urls.regular;
      return state;
    });
  return state;
};

const getImageByQuery = async (query: string): Promise<string> => {
  let state = "";
  await axios
    .get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: process.env.NEXT_PUBLIC_UNSPLASH_CLIENTID,
        query: query || "wave",
        count: 1,
        fit: "clamp",
      },
    })
    .then((res) => {
      state = res.data[0].urls.regular;
      return state;
    });
  return state;
};

// ~ 스페이스 삭제
export async function deleteSpace(spaceId: string) {
  const q = query(collection(db, "posts"), where("hostSpaceId", "==", spaceId));
  await getDocs(q).then((querySnapshot) => {
    querySnapshot.forEach((data) => {
      try {
        deleteDoc(doc(db, "posts", data.data().postId));
      } catch (error) {
        console.log(error);
      }
    });
  });
  await deleteDoc(doc(db, "spaces", spaceId));
}

// ~ 스페이스 수정
export async function userSpaceBgUpdate(file: any, spaceId: any) {
  const storage = getStorage();
  const fileRef = ref(storage, uuidv1());
  try {
    await uploadBytes(fileRef, file[0]).then((snapshot) => {
      const reportRef = doc(db, "spaces", spaceId);
      getDownloadURL(snapshot.ref).then((metadata) => {
        updateDoc(reportRef, {
          backgroundImage: metadata,
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
}

// ~ 스페이스에서 이미지 수정시 기존의 이미지 삭제 하기
export async function deleteOldImage(oldImageUrl: string) {
  const storage = getStorage();
  const imageRef = ref(storage, oldImageUrl);

  try {
    await deleteObject(imageRef);
    console.log("기존 이미지 삭제 성공");
  } catch (error) {
    console.error("기존 이미지 삭제 오류:", error);
  }
}

//  ~ 글 작성하기
export async function createPost(
  title: string,
  name: string,
  content: string,
  spaceId: string,
  imgQuery?: string
): Promise<string> {
  const postId = uuidv1();
  const user = getAuth().currentUser;
  try {
    user &&
      (await setDoc(doc(db, "posts", postId), {
        createdAt: serverTimestamp(),
        title: title,
        author: name,
        content: content,
        userInfos: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        postId: postId,
        hostSpaceId: spaceId,
        Useruid: user.uid,
        fix: false,
        backgroundImage: (
          await getImageByQuery(imgQuery ? imgQuery : "wave")
        ).toString(),
        isOpenCritic: false,
        istemporary: false,
      }));
  } catch (error) {
    console.log(error);
  }

  return postId;
}

export async function createTemporaryPost(
  title: string,
  name: string,
  content: string,
  spaceId: string,
  imgQuery?: string
): Promise<string> {
  const postId = uuidv1();
  const user = getAuth().currentUser;
  try {
    user &&
      (await setDoc(doc(db, "posts", postId), {
        createdAt: serverTimestamp(),
        title: title,
        author: name,
        content: content,
        userInfos: {
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
        postId: postId,
        hostSpaceId: spaceId,
        Useruid: user.uid,
        fix: false,
        backgroundImage: (
          await getImageByQuery(imgQuery ? imgQuery : "wave")
        ).toString(),
        isOpenCritic: false,
        istemporary: true,
      }));
  } catch (error) {
    console.log(error);
  }

  return postId;
}

// ~ 글 리스트 가져오기
export async function getSpacePostList(
  postId: string
): Promise<DocumentData[]> {
  const q = query(
    collection(db, "posts"),
    where("hostSpaceId", "==", postId),
    orderBy("createdAt")
  );
  const querySnapshot = await getDocs(q);
  let postlist: DocumentData[] = [];
  querySnapshot.forEach((doc) => {
    postlist.push(doc.data());
  });
  return postlist;
}

// ~ 글 디테일 가져오기
export async function getPostDetailData(postId: string): Promise<DocumentData> {
  const q = query(collection(db, "posts"), where("postId", "==", postId));
  const querySnapshot = await getDocs(q);
  let data: DocumentData = {};
  querySnapshot.forEach((doc) => {
    data = Object(doc.data());
  });
  return data;
}

// ~ 글 삭제
export async function deletePost(postId: string) {
  await deleteDoc(doc(db, "posts", postId));
}

// ~ 글 수정하기
export async function updatePost(
  postId: string,
  postInfo: { title: string; name: string },
  html: string
) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    title: postInfo.title,
    author: postInfo.name,
    content: html,
  });
}

// ~ 글 비평 열기 닫기
export async function updateCriticState(postId: string, state: boolean) {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    isOpenCritic: !state,
  });
}

// ~ isOpenCritic가 true인 글 리스트 가져오기
export async function getOpenCriticPostList(): Promise<DocumentData[]> {
  const q = query(collection(db, "posts"), where("isOpenCritic", "==", true));
  const querySnapshot = await getDocs(q);
  let postlist: DocumentData[] = [];
  querySnapshot.forEach((doc) => {
    postlist.push(doc.data());
  });
  return postlist;
}

//
