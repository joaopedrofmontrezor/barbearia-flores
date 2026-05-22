import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isMock } from './config';

// Coleção de imagens premium padrão por categoria se o upload falhar
const CATEGORY_IMAGES = {
  Corte: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
  Barba: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
  Ambiente: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
  default: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600'
};

export const uploadMedia = async (file, path = 'uploads') => {
  if (isMock) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Retorna o base64 para persistir localmente no Firestore/LocalStorage
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.warn("Erro ao ler arquivo como base64. Usando imagem de fallback.", error);
        resolve(CATEGORY_IMAGES.default);
      };
      
      try {
        if (file && file.size < 1.5 * 1024 * 1024) { // Limita a 1.5MB para evitar estourar cota do localStorage
          reader.readAsDataURL(file);
        } else {
          console.warn("Arquivo muito grande para modo offline (limite 1.5MB). Usando imagem padrão.");
          resolve(CATEGORY_IMAGES.default);
        }
      } catch (err) {
        resolve(CATEGORY_IMAGES.default);
      }
    });
  }

  // Real Firebase Storage upload
  try {
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Erro no upload do Firebase Storage:", error);
    throw error;
  }
};
