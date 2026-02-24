import { auth, db, googleProvider } from "./Firebase"; // Shob kichu eikhane centralize kora bhalo
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  FacebookAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

//Google Login Function
export const handleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("Login Error:", err);
    return null;
  }
};

//Facebook Login Function
export const handleFacebookLogin = async () => {
  const provider = new FacebookAuthProvider();

  //Facebook permission set kora
  provider.addScope("public_profile");
  provider.addScope("email");

  try {
    //Pop-up window open korbe
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Facebook User Logged In:", user.displayName);
    return user;
  } catch (error) {
    console.error("Facebook Login Error:", error.message);
    throw error;
  }
};

//Logout Function
export const handleLogout = () => signOut(auth);

//Chat Save Function (Firestore-e save korbe)
export const saveChatToFirebase = async (userId, updatedHistory) => {
  if (!userId) return;
  await setDoc(doc(db, "userChats", userId), { history: updatedHistory });
};

//History Load Function (Firestore theke load korbe)
export const loadChatFromFirebase = async (userId) => {
  if (!userId) return null;
  const docRef = doc(db, "userChats", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().history : null;
};

//Login State Monitor
export const trackAuthState = (callback) => onAuthStateChanged(auth, callback);
