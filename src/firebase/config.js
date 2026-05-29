import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * CONFIGURAÇÃO DO FIREBASE E ARQUITETURA DUAL (PRODUÇÃO VS MOCK)
 * 
 * Este arquivo é o ponto central de inicialização de infraestrutura do sistema. 
 * Ele implementa uma estratégia de resiliência e facilidade de desenvolvimento:
 * 1. Produção: Se chaves válidas no .env estiverem presentes, conecta ao Firebase real.
 * 2. Demonstração/Offline: Se chaves ausentes ou forem placeholders, chaveia `isMock = true`, 
 *    ativando o engine de persistência em LocalStorage no restante da aplicação.
 */

// Objeto de configuração extraído das variáveis de ambiente injetadas pelo Vite (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validação estrita das credenciais para evitar tentativas frustradas de conexão com placeholders
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

// Inicialização condicional baseada na integridade das chaves do ambiente
if (isConfigValid) {
  try {
    // Singleton pattern para inicialização do app Firebase
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Serviços principais do ecossistema Firebase
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    console.log("🔥 [Firebase] Inicializado com sucesso em modo de produção (Firestore/Storage/Auth ativos).");
  } catch (error) {
    console.warn("⚠️ [Firebase] Falha inesperada ao inicializar. Ativando fallback automático para modo de demonstração local.", error);
    isMock = true;
  }
} else {
  console.warn("ℹ️ [Firebase] Chaves de API ausentes ou inválidas no .env. Ativando engine local com LocalStorage (Modo Demonstração).");
  isMock = true;
}

export { auth, db, storage, isMock };
export default app;

