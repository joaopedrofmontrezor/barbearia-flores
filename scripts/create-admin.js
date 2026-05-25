import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase configs are set
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('aqui')) {
  console.error("ERRO: Configure o arquivo .env com chaves válidas do Firebase antes de rodar o script.");
  process.exit(1);
}

// Get UID from command-line arguments
const adminUid = process.argv[2];

if (!adminUid) {
  console.error("\n========================================================");
  console.error("ERRO: UID do Administrador ausente!");
  console.error("Como usar: node scripts/create-admin.js <UID_DO_FIREBASE_AUTH>");
  console.error("Exemplo: node scripts/create-admin.js aB1c2D3e4F5g6H7i8J9k0L");
  console.error("========================================================\n");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminDoc() {
  console.log(`\nIniciando cadastro do Administrador no Firestore com UID: ${adminUid}...`);
  
  try {
    const adminDocRef = doc(db, 'admins', adminUid);
    
    // Create the document with basic administrative metadata
    await setDoc(adminDocRef, {
      role: 'admin',
      email: 'admin@barbeariaflores.com', // E-mail padrão ou identificador
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log("========================================================");
    console.log("SUCESSO: Administrador registrado com sucesso no Firestore!");
    console.log("As Regras de Segurança (Firestore Rules) agora permitirão");
    console.log("todas as ações administrativas para este usuário.");
    console.log("========================================================\n");
    process.exit(0);

  } catch (error) {
    console.error("Erro ao criar documento de administrador:", error);
    process.exit(1);
  }
}

createAdminDoc();
