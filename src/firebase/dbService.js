import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc 
} from 'firebase/firestore';
import { db, isMock } from './config';
import { 
  getServices as _getServices,
  createService as _createService,
  updateService as _updateService,
  deleteService as _deleteService
} from '../services/firebase/services';

// --- DATA MOCK INICIAL ---
const INITIAL_SERVICES = [
  { id: 's_1', name: "Barba Simples", price: 45, description: "Alinhamento e corte da barba com máquina e navalha, finalizado com óleo aromático de alta qualidade.", duration: 30, active: true, createdAt: new Date().toISOString() },
  { id: 's_2', name: "Barboterapia", price: 50, description: "Ritual completo com toalha quente, massagem facial, espuma hidratante e óleos essenciais pós-barba.", duration: 40, active: true, createdAt: new Date().toISOString() },
  { id: 's_3', name: "Corte de Cabelo", price: 55, description: "Corte clássico ou moderno com máquina e tesoura, finalizado com lavagem e pomada premium.", duration: 40, active: true, createdAt: new Date().toISOString() },
  { id: 's_4', name: "Depilação de Nariz", price: 30, description: "Higienização e remoção de pelos excessivos do nariz com cera morna hipoalergênica especial.", duration: 15, active: true, createdAt: new Date().toISOString() },
  { id: 's_5', name: "Depilação de Orelha", price: 30, description: "Remoção segura e eficiente de pelos indesejados na orelha utilizando cera morna premium.", duration: 15, active: true, createdAt: new Date().toISOString() },
  { id: 's_6', name: "Hidratação", price: 30, description: "Tratamento profundo com máscara reconstrutora para devolver o brilho e a maciez aos cabelos secos.", duration: 20, active: true, createdAt: new Date().toISOString() },
  { id: 's_7', name: "Limpeza de Pele", price: 28, description: "Remoção de impurezas, cravos e oleosidade excessiva com máscara negra e esfoliação revigorante.", duration: 30, active: true, createdAt: new Date().toISOString() },
  { id: 's_8', name: "Luzes", price: 185, description: "Clareamento parcial dos fios com técnicas modernas para um efeito iluminado personalizado.", duration: 90, active: true, createdAt: new Date().toISOString() },
  { id: 's_9', name: "Pezinho (Acabamento)", price: 20, description: "Acabamento e contorno do cabelo (nuca, costeletas e testa) feito na navalha e finalizado com loção.", duration: 15, active: true, createdAt: new Date().toISOString() },
  { id: 's_10', name: "Pigmentação", price: 25, description: "Correção de falhas e realce do contorno da barba ou cabelo com pigmento de acabamento natural.", duration: 20, active: true, createdAt: new Date().toISOString() },
  { id: 's_11', name: "Selagem", price: 75, description: "Tratamento térmico para redução de volume, frizz e alinhamento dos fios com aspecto natural.", duration: 60, active: true, createdAt: new Date().toISOString() },
  { id: 's_12', name: "Sobrancelha", price: 15, description: "Design de sobrancelha masculino com navalha ou pinça, valorizando o olhar e a harmonia facial.", duration: 15, active: true, createdAt: new Date().toISOString() },
  { id: 's_13', name: "Upgrade do Platinado", price: 55, description: "Manutenção e matização do tom platinado para cabelos descoloridos, neutralizando amarelos indesejados.", duration: 45, active: true, createdAt: new Date().toISOString() }
];

