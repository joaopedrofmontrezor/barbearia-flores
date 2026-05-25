import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, ArrowLeft, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { getServices } from '../services/firebase/services';
import ServiceCard from '../components/ServiceCard';

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca os serviços do banco de dados ao montar a página
  const fetchServicesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
      setError("Não foi possível carregar os serviços. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  // Trata a ação de agendamento, passando os dados do serviço por estado
  const handleBooking = (service) => {
    navigate('/', {
      state: {
        autoBook: true,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price
      }
    });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white font-sans overflow-x-hidden selection:bg-gold selection:text-dark-950 pb-20">
      
      {/* 1. Header Fixo Premium */}
      <header className="fixed top-0 left-0 w-full z-50 bg-dark-950/90 backdrop-blur-md py-4 border-b border-gold/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-dark-400 hover:text-gold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Scissors className="w-6 h-6 text-gold transform -rotate-45" />
            <span className="font-title font-bold text-lg tracking-widest text-gold">FLORES</span>
          </div>

          <div className="w-16"></div> {/* Espaçador para centralizar a logo */}
        </div>
      </header>

      {/* 2. Hero Section Pequena */}
      <section className="relative pt-32 pb-16 flex items-center justify-center bg-black overflow-hidden border-b border-dark-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-10 mix-blend-luminosity pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 border border-gold/30 bg-gold/5 px-4 py-1.5 rounded-full text-[10px] text-gold font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Menu Completo de Cuidados
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black font-title tracking-widest uppercase text-white"
          >
            NOSSOS <span className="text-gold-gradient">SERVIÇOS</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-dark-300 max-w-xl mx-auto tracking-wide leading-relaxed font-light"
          >
            Oferecemos uma experiência completa de estética masculina. Escolha entre cortes modernos, barboterapia relaxante e tratamentos premium para sua pele e cabelo.
          </motion.p>
        </div>
      </section>

      {/* 3. Área de Conteúdo / Grid de Serviços */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* Estado de Carregamento (Loading) */}
        {loading && (
          <div className="h-[45vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-dark-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-gold rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-dark-400 text-xs uppercase tracking-widest animate-pulse">Carregando serviços...</p>
          </div>
        )}

        {/* Estado de Erro */}
        {!loading && error && (
          <div className="h-[45vh] flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-title font-bold text-lg text-white uppercase tracking-wider">Falha na Conexão</h3>
              <p className="text-xs text-dark-300 font-light leading-relaxed">{error}</p>
            </div>
            <button
              onClick={fetchServicesData}
              className="btn-outline px-6 py-3 rounded-lg text-xs flex items-center gap-2 font-bold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Exibição da Grid com Map */}
        {!loading && !error && (
          <>
            {services.length === 0 ? (
              <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-2">
                <p className="text-dark-300 text-sm font-light">Nenhum serviço disponível no momento.</p>
                <p className="text-dark-400 text-xs font-light">Por favor, execute o seed do banco de dados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <div key={service.id} className="h-full">
                    <ServiceCard 
                      service={service} 
                      onBook={handleBooking}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Services;
