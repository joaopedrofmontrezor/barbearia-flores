import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch, collection } from 'firebase/firestore';
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

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('aqui')) {
  console.error("ERRO: Configure o arquivo .env com chaves válidas do Firebase antes de rodar o script.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data structure to seed
const SERVICES = [
  { name: 'Corte Masculino', price: 60, duration: 45, description: 'Corte clássico ou moderno executado com tesoura e máquina, lavado e finalizado com pomada premium.' },
  { name: 'Barba Premium', price: 50, duration: 40, description: 'Barboterapia clássica com toalha quente, massagem facial, óleo hidratante e navalha afiada.' },
  { name: 'Sobrancelha na Navalha', price: 25, duration: 15, description: 'Alinhamento e design de sobrancelha masculino feito com precisão cirúrgica na navalha.' },
  { name: 'Pigmentação de Barba', price: 40, duration: 30, description: 'Correção de falhas e realce da barba utilizando pigmento de alta durabilidade e acabamento natural.' },
  { name: 'Combo Imperial', price: 100, duration: 80, description: 'Corte de cabelo + Barba Premium + Lavagem especial e uma cerveja artesanal trincando de brinde.' }
];

const EMPLOYEES = [
  { name: 'Carlos "Navalha" Santos', role: 'Mestre Barbeiro', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', rating: 4.9, bio: 'Mais de 10 anos de experiência em cortes clássicos e barboterapia tradicional.' },
  { name: 'Diogo Silva', role: 'Barbeiro Designer', photo: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=400', rating: 4.8, bio: 'Especialista em freestyle, cortes modernos, pigmentações e degradê perfeito.' },
  { name: 'Marcus Vinícius', role: 'Visagista & Stylist', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', rating: 5.0, bio: 'Visagismo masculino avançado, cuidando do cabelo e pele de acordo com sua imagem.' }
];

const TESTIMONIALS = [
  { name: 'Thiago Ramos', text: 'Melhor barbearia que já frequentei na vida! A barboterapia com toalha quente e massagem é de outro mundo.', rating: 5, date: '2026-05-18' },
  { name: 'Lucas Almeida', text: 'Ambiente sensacional com decoração impecável. O Diogo cortou meu cabelo perfeitamente enquanto tomava uma IPA gelada.', rating: 5, date: '2026-05-20' },
  { name: 'Gabriel Costa', text: 'Excelente experiência. Agendei pelo site de forma super rápida e fui atendido exatamente no horário. Nota 10!', rating: 5, date: '2026-05-21' }
];

const GALLERY = [
  { title: 'Corte Degradê Moderno', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', category: 'Corte' },
  { title: 'Barboterapia com Toalha Quente', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', category: 'Barba' },
  { title: 'Corte Clássico na Tesoura', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600', category: 'Corte' },
  { title: 'Ambiente Premium e Acolhedor', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', category: 'Ambiente' },
  { title: 'Produtos de Alta Qualidade', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600', category: 'Produtos' },
  { title: 'Pigmentação e Acabamento', image: 'https://images.unsplash.com/photo-1605497746444-ac9da58d7fc0?auto=format&fit=crop&q=80&w=600', category: 'Barba' }
];

const SETTINGS = {
  phone: '5516994206778',
<<<<<<< HEAD
  email: 'contato@barbeariaflores.com',
  address: 'Avenida Baldan, 1910 - Residencial Benassi, Matão - SP, 15993-000',
  openingHours: 'Seg a Sex: 09h às 21h | Sáb: 09h às 19h',
  whatsappMessageTemplate: 'Olá! Gostaria de confirmar meu agendamento na Barbearia Flores para o dia {data} às {hora} com o profissional {barbeiro} (Serviço: {servico}) na unidade {unidade}.',
=======
  email: 'contato@barbeariapremium.com',
  address: 'Avenida Baldan, 1910 - Residencial Benassi, Matão - SP, 15993-000',
  openingHours: 'Seg a Sex: 09h às 21h | Sáb: 09h às 19h',
  whatsappMessageTemplate: 'Olá! Gostaria de confirmar meu agendamento na Barbearia Premium para o dia {data} às {hora} com o profissional {barbeiro} (Serviço: {servico}) na unidade {unidade}.',
>>>>>>> f77f807e37044f4ab56670bebdd643d55c698556
  branches: [
    {
      id: 'br1',
      name: 'Barbearia Flores - Benassi',
      address: 'Avenida Baldan, 1910 - Residencial Benassi, Matão - SP, 15993-000',
      phone: '5516994206778',
      openingHours: 'Seg a Sex: 09h às 21h | Sáb: 09h às 19h',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3709.2562821339175!2d-48.3684292!3d-21.614934899999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94b8e1338995e341%3A0x34a57527489a8ef3!2sBarbearia%20Flores%20-%20Benassi!5e0!3m2!1spt-BR!2sbr!4v1779460599228!5m2!1spt-BR!2sbr'
    },
    {
      id: 'br2',
      name: 'Barbearia Flores - Bairro Alto',
      address: 'Rua Coronel Leão Pio de Freitas, 428 - Bairro Alto, Matão - SP, 15997-010',
      phone: '5516994206778',
      openingHours: 'Seg a Sex: 09h às 21h | Sáb: 09h às 19h',
      googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3709.7696197991536!2d-48.3630699!3d-21.594914000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94b91fda559bfa9b%3A0xff505f21875fbecb!2sBarbearia%20Flores%20-%20Bairro%20Alto!5e0!3m2!1spt-BR!2sbr!4v1779460780023!5m2!1spt-BR!2sbr'
    }
  ]
};

async function seed() {
  console.log("Iniciando carga de dados no Firebase Firestore...");
  
  try {
    const batch = writeBatch(db);

    // 1. Services
    console.log("- Carregando Serviços...");
    SERVICES.forEach(item => {
      const docRef = doc(collection(db, 'services'));
      batch.set(docRef, item);
    });

    // 2. Employees
    console.log("- Carregando Equipe...");
    EMPLOYEES.forEach(item => {
      const docRef = doc(collection(db, 'employees'));
      batch.set(docRef, item);
    });

    // 3. Testimonials
    console.log("- Carregando Depoimentos...");
    TESTIMONIALS.forEach(item => {
      const docRef = doc(collection(db, 'testimonials'));
      batch.set(docRef, item);
    });

    // 4. Gallery
    console.log("- Carregando Galeria...");
    GALLERY.forEach(item => {
      const docRef = doc(collection(db, 'gallery'));
      batch.set(docRef, item);
    });

    // 5. Settings
    console.log("- Carregando Configurações...");
    const settingsRef = doc(collection(db, 'settings'));
    batch.set(settingsRef, SETTINGS);

    // Execute batch
    await batch.commit();
    
    console.log("-----------------------------------------");
    console.log("CARGA EXECUTADA COM SUCESSO!");
    console.log("Seu banco de dados do Firebase foi inicializado.");
    console.log("-----------------------------------------");
    process.exit(0);

  } catch (error) {
    console.error("Erro ao popular banco de dados:", error);
    process.exit(1);
  }
}

seed();
