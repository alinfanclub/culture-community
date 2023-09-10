import { User, getAuth } from "firebase/auth";
import {
  DocumentData,
  collection,
  deleteDoc,
  doc,
  getDocs,
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
  getMetadata,
  getStorage,
  ref,
  uploadBytes,
  uploadString,
} from "firebase/storage";

export async function setUserData(user: User): Promise<void> {
  await setDoc(doc(db, "account", user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
  });
}

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
export async function getSpaceDataDetail(param: string): Promise<DocumentData> {
  const q = query(collection(db, "spaces"), where("spaceId", "==", param));
  const querySnapshot = await getDocs(q);
  let data: DocumentData = {};
  querySnapshot.forEach((doc) => {
    data = Object(doc.data());
  });
  return data;
}
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

export async function deleteSpace(spaceId: string) {
  await deleteDoc(doc(db, "spaces", spaceId));
}

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
