import React, { useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.');
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
          <p className="text-dark-500 text-xs mt-1 uppercase tracking-widest">Acesso Restrito</p>
        </div>

        {/* Info Box for Demo */}
        <div className="mb-6 p-4 rounded-lg bg-gold/5 border border-gold/20 text-xs text-gold/80 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1 uppercase tracking-wider">Modo de Demonstração Ativo</p>
            <p>Se as credenciais do Firebase não forem configuradas no .env, você pode entrar usando:</p>
<<<<<<< HEAD
            <p className="mt-1 font-mono text-white">E-mail: admin@barbeariaflores.com</p>
=======
            <p className="mt-1 font-mono text-white">E-mail: admin@barbeariapremium.com</p>
>>>>>>> f77f807e37044f4ab56670bebdd643d55c698556
            <p className="font-mono text-white">Senha: admin123</p>
          </div>
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
            <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="email"
<<<<<<< HEAD
                placeholder="admin@barbeariaflores.com"
=======
                placeholder="admin@barbeariapremium.com"
>>>>>>> f77f807e37044f4ab56670bebdd643d55c698556
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-gold transition-colors text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:border-gold transition-colors text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-lg btn-gold flex items-center justify-center font-bold tracking-wider hover:opacity-90 disabled:opacity-50 disabled:transform-none text-sm transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-xs text-dark-500 hover:text-gold transition-colors uppercase tracking-widest font-semibold"
          >
            Voltar para o site principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
