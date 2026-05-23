import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
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

// Verifica se as chaves existem no arquivo .env
if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('aqui') || !firebaseConfig.projectId) {
  console.error("ERRO: Configure o arquivo .env com chaves válidas do Firebase antes de rodar o script.");
  process.exit(1);
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lista de serviços oficiais para seed
const SEED_SERVICES = [
  {
    name: "Barba Simples",
    price: 45,
    description: "Alinhamento e corte da barba com máquina e navalha, finalizado com óleo aromático de alta qualidade.",
    duration: 30,
    active: true
  },
  {
    name: "Barboterapia",
    price: 50,
    description: "Ritual completo com toalha quente, massagem facial, espuma hidratante e óleos essenciais pós-barba.",
    duration: 40,
    active: true
  },
  {
    name: "Corte de Cabelo",
    price: 55,
    description: "Corte clássico ou moderno com máquina e tesoura, finalizado com lavagem e pomada premium.",
    duration: 40,
    active: true
  },
  {
    name: "Depilação de Nariz",
    price: 30,
    description: "Higienização e remoção de pelos excessivos do nariz com cera morna hipoalergênica especial.",
    duration: 15,
    active: true
  },
  {
    name: "Depilação de Orelha",
    price: 30,
    description: "Remoção segura e eficiente de pelos indesejados na orelha utilizando cera morna premium.",
    duration: 15,
    active: true
  },
  {
    name: "Hidratação",
    price: 30,
    description: "Tratamento profundo com máscara reconstrutora para devolver o brilho e a maciez aos cabelos secos.",
    duration: 20,
    active: true
  },
  {
    name: "Limpeza de Pele",
    price: 28,
    description: "Remoção de impurezas, cravos e oleosidade excessiva com máscara negra e esfoliação revigorante.",
    duration: 30,
    active: true
  },
  {
    name: "Luzes",
    price: 185,
    description: "Clareamento parcial dos fios com técnicas modernas para um efeito iluminado personalizado.",
    duration: 90,
    active: true
  },
  {
    name: "Pezinho (Acabamento)",
    price: 20,
    description: "Acabamento e contorno do cabelo (nuca, costeletas e testa) feito na navalha e finalizado com loção.",
    duration: 15,
    active: true
  },
  {
    name: "Pigmentação",
    price: 25,
    description: "Correção de falhas e realce do contorno da barba ou cabelo com pigmento de acabamento natural.",
    duration: 20,
    active: true
  },
  {
    name: "Selagem",
    price: 75,
    description: "Tratamento térmico para redução de volume, frizz e alinhamento dos fios com aspecto natural.",
    duration: 60,
    active: true
  },
  {
    name: "Sobrancelha",
    price: 15,
    description: "Design de sobrancelha masculino com navalha ou pinça, valorizando o olhar e a harmonia facial.",
    duration: 15,
    active: true
  },
  {
    name: "Upgrade do Platinado",
    price: 55,
    description: "Manutenção e matização do tom platinado para cabelos descoloridos, neutralizando amarelos indesejados.",
    duration: 45,
    active: true
  }
];

async function seedServices() {
  console.log("Iniciando carga de dados de serviços no Firebase Firestore...");
  
  try {
    const servicesCollectionRef = collection(db, 'services');
    
    // Busca todos os serviços existentes no banco de dados para evitar duplicações
    console.log("- Consultando serviços existentes no banco de dados...");
    const snapshot = await getDocs(servicesCollectionRef);
    const existingNames = new Set(
      snapshot.docs.map(doc => doc.data().name ? doc.data().name.toLowerCase().trim() : '')
    );
    
    console.log(`- Encontrados ${existingNames.size} serviços salvos atualmente.`);
    
    let addedCount = 0;
    
    for (const service of SEED_SERVICES) {
      const nameLower = service.name.toLowerCase().trim();
      
      if (existingNames.has(nameLower)) {
        console.log(`- O serviço "${service.name}" já está no banco de dados. Pulando...`);
      } else {
        console.log(`- Cadastrando serviço "${service.name}" (R$ ${service.price.toFixed(2)})...`);
        
        const newDocRef = doc(servicesCollectionRef); // Cria documento com ID automático
        
        const serviceData = {
          name: service.name,
          price: service.price,
          description: service.description,
          duration: service.duration,
          active: service.active,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(newDocRef, serviceData);
        addedCount++;
      }
    }
    
    console.log("---------------------------------------------------------");
    console.log(`CARGA REALIZADA COM SUCESSO!`);
    console.log(`Foram adicionados ${addedCount} novos serviços no Firestore.`);
    console.log("---------------------------------------------------------");
    process.exit(0);
    
  } catch (error) {
    console.error("Erro fatal ao popular serviços no Firebase:", error);
    process.exit(1);
  }
}

seedServices();
