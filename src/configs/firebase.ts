import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDK-3eE-UsVnTBlS-l6YMJ7K6VEz1fksPE',
  authDomain: 'trackplan-51731.firebaseapp.com',
  projectId: 'trackplan-51731',
  storageBucket: 'trackplan-51731.firebasestorage.app',
  messagingSenderId: '150496737231',
  appId: '1:150496737231:web:771ee84ed059e9d7e884ba',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

export { auth, provider }
