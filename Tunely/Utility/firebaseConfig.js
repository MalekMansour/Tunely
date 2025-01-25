import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDS7Ce-Rvap_8keSJ5Y3fEruwCuujShGBU",
  authDomain: "tunely-111.firebaseapp.com",
  databaseURL: "https://tunely-111-default-rtdb.firebaseio.com",
  projectId: "tunely-111",
  storageBucket: "tunely-111.appspot.com",
  messagingSenderId: "209540280192",
  appId: "1:209540280192:web:f3e421fc788eabccdf1b65",
  measurementId: "G-H4SETH4W1R",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Sign up with email and password
export const signUpWithEmailAndPassword = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in with email and password
export const signInWithEmailAndPassword = (email, password) => {
  return firebaseSignInWithEmailAndPassword(auth, email, password);
};

// Fetch user data (username and profile picture)
export const getUserData = async (userId) => {
  try {
    const userRef = ref(database, 'users/' + userId);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};

// Update User Data
export const updateUserData = async (userId, data) => {
  try {
    const userRef = ref(database, 'users/' + userId);
    await set(userRef, data);
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error; // Pass the error back to the caller
  }
};

export const uploadProfilePicture = async (userId, uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const profilePicRef = storageRef(storage, `profilePictures/${userId}`);
    await uploadBytes(profilePicRef, blob);
    const downloadURL = await getDownloadURL(profilePicRef);
    return downloadURL; 
  } catch (error) {
    console.error("Error uploading profile picture:", error);
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export default app;