const INITIAL_EMPLOYEES = [
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

const INITIAL_TESTIMONIALS = [
  { id: 't1', name: 'Thiago Ramos', text: 'Melhor barbearia que já frequentei na vida! A barboterapia com toalha quente e massagem é de outro mundo.', rating: 5, date: '2026-05-18' },
  { id: 't2', name: 'Lucas Almeida', text: 'Ambiente sensacional com decoração impecável. O Diego cortou meu cabelo perfeitamente enquanto tomava uma IPA gelada.', rating: 5, date: '2026-05-20' },
  { id: 't3', name: 'Gabriel Costa', text: 'Excelente experiência. Agendei pelo site de forma super rápida e fui atendido exatamente no horário. Nota 10!', rating: 5, date: '2026-05-21' }
];

const INITIAL_GALLERY = [
  { id: 'g1', title: 'Corte Degradê Moderno', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600', category: 'Corte' },
  { id: 'g2', title: 'Barboterapia com Toalha Quente', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600', category: 'Barba' },
  { id: 'g3', title: 'Corte Clássico na Tesoura', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600', category: 'Corte' },
  { id: 'g4', title: 'Ambiente Premium e Acolhedor', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', category: 'Ambiente' },
  { id: 'g5', title: 'Produtos de Alta Qualidade', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=600', category: 'Produtos' },
  { id: 'g6', title: 'Pigmentação e Acabamento', image: 'https://images.unsplash.com/photo-1605497746444-ac9da58d7fc0?auto=format&fit=crop&q=80&w=600', category: 'Barba' }
];

const INITIAL_SETTINGS = {
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

const INITIAL_BOOKINGS = [
  { id: 'b1', clientName: 'Felipe Melo', clientEmail: 'felipe@email.com', clientPhone: '11988887777', employeeId: 'e_1', employeeName: 'Gabriel Flores', serviceId: 's_3', serviceName: 'Corte de Cabelo', price: 55, date: '2026-05-22', time: '14:30', status: 'confirmado', createdAt: '2026-05-21T18:30:00.000Z' },
  { id: 'b2', clientName: 'Rodrigo Faro', clientEmail: 'rodrigo@email.com', clientPhone: '11977776666', employeeId: 'e_3', employeeName: 'Gustavo Melo', serviceId: 's_2', serviceName: 'Barboterapia', price: 50, date: '2026-05-22', time: '16:00', status: 'pendente', createdAt: '2026-05-22T08:15:00.000Z' }
];

// --- SETUP LOCAL STORAGE SE MOCK ---
const getStorageItem = (key, initial) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const setStorageItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  // Notifica ouvintes locais
  window.dispatchEvent(new Event(`localstorage_${key}_updated`));
};

// --- REGISTRO DE ASSINATURAS MOCK ---
const mockSubscriptions = {};

// --- API UNIFICADA DO BANCO ---

// 1. Serviços (CRUD)
export const getServices = _getServices;
export const deleteService = _deleteService;

export const saveService = async (service) => {
  if (service.id) {
    return _updateService(service.id, service);
  } else {
    return _createService(service);
  }
};

// 2. Funcionários / Equipe (CRUD)
export const getEmployees = async () => {
  if (isMock) {
    return getStorageItem('employees', INITIAL_EMPLOYEES);
  }
  const snapshot = await getDocs(collection(db, 'employees'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveEmployee = async (employee) => {
  if (isMock) {
    const list = await getEmployees();
    if (employee.id) {
      const idx = list.findIndex(e => e.id === employee.id);
      if (idx !== -1) list[idx] = employee;
    } else {
      employee.id = 'e_' + Date.now();
      list.push(employee);
    }
    setStorageItem('employees', list);
    return employee;
  }
  if (employee.id) {
    const docRef = doc(db, 'employees', employee.id);
    const { id, ...data } = employee;
    await setDoc(docRef, data, { merge: true });
    return employee;
  } else {
    const docRef = await addDoc(collection(db, 'employees'), employee);
    return { id: docRef.id, ...employee };
  }
};

export const deleteEmployee = async (id) => {
  if (isMock) {
    const list = await getEmployees();
    const filtered = list.filter(e => e.id !== id);
    setStorageItem('employees', filtered);
    return;
  }
  await deleteDoc(doc(db, 'employees', id));
};

// 3. Depoimentos (CRUD)
export const getTestimonials = async () => {
  if (isMock) {
    return getStorageItem('testimonials', INITIAL_TESTIMONIALS);
  }
  const snapshot = await getDocs(collection(db, 'testimonials'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveTestimonial = async (testimonial) => {
  if (isMock) {
    const list = await getTestimonials();
    if (testimonial.id) {
      const idx = list.findIndex(t => t.id === testimonial.id);
      if (idx !== -1) list[idx] = testimonial;
    } else {
      testimonial.id = 't_' + Date.now();
      testimonial.date = new Date().toISOString().split('T')[0];
      list.push(testimonial);
    }
    setStorageItem('testimonials', list);
    return testimonial;
  }
  if (testimonial.id) {
    const docRef = doc(db, 'testimonials', testimonial.id);
    const { id, ...data } = testimonial;
    await setDoc(docRef, data, { merge: true });
    return testimonial;
  } else {
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonial,
      date: new Date().toISOString().split('T')[0]
    });
    return { id: docRef.id, ...testimonial };
  }
};

export const deleteTestimonial = async (id) => {
  if (isMock) {
    const list = await getTestimonials();
    const filtered = list.filter(t => t.id !== id);
    setStorageItem('testimonials', filtered);
    return;
  }
  await deleteDoc(doc(db, 'testimonials', id));
};

// 4. Galeria (CRUD)
export const getGallery = async () => {
  if (isMock) {
    return getStorageItem('gallery', INITIAL_GALLERY);
  }
  const snapshot = await getDocs(collection(db, 'gallery'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const saveGalleryItem = async (item) => {
  if (isMock) {
    const list = await getGallery();
    if (item.id) {
      const idx = list.findIndex(g => g.id === item.id);
      if (idx !== -1) list[idx] = item;
    } else {
      item.id = 'g_' + Date.now();
      list.push(item);
    }
    setStorageItem('gallery', list);
    return item;
  }
  if (item.id) {
    const docRef = doc(db, 'gallery', item.id);
    const { id, ...data } = item;
    await setDoc(docRef, data, { merge: true });
    return item;
  } else {
    const docRef = await addDoc(collection(db, 'gallery'), item);
    return { id: docRef.id, ...item };
  }
};

export const deleteGalleryItem = async (id) => {
  if (isMock) {
    const list = await getGallery();
    const filtered = list.filter(g => g.id !== id);
    setStorageItem('gallery', filtered);
    return;
  }
  await deleteDoc(doc(db, 'gallery', id));
};

// 5. Configurações (Get / Set)
export const getSettings = async () => {
  if (isMock) {
    const current = getStorageItem('settings', INITIAL_SETTINGS);
    let updated = false;
    if (current && current.phone === '5511999999999') {
      current.phone = '5516994206778';
      updated = true;
    }
    if (current && (!current.branches || !Array.isArray(current.branches) || current.branches.length === 0 || current.branches.some(b => b.name.includes('Unidade Centro') || b.name.includes('Unidade Jardins')))) {
      current.branches = INITIAL_SETTINGS.branches;
      current.address = INITIAL_SETTINGS.address;
      updated = true;
    }
    if (updated) {
      setStorageItem('settings', current);
    }
    return current;
  }
  try {
    const snapshot = await getDocs(collection(db, 'settings'));
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      return { id: docData.id, ...docData.data() };
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    console.error("Erro ao carregar configurações", error);
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = async (settings) => {
  if (isMock) {
    setStorageItem('settings', settings);
    return settings;
  }
  const collectionRef = collection(db, 'settings');
  const snapshot = await getDocs(collectionRef);
  if (!snapshot.empty) {
    const docRef = doc(db, 'settings', snapshot.docs[0].id);
    await setDoc(docRef, settings, { merge: true });
  } else {
    await addDoc(collectionRef, settings);
  }
  return settings;
};

// 6. Agendamentos (CRUD + Tempo Real)
export const getBookings = async () => {
  if (isMock) {
    return getStorageItem('bookings', INITIAL_BOOKINGS);
  }
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const saveBooking = async (booking) => {
  const timestamp = new Date().toISOString();
  if (isMock) {
    const list = await getBookings();
    if (booking.id) {
      const idx = list.findIndex(b => b.id === booking.id);
      if (idx !== -1) list[idx] = booking;
    } else {
      // Validação crítica de conflito de horários (Overbooking)
      const isOccupied = list.some(b => 
        b.date === booking.date &&
        b.time === booking.time &&
        b.employeeId === booking.employeeId &&
        b.branchId === booking.branchId &&
        b.status !== 'cancelado'
      );
      if (isOccupied) {
        throw new Error("Este horário já foi reservado por outro cliente. Por favor, selecione outro horário disponível.");
      }

      booking.id = 'b_' + Date.now();
      booking.createdAt = timestamp;
      booking.status = booking.status || 'pendente';
      list.push(booking);
    }
    setStorageItem('bookings', list);
    return booking;
  }
  if (booking.id) {
    const docRef = doc(db, 'bookings', booking.id);
    const { id, ...data } = booking;
    await setDoc(docRef, data, { merge: true });
    return booking;
  } else {
    // Validação crítica de conflito de horários (Overbooking) em produção
    const allBookings = await getBookings();
    const isOccupied = allBookings.some(b => 
      b.date === booking.date &&
      b.time === booking.time &&
      b.employeeId === booking.employeeId &&
      b.branchId === booking.branchId &&
      b.status !== 'cancelado'
    );
    if (isOccupied) {
      throw new Error("Este horário já foi reservado por outro cliente. Por favor, selecione outro horário disponível.");
    }

    const newBooking = {
      ...booking,
      createdAt: timestamp,
      status: booking.status || 'pendente'
    };
    const docRef = await addDoc(collection(db, 'bookings'), newBooking);
    return { id: docRef.id, ...newBooking };
  }
};

export const deleteBooking = async (id) => {
  if (isMock) {
    const list = await getBookings();
    const filtered = list.filter(b => b.id !== id);
    setStorageItem('bookings', filtered);
    return;
  }
  await deleteDoc(doc(db, 'bookings', id));
};

// 7. Inscrição em Tempo Real de Agendamentos (Usado no Admin Dashboard)
export const subscribeBookings = (onUpdate) => {
  if (isMock) {
    const handler = () => {
      const currentBookings = getStorageItem('bookings', INITIAL_BOOKINGS);
      onUpdate(currentBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    };
    
    // Dispara a primeira carga
    handler();
    
    // Escuta eventos de atualização locais
    window.addEventListener('localstorage_bookings_updated', handler);
    
    // Retorna a função de unsubscribe
    return () => {
      window.removeEventListener('localstorage_bookings_updated', handler);
    };
  }
  
  // Real Firestore realtime subscription
  const q = collection(db, 'bookings');
  return onSnapshot(q, (snapshot) => {
    const bookingsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ordena por data de criação decrescente
    bookingsList.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
    onUpdate(bookingsList);
  }, (error) => {
    console.error("Erro na escuta de agendamentos em tempo real:", error);
  });
};

// 8. Busca horários ocupados para evitar overbooking
export const getOccupiedHours = async (date, employeeId, branchId) => {
  if (isMock) {
    const allBookings = await getBookings();
    const activeBookings = allBookings.filter(
      b => b.date === date && b.branchId === branchId && b.status !== 'cancelado'
    );
    
    if (employeeId !== 'any') {
      return activeBookings
        .filter(b => b.employeeId === employeeId)
        .map(b => b.time);
    } else {
      const employeesList = getStorageItem('employees', INITIAL_EMPLOYEES);
      const totalBarbers = employeesList.length || 3;
      
      const counts = {};
      activeBookings.forEach(b => {
        counts[b.time] = (counts[b.time] || 0) + 1;
      });
      
      return Object.keys(counts).filter(time => counts[time] >= totalBarbers);
    }
  }
  
  try {
    const snapshot = await getDocs(collection(db, 'bookings'));
    const allBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const activeBookings = allBookings.filter(
      b => b.date === date && b.branchId === branchId && b.status !== 'cancelado'
    );
    
    if (employeeId !== 'any') {
      return activeBookings
        .filter(b => b.employeeId === employeeId)
        .map(b => b.time);
    } else {
      const empSnapshot = await getDocs(collection(db, 'employees'));
      const totalBarbers = empSnapshot.docs.length || 3;
      
      const counts = {};
      activeBookings.forEach(b => {
        counts[b.time] = (counts[b.time] || 0) + 1;
      });
      
      return Object.keys(counts).filter(time => counts[time] >= totalBarbers);
    }
  } catch (error) {
    console.error("Erro ao buscar horários ocupados:", error);
    return [];
  }
};

