import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isMock } from './config';

/**
 * CREDENCIAIS PADRÃO DO MODO DE DEMONSTRAÇÃO (LOCAL STORAGE)
 * Usado exclusivamente se isMock for true (quando as chaves do Firebase não estão no .env)
 */
const MOCK_ADMIN = {
  uid: 'admin_123',
  email: 'admin@barbeariaflores.com',
  displayName: 'Administrador Flores',
};

// --- AUTH API UNIFICADA E RESILIENTE ---

/**
 * Autentica o administrador no sistema.
 * Trata de forma transparente o login no Firebase Auth real ou no simulador offline de LocalStorage.
 * 
 * @param {string} email - E-mail do usuário
 * @param {string} password - Senha de acesso
 * @returns {Promise<Object>} Dados do usuário autenticado (User do Firebase ou Mock)
 * @throws {Error} Se as credenciais estiverem erradas ou houver falha de rede
 */
export const loginAdmin = async (email, password) => {
  if (isMock) {
    return new Promise((resolve, reject) => {
      // Simula latência de rede realista para melhorar a UX (exibir spinners, loaders)
      setTimeout(() => {
        if (email === 'admin@barbeariaflores.com' && password === 'admin123') {
          const user = { ...MOCK_ADMIN };
          localStorage.setItem('admin_session', JSON.stringify(user));
          
          // Dispara evento personalizado global para sincronizar outros listeners na aplicação
          window.dispatchEvent(new Event('admin_auth_changed'));
          resolve(user);
        } else {
          // Lança erro amigável contendo instrução explícita de demonstração
          reject(new Error('Credenciais de demonstração incorretas. Use: admin@barbeariaflores.com / admin123'));
        }
      }, 800);
    });
  }
  
  // Login real no Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Encerra a sessão ativa do administrador.
 * Remove cookies/tokens do Firebase Auth ou limpa a sessão local mockada.
 * 
 * @returns {Promise<void>}
 */
export const logoutAdmin = async () => {
  if (isMock) {
    localStorage.removeItem('admin_session');
    // Notifica listeners locais sobre a perda da autenticação
    window.dispatchEvent(new Event('admin_auth_changed'));
    return;
  }
  
  // Signout real no Firebase Auth
  await signOut(auth);
};

/**
 * Obtém síncronamente o usuário atual da sessão ativa.
 * 
 * @returns {Object|null} Usuário autenticado ou null se deslogado
 */
export const getSessionUser = () => {
  if (isMock) {
    const session = localStorage.getItem('admin_session');
    return session ? JSON.parse(session) : null;
  }
  return auth?.currentUser || null;
};

/**
 * Subscreve um callback para escutar mudanças no estado de autenticação (Login / Logout).
 * Abstrai a escuta do Firebase (onAuthStateChanged) ou eventos customizados do LocalStorage.
 * 
 * @param {Function} onChange - Função callback acionada sempre que o estado de login mudar: (user) => {}
 * @returns {Function} Função de limpeza (Unsubscribe) para evitar memory leaks
 */
export const subscribeAuth = (onChange) => {
  if (isMock) {
    const handler = () => {
      onChange(getSessionUser());
    };
    // Executa imediatamente para alimentar o estado inicial do componente chamador
    handler();
    
    // Escuta eventos customizados de autenticação local gerados no login/logout
    window.addEventListener('admin_auth_changed', handler);
    return () => {
      window.removeEventListener('admin_auth_changed', handler);
    };
  }
  
  // Escuta nativa em tempo real fornecida pelo SDK do Firebase
  return onAuthStateChanged(auth, (user) => {
    onChange(user);
  });
};

