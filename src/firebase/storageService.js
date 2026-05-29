import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isMock } from './config';

/**
 * IMAGENS DE FALLBACK PREMIUM (UNSPLASH)
 * Coleção organizada de fotos profissionais em alta resolução por categoria.
 * Usadas em cenários de falha no Storage, chaves inválidas ou estouro de limites do Firestore/LocalStorage.
 */
const CATEGORY_IMAGES = {
  Corte: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
  Barba: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600',
  Ambiente: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600',
  default: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=600'
};

/**
 * Upload de Mídia com Fallback Inteligente e Resiliente.
 * 
 * 1. Modo Mock (Offline): Converte o arquivo para uma string Base64 e retorna para armazenamento local.
 *    Para proteger a cota do LocalStorage (5MB no total), limita arquivos a 1.5MB.
 * 2. Modo Produção (Firebase Storage): Realiza o upload real dos bytes e extrai a URL pública.
 * 3. Modo Resiliente: Caso o Storage falhe em produção (erros de regra de segurança, cota estourada), 
 *    executa conversão inteligente para Base64 (limite de 800KB para evitar estourar o limite de documento 
 *    do Firestore, que é de 1MB por doc) ou entrega uma imagem profissional da Unsplash.
 * 
 * @param {File} file - Arquivo binário da imagem capturada do input
 * @param {string} path - Caminho de destino (ex: 'employees', 'gallery', 'uploads')
 * @returns {Promise<string>} URL pública no Firebase Storage, String Base64 ou Imagem da Unsplash
 */
export const uploadMedia = async (file, path = 'uploads') => {
  if (isMock) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Retorna o base64 para persistir localmente no LocalStorage
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        console.warn("⚠️ [StorageMock] Erro ao ler arquivo como base64. Usando fallback.", error);
        resolve(CATEGORY_IMAGES.default);
      };
      
      try {
        // Limita a 1.5MB para evitar que uma única foto estoure a cota geral do LocalStorage
        if (file && file.size < 1.5 * 1024 * 1024) { 
          reader.readAsDataURL(file);
        } else {
          console.warn("⚠️ [StorageMock] Arquivo excede o limite offline seguro (1.5MB). Fornecendo imagem padrão.");
          resolve(CATEGORY_IMAGES.default);
        }
      } catch (err) {
        resolve(CATEGORY_IMAGES.default);
      }
    });
  }

  // --- FLUXO DE UPLOAD NO FIREBASE STORAGE REAL ---
  try {
    if (!storage) {
      throw new Error("Serviço de Firebase Storage não inicializado ou indisponível.");
    }
    
    // Gera nome de arquivo pseudo-aleatório baseado no timestamp atual para evitar colisões
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Executa o upload binário
    const snapshot = await uploadBytes(storageRef, file);
    
    // Obtém a URL pública HTTPS segura para renderização no frontend
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.warn("⚠️ [FirebaseStorage] Storage indisponível ou permissão negada. Ativando fallback híbrido:", error);
    
    return new Promise((resolve) => {
      // Se o arquivo for menor que 800KB, converte para Base64 e salva direto no Firestore (dentro do documento)
      // O limite físico de um único documento do Firestore é 1MB. Mantemos 800KB como margem de segurança.
      if (file && file.size < 800 * 1024) {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("⚡ [FirebaseStorage] Arquivo convertido para Base64 com sucesso para persistência alternativa no Firestore.");
          resolve(reader.result);
        };
        reader.onerror = () => {
          const cat = path === 'employees' ? 'default' : (path === 'gallery' ? 'Corte' : path);
          resolve(CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default);
        };
        reader.readAsDataURL(file);
      } else {
        // Se a imagem for gigante, entrega uma foto profissional hospedada em CDN para não quebrar o layout nem estourar o banco de dados
        console.warn("⚠️ [FirebaseStorage] Imagem muito grande para persistência segura no Firestore (>800KB). Fornecendo imagem Unsplash Premium.");
        const cat = path === 'employees' ? 'default' : (path === 'gallery' ? 'Corte' : path);
        resolve(CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.default);
      }
    });
  }
};
export default uploadMedia;

