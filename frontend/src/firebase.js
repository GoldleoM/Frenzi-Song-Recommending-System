import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD5lCNZAOrh_MUSyB77wcQ2D3Uqs75k5m0",
  authDomain: "frenzi-22694.firebaseapp.com",
  projectId: "frenzi-22694",
  storageBucket: "frenzi-22694.firebasestorage.app",
  messagingSenderId: "56965540916",
  appId: "1:56965540916:web:b4395a93e9a69cdf40ee61",
  measurementId: "G-JJEV0BV42X"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics };
