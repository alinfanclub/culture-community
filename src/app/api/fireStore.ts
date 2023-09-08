import { User, getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { v1 as uuidv1 } from "uuid";
import { db } from "./firebase";
import axios from "axios";
import { log } from "console";

export async function setUserData(user: User) {
  await setDoc(doc(db, "account", user.uid), {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    uid: user.uid,
  });
}

export async function getUserDate(user: User) {
  const q = query(
    collection(db, "account"),
    where("username", "==", user.email)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " =>", doc.data());
  });
}

export async function getSpaceData() {
  const user = getAuth().currentUser;
  const q = query(collection(db, "spaces"), where("Useruid", "==", user?.uid));

  const querySnapshot = await getDocs(q);
  let data: any[] = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
}

export async function makeSpace(spaceName: string) {
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

const getImage = async () => {
  let state = "";
  await axios
    .get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "tYO9BazFMVJZY6ZN_A2t2EKFFQbGvD5-3HiskuUZN_w",
        category: "background",
        count: 1,
      },
    })
    .then((res) => {
      state = res.data[0].urls.regular;
      return state;
    });
  return state;
};
