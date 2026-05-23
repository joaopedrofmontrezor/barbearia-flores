import { db, isMock } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

// Lista oficial dos serviços da Barbearia Flores
export const SEED_SERVICES = [
  {
    name: "Barba Simples",
    price: 45,
    description: "Alinhamento e corte da barba com máquina e navalha, finalizado com óleo aromático de alta qualidade.",
    duration: 30,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Barboterapia",
    price: 50,
    description: "Ritual completo com toalha quente, massagem facial, espuma hidratante e óleos essenciais pós-barba.",
    duration: 40,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Corte de Cabelo",
    price: 55,
    description: "Corte clássico ou moderno com máquina e tesoura, finalizado com lavagem e pomada premium.",
    duration: 40,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Depilação de Nariz",
    price: 30,
    description: "Higienização e remoção de pelos excessivos do nariz com cera morna hipoalergênica especial.",
    duration: 15,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Depilação de Orelha",
    price: 30,
    description: "Remoção segura e eficiente de pelos indesejados na orelha utilizando cera morna premium.",
    duration: 15,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Hidratação",
    price: 30,
    description: "Tratamento profundo com máscara reconstrutora para devolver o brilho e a maciez aos cabelos secos.",
    duration: 20,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Limpeza de Pele",
    price: 28,
    description: "Remoção de impurezas, cravos e oleosidade excessiva com máscara negra e esfoliação revigorante.",
    duration: 30,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Luzes",
    price: 185,
    description: "Clareamento parcial dos fios com técnicas modernas para um efeito iluminado personalizado.",
    duration: 90,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Pezinho (Acabamento)",
    price: 20,
    description: "Acabamento e contorno do cabelo (nuca, costeletas e testa) feito na navalha e finalizado com loção.",
    duration: 15,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Pigmentação",
    price: 25,
    description: "Correção de falhas e realce do contorno da barba ou cabelo com pigmento de acabamento natural.",
    duration: 20,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Selagem",
    price: 75,
    description: "Tratamento térmico para redução de volume, frizz e alinhamento dos fios com aspecto natural.",
    duration: 60,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Sobrancelha",
    price: 15,
    description: "Design de sobrancelha masculino com navalha ou pinça, valorizando o olhar e a harmonia facial.",
    duration: 15,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    name: "Upgrade do Platinado",
    price: 55,
    description: "Manutenção e matização do tom platinado para cabelos descoloridos, neutralizando amarelos indesejados.",
    duration: 45,
    active: true,
    createdAt: new Date().toISOString()
  }
];

const LOCAL_STORAGE_KEY = 'services';

// Helpers para o Mock LocalStorage
const getStorageServices = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    // Adiciona IDs fictícios para compatibilidade local
    const servicesWithIds = SEED_SERVICES.map((s, index) => ({
      id: `s_${index + 1}`,
      ...s
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(servicesWithIds));
    return servicesWithIds;
  }
  return JSON.parse(data);
};

const saveStorageServices = (services) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
  window.dispatchEvent(new Event(`localstorage_${LOCAL_STORAGE_KEY}_updated`));
};

/**
 * Busca todos os serviços ativos salvos no banco de dados e os retorna ordenados por nome.
 * Em modo mock, busca do LocalStorage.
 */
export const getServices = async () => {
  if (isMock) {
    const list = getStorageServices();
    return list
      .filter(s => s.active !== false)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  try {
    const servicesRef = collection(db, 'services');
    const q = query(servicesRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.active !== false);
  } catch (error) {
    console.warn("Erro ao ordenar no Firestore (pode faltar índice). Ordenando em memória:", error);
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(s => s.active !== false)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
};

/**
 * Cria um novo serviço no banco de dados. Impede duplicação por nome (case-insensitive).
 */
export const createService = async (serviceData) => {
  const nameTrimmed = serviceData.name.trim();
  const serviceToSave = {
    ...serviceData,
    name: nameTrimmed,
    active: serviceData.active !== undefined ? serviceData.active : true,
    createdAt: serviceData.createdAt || new Date().toISOString()
  };

  if (isMock) {
    const list = getStorageServices();
    const duplicate = list.some(s => s.name.toLowerCase() === nameTrimmed.toLowerCase());
    if (duplicate) {
      throw new Error(`O serviço "${nameTrimmed}" já está cadastrado.`);
    }

    serviceToSave.id = 's_' + Date.now();
    list.push(serviceToSave);
    saveStorageServices(list);
    return serviceToSave;
  }

  // Firestore duplication check
  const servicesRef = collection(db, 'services');
  const snapshot = await getDocs(servicesRef);
  const duplicate = snapshot.docs.some(doc => doc.data().name.toLowerCase() === nameTrimmed.toLowerCase());
  if (duplicate) {
    throw new Error(`O serviço "${nameTrimmed}" já existe no banco de dados.`);
  }

  const docRef = await addDoc(servicesRef, serviceToSave);
  return { id: docRef.id, ...serviceToSave };
};

/**
 * Atualiza um serviço existente no banco de dados. Garante que o nome não colida com outro serviço.
 */
export const updateService = async (id, serviceData) => {
  const nameTrimmed = serviceData.name ? serviceData.name.trim() : '';
  const updatedData = { ...serviceData };
  if (nameTrimmed) {
    updatedData.name = nameTrimmed;
  }

  if (isMock) {
    const list = getStorageServices();
    const idx = list.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new Error("Serviço não encontrado para atualização.");
    }

    if (nameTrimmed) {
      const duplicate = list.some(s => s.id !== id && s.name.toLowerCase() === nameTrimmed.toLowerCase());
      if (duplicate) {
        throw new Error(`Já existe outro serviço cadastrado com o nome "${nameTrimmed}".`);
      }
    }

    list[idx] = { ...list[idx], ...updatedData };
    saveStorageServices(list);
    return list[idx];
  }

  // Firestore update & duplication check
  if (nameTrimmed) {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);
    const duplicate = snapshot.docs.some(doc => doc.id !== id && doc.data().name.toLowerCase() === nameTrimmed.toLowerCase());
    if (duplicate) {
      throw new Error(`Já existe outro serviço no Firestore com o nome "${nameTrimmed}".`);
    }
  }

  const docRef = doc(db, 'services', id);
  const { id: _, ...payload } = updatedData;
  await setDoc(docRef, payload, { merge: true });
  return { id, ...payload };
};

/**
 * Deleta (remove permanentemente) um serviço pelo ID.
 */
export const deleteService = async (id) => {
  if (isMock) {
    const list = getStorageServices();
    const filtered = list.filter(s => s.id !== id);
    saveStorageServices(filtered);
    return;
  }

  const docRef = doc(db, 'services', id);
  await deleteDoc(docRef);
};
