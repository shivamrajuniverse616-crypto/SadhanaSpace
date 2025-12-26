import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBnt74KShwtSfvllJl0vQsFDyuOtbmyKRQ",
    authDomain: "sadhanaspacehq.firebaseapp.com",
    projectId: "sadhanaspacehq",
    storageBucket: "sadhanaspacehq.firebasestorage.app",
    messagingSenderId: "232890080570",
    appId: "1:232890080570:web:dab2cc40d2a1e4c9f8c403",
    measurementId: "G-VVXCF3DJEP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.log('Persistence failed: Browser not supported');
    }
});

export { auth, db, analytics };
