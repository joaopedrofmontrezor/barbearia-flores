import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../firebase/authService';
import { Scissors, Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Segurança avançada: Proteção contra força bruta (Brute Force Protection)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0); // em segundos

  // Efeito para decrementar o contador de bloqueio de segurança
  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTime === 0 && failedAttempts > 0) {
      // Opcional: resetar tentativas caso o bloqueio tenha expirado
      setFailedAttempts(0);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Se estiver no período de bloqueio, impede o submit
    if (lockoutTime > 0) {
      setError(`Acesso bloqueado por motivos de segurança. Aguarde mais ${lockoutTime} segundos.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginAdmin(email, password);
      setFailedAttempts(0); // Reseta tentativas falhas em caso de sucesso
      navigate('/admin');
    } catch (err) {
      console.error("Erro na tentativa de login do administrador:", err);
      
      // Incrementa tentativas malsucedidas
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      // Tratamento de códigos de erro do Firebase Auth para português amigável e seguro
      const errorCode = err.code || '';
      let friendlyError = 'Erro ao realizar login.';

      if (errorCode === 'auth/invalid-credential') {
        friendlyError = 'Senha incorreta ou e-mail inválido. Por favor, verifique suas credenciais.';
      } else if (errorCode === 'auth/wrong-password') {
        friendlyError = 'A senha informada está incorreta. Por favor, tente novamente.';
      } else if (errorCode === 'auth/user-not-found') {
        friendlyError = 'Nenhum administrador cadastrado com este e-mail.';
      } else if (errorCode === 'auth/too-many-requests') {
        friendlyError = 'Conta temporariamente bloqueada devido a muitas tentativas de login malsucedidas. Tente mais tarde.';
      } else if (errorCode === 'auth/invalid-email') {
        friendlyError = 'O formato do e-mail inserido é inválido.';
      } else if (errorCode === 'auth/user-disabled') {
        friendlyError = 'Esta conta de administrador foi desativada no sistema.';
      } else if (err.message && err.message.includes('Credenciais de demonstração incorretas')) {
        // Mensagem customizada do mock do authService
        friendlyError = 'Credenciais incorretas! A senha informada está errada para o usuário administrador de demonstração.';
      } else {
        friendlyError = err.message || friendlyError;
      }

      // Se atingir 3 tentativas, ativa bloqueio temporário de 30 segundos
      if (nextAttempts >= 3) {
        setLockoutTime(30);
        setError('Muitas tentativas falhas! Acesso bloqueado temporariamente por 30 segundos por motivos de segurança.');
      } else {
        const remaining = 3 - nextAttempts;
        setError(`${friendlyError} (Você tem mais ${remaining} ${remaining === 1 ? 'tentativa restante' : 'tentativas restantes'} antes do bloqueio).`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Gold Circles in Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-gold/10 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
            <Scissors className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold font-title text-gold uppercase tracking-wider">Painel Admin</h1>
          <p className="text-dark-400 text-xs mt-1 uppercase tracking-widest font-semibold">Acesso Restrito</p>
        </div>


        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/40 border border-red-800 text-sm text-red-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="email"
                placeholder="admin@barbeariaflores.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                required
                disabled={lockoutTime > 0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                required
                disabled={lockoutTime > 0}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-gold transition-colors"
                disabled={lockoutTime > 0}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockoutTime > 0}
            className="w-full py-3.5 mt-2 rounded-lg btn-gold flex items-center justify-center font-bold tracking-wider hover:opacity-90 disabled:opacity-50 disabled:transform-none text-sm transition-all cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
            ) : lockoutTime > 0 ? (
              `Bloqueado (${lockoutTime}s)`
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-xs text-dark-400 hover:text-gold transition-colors uppercase tracking-widest font-semibold cursor-pointer"
          >
            Voltar para o site principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
