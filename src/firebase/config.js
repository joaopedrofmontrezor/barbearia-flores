import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if credentials are set (not empty and not the placeholder)
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'sua_api_key_aqui' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'seu_project_id_aqui';

let app;
let auth;
let db;
let storage;
let isMock = false;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("Firebase inicializado com sucesso em modo de produção.");
  } catch (error) {
    console.warn("Falha ao inicializar o Firebase. Ativando fallback em modo de demonstração local.", error);
    isMock = true;
  }
} else {
  console.warn("Chaves do Firebase ausentes no arquivo .env. Ativando fallback em modo de demonstração local (LocalStorage).");
  isMock = true;
}

export { auth, db, storage, isMock };
export default app;
