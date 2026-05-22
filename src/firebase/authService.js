import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, isMock } from './config';

const MOCK_ADMIN = {
  uid: 'admin_123',
  email: 'admin@barbeariaflores.com',
  displayName: 'Administrador Flores',
};

// --- AUTH API UNIFICADA ---

export const loginAdmin = async (email, password) => {
  if (isMock) {
    return new Promise((resolve, reject) => {
      // Simula um atraso de rede
      setTimeout(() => {
        if (email === 'admin@barbeariaflores.com' && password === 'admin123') {
          const user = { ...MOCK_ADMIN };
          localStorage.setItem('admin_session', JSON.stringify(user));
          window.dispatchEvent(new Event('admin_auth_changed'));
          resolve(user);
        } else {
          reject(new Error('Credenciais de demonstração incorretas. Use: admin@barbeariaflores.com / admin123'));
        }
      }, 800);
    });
  }
  
  // Real Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutAdmin = async () => {
  if (isMock) {
    localStorage.removeItem('admin_session');
    window.dispatchEvent(new Event('admin_auth_changed'));
    return;
  }
  await signOut(auth);
};

export const getSessionUser = () => {
  if (isMock) {
    const session = localStorage.getItem('admin_session');
    return session ? JSON.parse(session) : null;
  }
  return auth?.currentUser || null;
};

export const subscribeAuth = (onChange) => {
  if (isMock) {
    const handler = () => {
      onChange(getSessionUser());
    };
    // Chama o listener inicialmente
    handler();
    
    window.addEventListener('admin_auth_changed', handler);
    return () => {
      window.removeEventListener('admin_auth_changed', handler);
    };
  }
  
  // Real Firebase Auth listener
  return onAuthStateChanged(auth, (user) => {
    onChange(user);
  });
};
