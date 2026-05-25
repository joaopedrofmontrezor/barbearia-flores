import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
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
  { id: 's_1', name: "Barba Simples", price: 45, duration: 30, description: "Alinhamento e corte da barba com máquina e navalha, finalizado com óleo aromático de alta qualidade.", active: true },
  { id: 's_2', name: "Barboterapia", price: 50, duration: 40, description: "Ritual completo com toalha quente, massagem facial, espuma hidratante e óleos essenciais pós-barba.", active: true },
  { id: 's_3', name: "Corte de Cabelo", price: 55, duration: 40, description: "Corte clássico ou moderno com máquina e tesoura, finalizado com lavagem e pomada premium.", active: true },
  { id: 's_4', name: "Depilação de Nariz", price: 30, duration: 15, description: "Higienização e remoção de pelos excessivos do nariz com cera morna hipoalergênica especial.", active: true },
  { id: 's_5', name: "Depilação de Orelha", price: 30, duration: 15, description: "Remoção segura e eficiente de pelos indesejados na orelha utilizando cera morna premium.", active: true },
  { id: 's_6', name: "Hidratação", price: 30, duration: 20, description: "Tratamento profundo com máscara reconstrutora para devolver o brilho e a maciez aos cabelos secos.", active: true },
  { id: 's_7', name: "Limpeza de Pele", price: 28, duration: 30, description: "Remoção de impurezas, cravos e oleosidade excessiva com máscara negra e esfoliação revigorante.", active: true },
  { id: 's_8', name: "Luzes", price: 185, duration: 90, description: "Clareamento parcial dos fios com técnicas modernas para um efeito iluminado personalizado.", active: true },
  { id: 's_9', name: "Pezinho (Acabamento)", price: 20, duration: 15, description: "Acabamento e contorno do cabelo (nuca, costeletas e testa) feito na navalha e finalizado com loção.", active: true },
  { id: 's_10', name: "Pigmentação", price: 25, duration: 20, description: "Correção de falhas e realce do contorno da barba ou cabelo com pigmento de acabamento natural.", active: true },
  { id: 's_11', name: "Selagem", price: 75, duration: 60, description: "Tratamento térmico para redução de volume, frizz e alinhamento dos fios com aspecto natural.", active: true },
  { id: 's_12', name: "Sobrancelha", price: 15, duration: 15, description: "Design de sobrancelha masculino com navalha ou pinça, valorizando o olhar e a harmonia facial.", active: true },
  { id: 's_13', name: "Upgrade do Platinado", price: 55, duration: 45, description: "Manutenção e matização do tom platinado para cabelos descoloridos, neutralizando amarelos indesejados.", active: true }
];

const EMPLOYEES = [
  {
    id: 'e_1',
    name: 'Gabriel Flores',
    role: 'Mestre Barbeiro & Proprietário',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    branchId: 'br1',
    branchName: 'Barbearia Flores - Benassi',
    specialties: ['Degradê Avançado', 'Barboterapia', 'Visagismo'],
    allowedServices: ['s_1', 's_2', 's_3', 's_6', 's_7', 's_9', 's_10', 's_12'],
    workDays: [1, 2, 3, 4, 5, 6],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    active: true,
    phone: '5516994206778',
    instagram: '@gabrielflores.barber',
    bio: 'Especialista em visagismo masculino moderno e fundador da Barbearia Flores.',
    avgServiceTime: 30,
    rating: 4.9,
    ratingCount: 142,
    bookingsCount: 650,
    permissions: ['admin']
  },
  {
    id: 'e_2',
    name: 'João Vitor Moraes',
    role: 'Barbeiro Designer',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    branchId: 'br1',
    branchName: 'Barbearia Flores - Benassi',
    specialties: ['Cortes Clássicos', 'Selagem', 'Pezinho'],
    allowedServices: ['s_3', 's_4', 's_5', 's_6', 's_9', 's_11', 's_12', 's_13'],
    workDays: [1, 2, 3, 4, 5, 6],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    active: true,
    phone: '5516994206778',
    instagram: '@joaovitor.barber',
    bio: 'Especialista em cortes clássicos na tesoura, finalizações e selagens masculinas.',
    avgServiceTime: 40,
    rating: 4.8,
    ratingCount: 96,
    bookingsCount: 320,
    permissions: ['standard']
  },
  {
    id: 'e_3',
    name: 'Gustavo Melo',
    role: 'Mestre Barbeiro',
    photo: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=400',
    branchId: 'br2',
    branchName: 'Barbearia Flores - Bairro Alto',
    specialties: ['Barboterapia', 'Luzes', 'Pigmentação'],
    allowedServices: ['s_1', 's_2', 's_8', 's_9', 's_10'],
    workDays: [1, 2, 3, 4, 5, 6],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    active: true,
    phone: '5516994206778',
    instagram: '@gustavomelo.barber',
    bio: 'Especialista em cuidados faciais, rituais de barba tradicional e técnicas modernas de luzes e pigmentação.',
    avgServiceTime: 30,
    rating: 4.9,
    ratingCount: 118,
    bookingsCount: 410,
    permissions: ['standard']
  },
  {
    id: 'e_4',
    name: 'Diego Bernardo',
    role: 'Barbeiro Artístico',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    branchId: 'br2',
    branchName: 'Barbearia Flores - Bairro Alto',
    specialties: ['Freestyle', 'Degradê Perfeito', 'Pigmentação'],
    allowedServices: ['s_3', 's_8', 's_9', 's_10', 's_11', 's_13'],
    workDays: [1, 2, 3, 4, 5, 6],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    active: true,
    phone: '5516994206778',
    instagram: '@diegobernardo.barber',
    bio: 'Especialista em desenhos artísticos (freestyle), degradês perfeitos e químicas no geral.',
    avgServiceTime: 35,
    rating: 5.0,
    ratingCount: 88,
    bookingsCount: 290,
    permissions: ['standard']
  },
  {
    id: 'e_5',
    name: 'Wesley Gonçalves',
    role: 'Visagista & Esteticista',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    branchId: 'br2',
    branchName: 'Barbearia Flores - Bairro Alto',
    specialties: ['Limpeza de Pele', 'Sobrancelha', 'Depilação'],
    allowedServices: ['s_4', 's_5', 's_7', 's_12'],
    workDays: [1, 2, 3, 4, 5, 6],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    active: true,
    phone: '5516994206778',
    instagram: '@wesleygoncalves.estetica',
    bio: 'Especialista em visagismo facial, design de sobrancelha masculina e tratamentos de pele com peeling e hidratação.',
    avgServiceTime: 25,
    rating: 4.8,
    ratingCount: 74,
    bookingsCount: 180,
    permissions: ['standard']
  },
  {
    id: 'e_6',
    name: 'Luizy Bonalune',
    role: 'Barbeira & Hair Stylist',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    branchId: 'br2',
    branchName: 'Barbearia Flores - Bairro Alto',
    specialties: ['Corte Moderno', 'Hidratação Profunda', 'Platinado'],
    allowedServices: ['s_3', 's_6', 's_8', 's_11', 's_13'],
    workDays: [1, 2, 3, 4, 5, 6],
    availableHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
    active: true,
    phone: '5516994206778',
    instagram: '@luizybonalune.barber',
    bio: 'Especialista em cortes modernos masculinos estilizados, hidratações profundas e descoloração avançada (platinados).',
    avgServiceTime: 45,
    rating: 4.9,
    ratingCount: 110,
    bookingsCount: 380,
    permissions: ['standard']
  }
];

