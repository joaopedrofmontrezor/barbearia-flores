import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, Calendar, Clock, MapPin, Phone, Mail, ChevronRight, 
  MessageSquare, Star, ArrowUp, Menu, X, Check, Instagram, 
  Facebook, Shield, Award, Sparkles, Send
} from 'lucide-react';
import { 
  getServices, getEmployees, getTestimonials, 
  getGallery, getSettings, saveBooking 
} from '../firebase/dbService';
import { logoutAdmin } from '../firebase/authService';

const LandingPage = () => {
  const navigate = useNavigate();
  const bookingSectionRef = useRef(null);

  // States for DB data
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState({
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
  });

  // UI States
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isNavbarTransparent, setIsNavbarTransparent] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Before/After comparison slider value (0 to 100)
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSliding, setIsSliding] = useState(false);

  // Selected Branch for UI details view
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(0);

  // Booking Form wizard state
  const [bookingStep, setBookingStep] = useState(1); // 1: Unidade, 2: Barbeiro, 3: Serviço, 4: Data/Hora, 5: Confirmação/Contato, 6: Sucesso
  const [bookingForm, setBookingForm] = useState({
    branchId: '',
    branchName: '',
    employeeId: '',
    employeeName: '',
    serviceId: '',
    serviceName: '',
    price: 0,
    date: '',
    time: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
  });

  // Booking available times (Mock static hours, can be dynamic)
  const availableHours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  // Testimonials Auto Scroll State
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    // Encerra sessão do administrador ao voltar à página principal
    const clearAdminSession = async () => {
      try {
        await logoutAdmin();
      } catch (err) {
        console.error("Erro ao limpar sessão do admin:", err);
      }
    };
    clearAdminSession();

    // Load Data
    const loadData = async () => {
      try {
        const [srv, emp, tst, gal, setts] = await Promise.all([
          getServices(),
          getEmployees(),
          getTestimonials(),
          getGallery(),
          getSettings()
        ]);
        setServices(srv);
        setEmployees(emp);
        setTestimonials(tst);
        setGallery(gal);
        if (setts) setSettings(setts);
      } catch (err) {
        console.error("Erro ao carregar dados do frontend:", err);
      }
    };
    loadData();

    // Scroll listener for Navbar transparent effect and ScrollTop button
    const handleScroll = () => {
      setIsNavbarTransparent(window.scrollY < 80);
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonials slider interval
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  // Gallery filtering
  const galleryCategories = ['Todos', 'Corte', 'Barba', 'Ambiente', 'Produtos'];
  const filteredGallery = activeCategory === 'Todos' 
    ? gallery 
    : gallery.filter(item => item.category === activeCategory);

  // Active Branch helper
  const activeBranch = (settings.branches && settings.branches[selectedBranchIndex]) || {
    name: 'Nossa Unidade',
    address: settings.address,
    phone: settings.phone,
    openingHours: settings.openingHours,
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.197576971936!2d-46.65867978502227!3d-23.56134968468165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1653245648719!5m2!1spt-BR!2sbr'
  };

  // Before/After comparison drag support
  const handleSliderMove = (e) => {
    if (!isSliding && e.type !== 'touchmove') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  // Booking handlers
  const selectBranch = (branch) => {
    setBookingForm(prev => {
      const updated = { ...prev, branchId: branch.id, branchName: branch.name };
      // Se o barbeiro já foi escolhido nos cards da equipe, pula direto para o serviço (passo 3)
      if (prev.employeeId) {
        setBookingStep(3);
      } else {
        setBookingStep(2);
      }
      return updated;
    });
  };

  const selectEmployee = (emp) => {
    setBookingForm({ ...bookingForm, employeeId: emp.id, employeeName: emp.name });
    setBookingStep(3);
  };

  const selectService = (srv) => {
    setBookingForm({ ...bookingForm, serviceId: srv.id, serviceName: srv.name, price: srv.price });
    setBookingStep(4);
  };

  const selectDateTime = (date, time) => {
    setBookingForm({ ...bookingForm, date, time });
    setBookingStep(5);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      // Salva no banco de dados (Firestore / LocalStorage)
      await saveBooking(bookingForm);
      
      // Formata a mensagem do Whatsapp de acordo com o template cadastrado
      let template = settings.whatsappMessageTemplate || 'Confirmando agendamento para {data} às {hora} com {barbeiro} (Serviço: {servico}) na unidade {unidade}';
      const formattedDate = bookingForm.date.split('-').reverse().join('/');
      const message = template
        .replace('{data}', formattedDate)
        .replace('{hora}', bookingForm.time)
        .replace('{barbeiro}', bookingForm.employeeName)
        .replace('{servico}', bookingForm.serviceName)
        .replace('{unidade}', bookingForm.branchName);

      // Telefones das unidades correspondentes
      const selectedBranch = settings.branches?.find(b => b.id === bookingForm.branchId);
      const branchPhone = selectedBranch?.phone || settings.phone;

      // Redireciona para o Whatsapp
      const waUrl = `https://wa.me/${branchPhone}?text=${encodeURIComponent(message)}`;
      
      setBookingStep(6);
      
      // Abre o WhatsApp
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 1500);

    } catch (err) {
      alert("Ocorreu um erro ao realizar o agendamento: " + err.message);
    }
  };

  const resetBooking = () => {
    setBookingStep(1);
    setBookingForm({
      branchId: '',
      branchName: '',
      employeeId: '',
      employeeName: '',
      serviceId: '',
      serviceName: '',
      price: 0,
      date: '',
      time: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
    });
  };

  // Contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white font-sans overflow-x-hidden selection:bg-gold selection:text-dark-950">
      
      {/* 1. HEADER / NAVBAR */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isNavbarTransparent ? 'bg-transparent py-6 border-b border-transparent' : 'bg-dark-950/95 backdrop-blur-md py-4 border-b border-gold/10 shadow-lg'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Scissors className="w-7 h-7 text-gold transform -rotate-45" />
            <span className="font-title font-bold text-xl md:text-2xl tracking-widest text-gold">FLORES</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase">
            {['sobre', 'servicos', 'galeria', 'equipe', 'depoimentos', 'localizacao'].map((id) => (
              <button key={id} onClick={() => scrollToId(id)} className="hover:text-gold transition-colors relative group py-2">
                {id}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={() => scrollToSection(bookingSectionRef)} 
              className="btn-outline px-6 py-2.5 rounded-lg text-xs"
            >
              Agendar Horário
            </button>
            <button 
              onClick={() => navigate('/admin')} 
              className="px-4 py-2.5 text-xs text-dark-500 hover:text-gold uppercase tracking-widest transition-colors font-semibold"
            >
              Admin
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-white hover:text-gold transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 bg-dark-950 flex flex-col justify-between p-6 border-l border-gold/10"
          >
            <div>
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2">
                  <Scissors className="w-6 h-6 text-gold" />
                  <span className="font-title font-bold text-lg tracking-widest text-gold">FLORES</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white hover:text-gold transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6 text-sm font-bold tracking-widest uppercase">
                {['sobre', 'servicos', 'galeria', 'equipe', 'depoimentos', 'localizacao', 'contato'].map((id) => (
                  <button key={id} onClick={() => scrollToId(id)} className="text-left py-2 border-b border-dark-900 hover:text-gold transition-colors">
                    {id}
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => { setMobileMenuOpen(false); scrollToSection(bookingSectionRef); }} 
                className="w-full btn-gold py-4 rounded-lg text-xs"
              >
                Agendar Horário
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }} 
                className="w-full py-4 text-xs bg-dark-900 border border-dark-800 rounded-lg text-dark-500 uppercase tracking-widest text-center"
              >
                Painel Admin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
        {/* Parallax background overlay with luxury image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-40 mix-blend-luminosity transform scale-105 animate-pulse duration-10000 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-transparent to-dark-950"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-1.5 rounded-full text-[10px] md:text-xs text-gold font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4" />
            A Experiência de Luxo que Você Merece
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-8xl font-black font-title tracking-widest uppercase text-white"
          >
            BARBEARIA <span className="text-gold-gradient block sm:inline">FLORES</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm md:text-lg text-dark-500 max-w-2xl mx-auto tracking-wide leading-relaxed font-light"
          >
            Mais do que um corte de cabelo e barba. Um templo de estética masculina, café expresso, cerveja gelada e os melhores visagistas da região.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => scrollToSection(bookingSectionRef)} 
              className="w-full sm:w-auto btn-gold px-8 py-4.5 rounded-lg text-xs font-bold shadow-lg"
            >
              Agendar Horário
            </button>
            <button 
              onClick={() => scrollToId('servicos')} 
              className="w-full sm:w-auto btn-outline px-8 py-4.5 rounded-lg text-xs"
            >
              Conhecer Serviços
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator mouse */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500 cursor-pointer" onClick={() => scrollToId('sobre')}>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-gold/60">Descubra</span>
          <div className="w-6 h-10 border-2 border-gold/30 rounded-full flex justify-center p-1.5">
            <motion.div 
              animate={{ y: [0, 12, 0] }} 
              transition={{ repeat: Infinity, duration: 1.5 }} 
              className="w-1.5 h-1.5 bg-gold rounded-full"
            />
          </div>
        </div>
      </section>

      {/* 3. SOBRE NOS */}
      <section id="sobre" className="py-24 md:py-32 bg-dark-950 border-t border-dark-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Story */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest">
                <span className="w-8 h-[1px] bg-gold"></span>
                Tradição & Elegância
              </div>
              <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider leading-tight">
                UM CONCEITO <span className="text-gold-gradient">PREMIUM</span> DE ESTÉTICA MASCULINA
              </h2>
              <p className="text-sm text-dark-500 leading-relaxed font-light">
                Fundada em 2018 com o propósito de redefinir o cuidado pessoal masculino, a Barbearia Flores combina técnicas tradicionais de barbearia clássica com as maiores tendências internacionais de corte e visagismo.
              </p>
              <p className="text-sm text-dark-500 leading-relaxed font-light">
                Nosso espaço foi projetado para oferecer um refúgio de relaxamento para o homem moderno. Cada atendimento é um ritual exclusivo, acompanhado de bebidas premium selecionadas, toalha quente e óleos aromáticos essenciais.
              </p>

              {/* Statistics counters animated */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-dark-900">
                {[
                  { value: '5+', label: 'Anos de Estrada' },
                  { value: '12k', label: 'Cortes Feitos' },
                  { value: '99%', label: 'Satisfação' }
                ].map((stat, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <h4 className="text-2xl md:text-4xl font-bold font-sans text-gold">{stat.value}</h4>
                    <p className="text-[10px] md:text-xs text-dark-500 uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout Graphic Before After comparison */}
            <div className="space-y-4">
              <div className="relative h-[350px] sm:h-[450px] w-full rounded-2xl overflow-hidden border border-gold/15 shadow-2xl">
                
                {/* BEFORE AFTER IMAGE COMPARISON */}
                <div 
                  className="absolute inset-0 select-none"
                  onMouseMove={handleSliderMove}
                  onTouchMove={handleSliderMove}
                  onMouseDown={() => setIsSliding(true)}
                  onMouseUp={() => setIsSliding(false)}
                  onMouseLeave={() => setIsSliding(false)}
                >
                  {/* Before (Background) */}
                  <img 
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800" 
                    alt="Antes" 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute top-4 left-4 bg-dark-950/80 backdrop-blur-md px-3 py-1 rounded text-[10px] text-red-400 font-bold uppercase tracking-widest border border-red-500/20">
                    Clássico
                  </div>

                  {/* After (Foreground, clipped) */}
                  <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800" 
                      alt="Depois" 
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute top-4 right-4 bg-gold/10 backdrop-blur-md px-3 py-1 rounded text-[10px] text-gold font-bold uppercase tracking-widest border border-gold/30">
                      Moderno
                    </div>
                  </div>

                  {/* Slider Control Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-gold cursor-ew-resize flex items-center justify-center"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gold text-dark-950 border-4 border-dark-950 shadow-gold-glow flex items-center justify-center font-bold text-xs select-none">
                      ↔
                    </div>
                  </div>
                </div>

              </div>
              <p className="text-center text-[10px] text-dark-500 uppercase tracking-widest">
                Deslize o marcador acima para comparar nossos estilos
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SERVICOS */}
      <section id="servicos" className="py-24 md:py-32 bg-dark-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Tabela de Preços</span>
            <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
              NOSSOS SERVIÇOS
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto"></div>
            <p className="text-sm text-dark-500 font-light">
              Escolha serviços isolados ou aproveite nossos combos especiais com descontos exclusivos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((item) => (
              <div 
                key={item.id} 
                className="glass-card rounded-xl p-8 border border-dark-800 flex flex-col justify-between glass-card-hover group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="font-title font-bold text-lg text-white group-hover:text-gold transition-colors uppercase tracking-wider">
                      {item.name}
                    </h3>
                    <span className="text-xl font-bold font-sans text-gold">R$ {item.price}</span>
                  </div>
                  <p className="text-xs text-dark-500 leading-relaxed font-light mb-6">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-dark-950">
                  <div className="flex items-center gap-2 text-xs text-dark-500 font-semibold">
                    <Clock className="w-4 h-4 text-gold/70" />
                    <span>{item.duration} min</span>
                  </div>
                  <button 
                    onClick={() => {
                      setBookingForm({
                        ...bookingForm,
                        serviceId: item.id,
                        serviceName: item.name,
                        price: item.price
                      });
                      setBookingStep(1); // Reinicia e manda escolher barbeiro
                      scrollToSection(bookingSectionRef);
                    }}
                    className="text-xs font-bold text-gold group-hover:underline flex items-center gap-1 uppercase tracking-wider transition-all"
                  >
                    Agendar
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GALERIA */}
      <section id="galeria" className="py-24 md:py-32 bg-dark-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Portfólio</span>
            <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
              GALERIA DE ESTILOS
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto"></div>
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {galleryCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
                  activeCategory === cat 
                    ? 'bg-gold text-dark-950 font-bold shadow-gold-glow' 
                    : 'bg-dark-900 border border-dark-800 text-dark-500 hover:text-white hover:border-gold/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Responsive Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredGallery.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={item.id}
                  onClick={() => setLightboxImage(item.image)}
                  className="group relative h-72 rounded-xl overflow-hidden border border-dark-800 cursor-pointer shadow-lg"
                >
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-[10px] text-gold uppercase tracking-wider font-bold mb-1">
                      {item.category}
                    </span>
                    <h4 className="font-title font-bold text-white uppercase tracking-wide">
                      {item.title}
                    </h4>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            >
              <button className="absolute top-6 right-6 p-2 text-white hover:text-gold transition-colors">
                <X className="w-8 h-8" />
              </button>
              <img 
                src={lightboxImage} 
                alt="Enlarged cut" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg border border-gold/10 shadow-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 6. EQUIPE */}
      <section id="equipe" className="py-24 md:py-32 bg-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Profissionais</span>
            <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
              NOSSOS BARBEIROS
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto"></div>
            <p className="text-sm text-dark-500 font-light">
              Mestres em visagismo e cuidados masculinos prontos para elevar sua autoestima.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {employees.map((item) => (
              <div 
                key={item.id} 
                className="glass-card rounded-xl overflow-hidden border border-dark-800 flex flex-col justify-between group glass-card-hover"
              >
                <div>
                  <div className="h-64 w-full overflow-hidden bg-dark-950 relative border-b border-dark-800">
                    <img 
                      src={item.photo} 
                      alt={item.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    />
                    <div className="absolute top-4 right-4 bg-dark-950/80 backdrop-blur-sm border border-gold/20 px-2.5 py-1 rounded text-xs text-gold flex items-center gap-1 font-bold">
                      <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-title font-bold text-xl text-white uppercase tracking-wider mb-1">
                      {item.name}
                    </h3>
                    <span className="text-xs text-gold font-semibold uppercase tracking-widest">
                      {item.role}
                    </span>
                    <p className="text-xs text-dark-500 mt-4 leading-relaxed font-light">
                      {item.bio}
                    </p>
                  </div>
                </div>
                <div className="px-8 pb-8 pt-4 border-t border-dark-950/50">
                  <button 
                    onClick={() => {
                      setBookingForm({
                        ...bookingForm,
                        employeeId: item.id,
                        employeeName: item.name
                      });
                      setBookingStep(1); // Vai primeiro para escolha de unidade
                      scrollToSection(bookingSectionRef);
                    }}
                    className="w-full btn-outline py-3 rounded-lg text-xs font-bold"
                  >
                    Agendar com {item.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SISTEMA DE AGENDAMENTO */}
      <section ref={bookingSectionRef} id="agendamento" className="py-24 md:py-32 bg-dark-950 border-t border-dark-900 relative">
        {/* Decorative elements */}
        <div className="absolute top-[-5%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-gold/5 blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-gold text-xs font-bold uppercase tracking-widest animate-pulse">Agendamento Online</span>
            <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
              RESERVE SEU HORÁRIO
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto"></div>
          </div>

          <div className="glass-card rounded-2xl border border-gold/10 overflow-hidden shadow-2xl">
            {/* Step Wizard Header Indicator */}
            <div className="bg-dark-900/60 border-b border-dark-800 px-6 py-4 flex items-center justify-between text-xs font-bold tracking-widest uppercase text-dark-500">
              <div className="flex gap-2.5 items-center overflow-x-auto w-full">
                {[
                  { step: 1, label: 'Unidade' },
                  { step: 2, label: 'Barbeiro' },
                  { step: 3, label: 'Serviço' },
                  { step: 4, label: 'Data e Hora' },
                  { step: 5, label: 'Finalizar' }
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-2 shrink-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                      bookingStep === s.step 
                        ? 'bg-gold text-dark-950 shadow-gold-glow font-extrabold' 
                        : bookingStep > s.step 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-dark-800 text-dark-500'
                    }`}>
                      {bookingStep > s.step ? <Check className="w-3 h-3" /> : s.step}
                    </span>
                    <span className={bookingStep === s.step ? 'text-gold' : ''}>{s.label}</span>
                    {s.step < 5 && <ChevronRight className="w-3 h-3 text-dark-800 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            {/* WIZARD BODIES */}
            <div className="p-8 min-h-[300px]">
              
              {/* STEP 1: Select Unidade */}
              {bookingStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <h3 className="font-title text-gold uppercase tracking-wider text-sm">Selecione a Unidade</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settings.branches && settings.branches.map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => selectBranch(branch)}
                        className={`p-5 rounded-xl border text-left flex items-start gap-4 transition-all ${
                          bookingForm.branchId === branch.id 
                            ? 'bg-gold/10 border-gold/80 text-gold shadow-gold-glow' 
                            : 'bg-dark-900 border-dark-800 hover:border-gold/30 hover:bg-dark-800'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0 text-gold">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-white">{branch.name}</h4>
                          <p className="text-[11px] text-dark-400 font-light leading-relaxed">{branch.address}</p>
                          <p className="text-[9px] text-gold uppercase font-semibold tracking-wider pt-1">{branch.openingHours}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Select Professional */}
              {bookingStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-title text-gold uppercase tracking-wider text-sm">Selecione o Barbeiro de sua Preferência</h3>
                    <button onClick={() => setBookingStep(1)} className="text-[10px] text-dark-500 hover:text-gold uppercase tracking-widest font-semibold">
                      Voltar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Qualquer barbeiro option */}
                    <button 
                      onClick={() => selectEmployee({ id: 'any', name: 'Qualquer Barbeiro (Disponibilidade mais rápida)' })}
                      className={`p-5 rounded-xl border text-left flex items-center gap-4 transition-all ${
                        bookingForm.employeeId === 'any' 
                          ? 'bg-gold/10 border-gold/80 text-gold shadow-gold-glow' 
                          : 'bg-dark-900 border-dark-800 hover:border-gold/30 hover:bg-dark-800'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                        <Scissors className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">Qualquer Profissional</h4>
                        <p className="text-[10px] text-dark-500 uppercase mt-0.5 tracking-wider">Menor tempo de espera</p>
                      </div>
                    </button>

                    {/* DB staff list */}
                    {employees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => selectEmployee(emp)}
                        className={`p-5 rounded-xl border text-left flex items-center gap-4 transition-all ${
                          bookingForm.employeeId === emp.id 
                            ? 'bg-gold/10 border-gold/80 text-gold shadow-gold-glow' 
                            : 'bg-dark-900 border-dark-800 hover:border-gold/30 hover:bg-dark-800'
                        }`}
                      >
                        <img src={emp.photo} alt={emp.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                        <div>
                          <h4 className="font-bold text-sm text-white">{emp.name}</h4>
                          <p className="text-[10px] text-gold uppercase mt-0.5 tracking-widest font-semibold">{emp.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Select Service */}
              {bookingStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-title text-gold uppercase tracking-wider text-sm">Selecione o Serviço</h3>
                    <button 
                      onClick={() => {
                        // Se o barbeiro já foi selecionado externamente pelos cards, volta para Unidade, senão para Barbeiro
                        const selectedEmp = employees.find(e => e.id === bookingForm.employeeId);
                        if (selectedEmp && bookingForm.employeeId !== 'any') {
                          setBookingStep(1);
                        } else {
                          setBookingStep(2);
                        }
                      }} 
                      className="text-[10px] text-dark-500 hover:text-gold uppercase tracking-widest font-semibold"
                    >
                      Voltar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {services.map(srv => (
                      <button
                        key={srv.id}
                        onClick={() => selectService(srv)}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-all ${
                          bookingForm.serviceId === srv.id 
                            ? 'bg-gold/10 border-gold/80 text-gold shadow-gold-glow' 
                            : 'bg-dark-900 border-dark-800 hover:border-gold/30 hover:bg-dark-800'
                        }`}
                      >
                        <div>
                          <h4 className="font-bold text-sm text-white">{srv.name}</h4>
                          <span className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider">{srv.duration} minutos</span>
                        </div>
                        <span className="font-bold text-sm text-gold">R$ {srv.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Select Date & Time */}
              {bookingStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-title text-gold uppercase tracking-wider text-sm">Escolha a Data & Hora</h3>
                    <button onClick={() => setBookingStep(3)} className="text-[10px] text-dark-500 hover:text-gold uppercase tracking-widest font-semibold">
                      Voltar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Selecione o Dia</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                        className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Horários Disponíveis</label>
                      {bookingForm.date ? (
                        <div className="grid grid-cols-3 gap-2">
                          {availableHours.map(h => (
                            <button
                              key={h}
                              type="button"
                              onClick={() => selectDateTime(bookingForm.date, h)}
                              className={`py-2 px-1 text-xs rounded border text-center transition-all ${
                                bookingForm.time === h 
                                  ? 'bg-gold text-dark-950 border-gold shadow-gold-glow font-bold' 
                                  : 'bg-dark-900 border-dark-800 text-dark-500 hover:border-gold/30 hover:text-white'
                              }`}
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="h-24 flex items-center justify-center text-xs text-dark-500 bg-dark-900/40 rounded-lg border border-dashed border-dark-800">
                          Selecione um dia para liberar horários
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Client information */}
              {bookingStep === 5 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-title text-gold uppercase tracking-wider text-sm">Informações de Contato</h3>
                    <button onClick={() => setBookingStep(4)} className="text-[10px] text-dark-500 hover:text-gold uppercase tracking-widest font-semibold">
                      Voltar
                    </button>
                  </div>
                  
                  {/* Summary Box */}
                  <div className="p-4 bg-dark-900 rounded-xl border border-dark-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="col-span-2 sm:col-span-3 pb-2 border-b border-dark-800 flex justify-between items-center">
                      <div>
                        <span className="text-dark-500 block uppercase tracking-widest text-[9px] mb-0.5">Unidade</span>
                        <span className="font-bold text-white text-sm">{bookingForm.branchName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-dark-500 block uppercase tracking-widest text-[9px] mb-0.5">Valor Total</span>
                        <span className="font-bold text-gold text-sm">R$ {bookingForm.price}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-dark-500 block uppercase tracking-widest text-[9px] mb-0.5">Profissional</span>
                      <span className="font-bold text-white">{bookingForm.employeeName}</span>
                    </div>
                    <div>
                      <span className="text-dark-500 block uppercase tracking-widest text-[9px] mb-0.5">Serviço</span>
                      <span className="font-bold text-white">{bookingForm.serviceName}</span>
                    </div>
                    <div>
                      <span className="text-dark-500 block uppercase tracking-widest text-[9px] mb-0.5">Data e Hora</span>
                      <span className="font-bold text-gold">{bookingForm.date.split('-').reverse().join('/')} às {bookingForm.time}</span>
                    </div>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">Nome Completo</label>
                      <input
                        type="text"
                        placeholder="Ex: João da Silva"
                        value={bookingForm.clientName}
                        onChange={(e) => setBookingForm({ ...bookingForm, clientName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">WhatsApp</label>
                        <input
                          type="tel"
                          placeholder="Ex: 11999998888"
                          value={bookingForm.clientPhone}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientPhone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">E-mail</label>
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          value={bookingForm.clientEmail}
                          onChange={(e) => setBookingForm({ ...bookingForm, clientEmail: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 mt-4 btn-gold rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Confirmar Agendamento no WhatsApp
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 6: Success screen */}
              {bookingStep === 6 && (
                <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="font-title text-white uppercase tracking-wider text-xl">Agendamento Pré-Confirmado!</h3>
                  <p className="text-xs text-dark-500 max-w-md mx-auto leading-relaxed">
                    Seu agendamento foi salvo. Estamos redirecionando você para o nosso WhatsApp para enviar a mensagem de confirmação final ao atendente em instantes...
                  </p>
                  <div className="pt-6">
                    <button 
                      onClick={resetBooking} 
                      className="btn-outline px-6 py-2.5 rounded-lg text-[10px]"
                    >
                      Fazer Novo Agendamento
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* 8. DEPOIMENTOS */}
      <section id="depoimentos" className="py-24 md:py-32 bg-dark-900 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="mb-12 space-y-3">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Opinião de Quem Importa</span>
            <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
              DEPOIMENTOS DOS CLIENTES
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto"></div>
          </div>

          <div className="min-h-[250px] flex flex-col justify-between">
            {testimonials.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Stars */}
                  <div className="flex justify-center gap-1 text-gold">
                    {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-gold stroke-gold" />
                    ))}
                  </div>

                  <blockquote className="text-lg md:text-2xl font-light italic leading-relaxed text-white max-w-3xl mx-auto">
                    "{testimonials[testimonialIndex].text}"
                  </blockquote>

                  <div>
                    <cite className="not-italic font-title font-semibold text-gold uppercase tracking-wider text-xs md:text-sm">
                      {testimonials[testimonialIndex].name}
                    </cite>
                    <p className="text-[10px] text-dark-500 uppercase tracking-widest mt-1">Cliente VIP</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Slider dots */}
            <div className="flex items-center justify-center gap-2.5 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    testimonialIndex === i ? 'bg-gold w-6 shadow-gold-glow' : 'bg-dark-800 hover:bg-dark-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. LOCALIZACAO */}
      <section id="localizacao" className="py-24 md:py-32 bg-dark-950 relative border-t border-dark-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Address and Hours */}
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-gold text-xs font-bold uppercase tracking-widest">Onde Estamos</span>
                <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
                  VISITE NOSSO ESPAÇO
                </h2>
                <div className="w-16 h-[2px] bg-gold"></div>
              </div>

              {/* Branch Selectors (Abas) */}
              {settings.branches && settings.branches.length > 1 && (
                <div className="flex flex-wrap gap-2.5 pb-2">
                  {settings.branches.map((branch, idx) => (
                    <button
                      key={branch.id || idx}
                      onClick={() => setSelectedBranchIndex(idx)}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                        selectedBranchIndex === idx
                          ? 'bg-gold border-gold text-dark-950 shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                          : 'bg-dark-900/50 border-dark-800 text-dark-400 hover:border-gold/50 hover:text-white'
                      }`}
                    >
                      {branch.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-xs text-white uppercase tracking-widest mb-1">Endereço</h4>
                    <p className="text-sm text-dark-500 font-light">{activeBranch.address}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-xs text-white uppercase tracking-widest mb-1">Horário de Funcionamento</h4>
                    <p className="text-sm text-dark-500 font-light leading-relaxed">{activeBranch.openingHours}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-title font-bold text-xs text-white uppercase tracking-widest mb-1">Telefone / WhatsApp</h4>
                    <p className="text-sm text-dark-500 font-light">{activeBranch.phone}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(activeBranch.address)}`, '_blank')}
                  className="btn-gold px-6 py-3.5 rounded-lg text-xs font-bold shadow-md uppercase tracking-wider"
                >
                  Como Chegar
                </button>
              </div>
            </div>

            {/* Google Maps Embed iframe */}
            <div className="h-[350px] sm:h-[450px] rounded-2xl overflow-hidden border border-gold/15 shadow-2xl relative">
              <iframe
                title="Google Maps Location"
                src={activeBranch.googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>
        </div>
      </section>

      {/* 10. CONTATO */}
      <section id="contato" className="py-24 md:py-32 bg-dark-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-gold text-xs font-bold uppercase tracking-widest">Contato</span>
            <h2 className="text-3xl md:text-5xl font-bold font-title text-white uppercase tracking-wider">
              FALE CONOSCO
            </h2>
            <div className="w-16 h-[2px] bg-gold mx-auto"></div>
          </div>

          <div className="glass-card rounded-2xl border border-gold/10 p-8 shadow-2xl">
            {contactSuccess ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-title text-white uppercase tracking-wider text-xl">Mensagem Enviada!</h3>
                <p className="text-xs text-dark-500 max-w-md mx-auto">
                  Agradecemos seu contato. Nossa equipe retornará seu e-mail o mais rápido possível.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Seu Nome</label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Seu E-mail</label>
                    <input
                      type="email"
                      placeholder="Ex: joao@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">Mensagem</label>
                  <textarea
                    rows="4"
                    placeholder="Sua dúvida ou sugestão..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-sm font-sans"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 btn-gold rounded-lg text-xs font-bold tracking-widest flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 11. FOOTER */}
      <footer className="bg-dark-950 py-16 border-t border-dark-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <Scissors className="w-6 h-6 text-gold transform -rotate-45" />
              <span className="font-title font-bold text-lg tracking-widest text-gold">FLORES</span>
            </div>
            <p className="text-xs text-dark-500 leading-relaxed font-light max-w-sm">
              Espaço premium focado na excelência dos cortes clássicos, design modernos de barbas e cuidado pessoal masculino de alta qualidade.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-dark-900 hover:text-gold hover:bg-gold/10 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-dark-900 hover:text-gold hover:bg-gold/10 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-title font-bold text-xs text-white uppercase tracking-widest">Links Rápidos</h4>
            <nav className="flex flex-col gap-2.5 text-xs text-dark-500">
              {['sobre', 'servicos', 'galeria', 'equipe'].map(id => (
                <button key={id} onClick={() => scrollToId(id)} className="text-left hover:text-gold transition-colors capitalize">
                  {id}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-title font-bold text-xs text-white uppercase tracking-widest">Contato e Endereço</h4>
            <p className="text-xs text-dark-500 leading-relaxed font-light">
              {settings.address} <br />
              {settings.phone} <br />
              {settings.email}
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-dark-900 flex flex-col sm:flex-row items-center justify-between text-xs text-dark-500 gap-4">
          <p>© {new Date().getFullYear()} Barbearia Flores. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <button className="hover:text-gold transition-colors">Políticas de Privacidade</button>
            <button className="hover:text-gold transition-colors">Termos de Uso</button>
          </div>
        </div>
      </footer>

      {/* FLOAT WHATSAPP BUTTON CTA */}
      <a
        href={`https://wa.me/${settings.phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-green-500/20"
        title="Fale no WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
      </a>

      {/* FLOAT SCROLL TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 p-3 bg-dark-900 border border-dark-800 text-gold rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:bg-gold hover:text-dark-950"
            title="Voltar ao Topo"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