const TESTIMONIALS = [
  { name: 'Thiago Ramos', text: 'Melhor barbearia que já frequentei na vida! A barboterapia com toalha quente e massagem é de outro mundo.', rating: 5, date: '2026-05-18' },
  { name: 'Lucas Almeida', text: 'Ambiente sensacional com decoração impecável. O Diego cortou meu cabelo perfeitamente enquanto tomava uma IPA gelada.', rating: 5, date: '2026-05-20' },
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
  email: 'contato@barbeariaflores.com',
  address: 'Avenida Baldan, 1910 - Residencial Benassi, Matão - SP, 15993-000',
  openingHours: 'Seg a Sex: 09h às 21h | Sáb: 09h às 19h',
  whatsappMessageTemplate: 'Olá! Gostaria de confirmar meu agendamento na Barbearia Flores para o dia {data} às {hora} com o profissional {barbeiro} (Serviço: {servico}) na unidade {unidade}.',
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
  console.log("Iniciando limpeza e carga de dados no Firebase Firestore...");
  
  try {
    // 1. Limpa coleções legadas (Employees e Services) para evitar dados duplicados
    console.log("- Limpando coleção 'services' antiga...");
    const servicesSnapshot = await getDocs(collection(db, 'services'));
    for (const docSnap of servicesSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("- Limpando coleção 'employees' antiga...");
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    for (const docSnap of employeesSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("- Limpando coleção 'testimonials' antiga...");
    const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
    for (const docSnap of testimonialsSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("- Limpando coleção 'gallery' antiga...");
    const gallerySnapshot = await getDocs(collection(db, 'gallery'));
    for (const docSnap of gallerySnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("- Limpando coleção 'settings' antiga...");
    const settingsSnapshot = await getDocs(collection(db, 'settings'));
    for (const docSnap of settingsSnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }

    console.log("-----------------------------------------");
    console.log("Banco limpo com sucesso! Gravando novos dados...");
    console.log("-----------------------------------------");

    // 2. Grava novos Serviços com IDs estáticos ('s_1' a 's_13')
    console.log("- Salvando novos Serviços purificados...");
    for (const srv of SERVICES) {
      const { id, ...data } = srv;
      const docRef = doc(db, 'services', id);
      await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
    }

    // 3. Grava novos Barbeiros com IDs estáticos ('e_1' a 'e_6')
    console.log("- Salvando equipe de Barbeiros Reais...");
    for (const emp of EMPLOYEES) {
      const { id, ...data } = emp;
      const docRef = doc(db, 'employees', id);
      await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
    }

    // 4. Grava Depoimentos
    console.log("- Salvando Depoimentos...");
    for (const tst of TESTIMONIALS) {
      const docRef = doc(collection(db, 'testimonials'));
      await setDoc(docRef, tst);
    }

    // 5. Grava Galeria
    console.log("- Salvando Galeria de Estilos...");
    for (const gal of GALLERY) {
      const docRef = doc(collection(db, 'gallery'));
      await setDoc(docRef, gal);
    }

    // 6. Grava Configurações Globais
    console.log("- Salvando Configurações Globais...");
    const settingsRef = doc(collection(db, 'settings'));
    await setDoc(settingsRef, SETTINGS);

    console.log("-----------------------------------------");
    console.log("CARGA EXECUTADA COM SUCESSO!");
    console.log("Seu banco de dados do Firebase foi purificado e reconfigurado.");
    console.log("-----------------------------------------");
    process.exit(0);

  } catch (error) {
    console.error("Erro ao popular banco de dados:", error);
    process.exit(1);
  }
}

seed();
