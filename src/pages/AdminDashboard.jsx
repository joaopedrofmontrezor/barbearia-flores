import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutAdmin, getSessionUser } from '../firebase/authService';
import { 
  getEmployees, saveEmployee, deleteEmployee,
  getTestimonials, saveTestimonial, deleteTestimonial,
  getGallery, saveGalleryItem, deleteGalleryItem,
  getSettings, saveSettings,
  subscribeBookings, saveBooking, deleteBooking
} from '../firebase/dbService';
import { 
  getServices, createService, updateService, deleteService 
} from '../services/firebase/services';
import { uploadMedia } from '../firebase/storageService';
import { compressImage } from '../utils/imageCompressor';
import { 
  Calendar, Scissors, Users, MessageSquare, Image, Settings, LogOut, 
  Plus, Edit, Trash2, Check, X, TrendingUp, DollarSign, Clock, MapPin, 
  Phone, Mail, Globe, Upload, User, Star, Briefcase, FileText, Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Data lists state
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [settings, setSettings] = useState({
    phone: '', email: '', address: '', openingHours: '', whatsappMessageTemplate: '', branches: []
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal / Form States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'service', 'employee', 'testimonial', 'gallery'
  const [editingItem, setEditingItem] = useState(null); // Item being edited
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');

  // Form Fields State
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', description: '', active: true });
  const [employeeForm, setEmployeeForm] = useState({ name: '', role: '', bio: '', photo: '', rating: 5.0, branchId: 'br1', branchName: 'Barbearia Flores - Benassi' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', text: '', rating: 5 });
  const [galleryForm, setGalleryForm] = useState({ title: '', category: 'Corte', image: '' });

  // Get current user and start real-time subscription for bookings
  useEffect(() => {
    setCurrentUser(getSessionUser());
    
    // Subscribe to bookings (realtime listener)
    const unsubscribeBookings = subscribeBookings((updatedBookings) => {
      setBookings(updatedBookings);
      setLoading(false);
    });

    // Fetch other collections
    loadStaticData();

    return () => {
      unsubscribeBookings();
    };
  }, []);

  const loadStaticData = async () => {
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
      setSettings(setts);
    } catch (err) {
      console.error("Erro ao carregar dados do dashboard:", err);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/');
  };

  // Status Change handlers
  const handleUpdateBookingStatus = async (booking, newStatus) => {
    try {
      setActionLoading(true);
      await saveBooking({ ...booking, status: newStatus });
    } catch (err) {
      alert("Erro ao atualizar status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm("Deseja realmente excluir este agendamento?")) {
      try {
        setActionLoading(true);
        await deleteBooking(id);
      } catch (err) {
        alert("Erro ao excluir: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Image Upload helper
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadPreview(URL.createObjectURL(file));
    }
  };

  // Save changes handler for CRUDs
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let imageUrl = '';
      if (uploadFile) {
        // Comprime a imagem no lado do cliente antes do upload
        const compressed = await compressImage(uploadFile, 800, 800, 0.7);
        imageUrl = await uploadMedia(compressed, modalType);
      }

      if (modalType === 'service') {
        const item = { 
          ...serviceForm, 
          price: Number(serviceForm.price), 
          duration: Number(serviceForm.duration),
          active: serviceForm.active !== undefined ? serviceForm.active : true
        };
        if (editingItem) {
          await updateService(editingItem.id, item);
        } else {
          await createService(item);
        }
        setServices(await getServices());
      } 
      else if (modalType === 'employee') {
        const item = { ...employeeForm, rating: Number(employeeForm.rating) };
        if (imageUrl) item.photo = imageUrl;
        else if (editingItem) item.photo = editingItem.photo;
        if (editingItem) item.id = editingItem.id;
        await saveEmployee(item);
        setEmployees(await getEmployees());
      }
      else if (modalType === 'testimonial') {
        const item = { ...testimonialForm, rating: Number(testimonialForm.rating) };
        if (editingItem) item.id = editingItem.id;
        await saveTestimonial(item);
        setTestimonials(await getTestimonials());
      }
      else if (modalType === 'gallery') {
        const item = { ...galleryForm };
        if (imageUrl) item.image = imageUrl;
        else if (editingItem) item.image = editingItem.image;
        if (!item.image) {
          alert("Por favor, faça upload de uma foto.");
          setActionLoading(false);
          return;
        }
        if (editingItem) item.id = editingItem.id;
        await saveGalleryItem(item);
        setGallery(await getGallery());
      }

      closeModal();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete helpers
  const handleDeleteItem = async (type, id) => {
    if (window.confirm("Deseja realmente excluir este item?")) {
      setActionLoading(true);
      try {
        if (type === 'service') {
          await deleteService(id);
          setServices(services.filter(s => s.id !== id));
        } else if (type === 'employee') {
          await deleteEmployee(id);
          setEmployees(employees.filter(e => e.id !== id));
        } else if (type === 'testimonial') {
          await deleteTestimonial(id);
          setTestimonials(testimonials.filter(t => t.id !== id));
        } else if (type === 'gallery') {
          await deleteGalleryItem(id);
          setGallery(gallery.filter(g => g.id !== id));
        }
      } catch (err) {
        alert("Erro ao deletar item: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Seed default services handler
  const handleSeedServices = async () => {
    if (window.confirm("Deseja realmente carregar a lista de serviços padrão da Barbearia Flores? Serviços já existentes com o mesmo nome não serão duplicados.")) {
      setActionLoading(true);
      try {
        const { SEED_SERVICES } = await import('../services/firebase/services');
        const currentServices = await getServices();
        const existingNames = new Set(currentServices.map(s => s.name.toLowerCase().trim()));
        
        let addedCount = 0;
        for (const service of SEED_SERVICES) {
          const nameTrimmed = service.name.trim();
          if (!existingNames.has(nameTrimmed.toLowerCase())) {
            await createService(service);
            addedCount++;
          }
        }
        
        // Refresh list
        setServices(await getServices());
        alert(`Carga concluída com sucesso! ${addedCount} novos serviços cadastrados.`);
      } catch (err) {
        alert("Erro ao popular os serviços padrão: " + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Settings Save handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await saveSettings(settings);
      alert("Configurações salvas com sucesso!");
    } catch (err) {
      alert("Erro ao salvar configurações: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBranchField = (index, field, value) => {
    const updatedBranches = [...(settings.branches || [])];
    updatedBranches[index] = { ...updatedBranches[index], [field]: value };
    setSettings({ ...settings, branches: updatedBranches });
  };

  const handleAddBranch = () => {
    const newBranch = {
      id: 'br_' + Date.now(),
      name: 'Nova Unidade',
      address: '',
      phone: settings.phone || '',
      openingHours: 'Seg a Sex: 09h às 21h | Sáb: 09h às 19h',
      googleMapsEmbedUrl: ''
    };
    setSettings({
      ...settings,
      branches: [...(settings.branches || []), newBranch]
    });
  };

  const handleRemoveBranch = (index) => {
    if ((settings.branches || []).length <= 1) {
      alert("Você precisa manter pelo menos uma unidade cadastrada.");
      return;
    }
    if (window.confirm("Deseja realmente remover esta unidade? Isso não excluirá os agendamentos já existentes dela.")) {
      const updatedBranches = (settings.branches || []).filter((_, i) => i !== index);
      setSettings({ ...settings, branches: updatedBranches });
    }
  };

  // Modal helpers
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setUploadFile(null);
    setUploadPreview('');

    if (type === 'service') {
      setServiceForm(item || { name: '', price: '', duration: '', description: '', active: true });
    } else if (type === 'employee') {
      setEmployeeForm(item || { name: '', role: '', bio: '', photo: '', rating: 5.0, branchId: 'br1', branchName: 'Barbearia Flores - Benassi' });
    } else if (type === 'testimonial') {
      setTestimonialForm(item || { name: '', text: '', rating: 5 });
    } else if (type === 'gallery') {
      setGalleryForm(item || { title: '', category: 'Corte', image: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setUploadFile(null);
    setUploadPreview('');
  };

  // Helper stats calculation
  const getFaturamentoEstimado = () => {
    return bookings
      .filter(b => b.status === 'confirmado')
      .reduce((sum, b) => sum + (b.price || 0), 0);
  };

  const totalHoje = bookings.filter(b => {
    const hoje = new Date().toISOString().split('T')[0];
    return b.date === hoje;
  }).length;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-dark-900 border-r border-dark-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-dark-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-6 h-6 text-gold" />
              <span className="font-title font-bold text-lg tracking-wider text-gold">Flores Admin</span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'bookings', label: 'Agendamentos', icon: Calendar },
              { id: 'services', label: 'Serviços', icon: Scissors },
              { id: 'employees', label: 'Equipe', icon: Users },
              { id: 'testimonials', label: 'Depoimentos', icon: MessageSquare },
              { id: 'gallery', label: 'Galeria', icon: Image },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gold/10 text-gold border-l-2 border-gold font-bold shadow-gold-glow' 
                    : 'text-dark-400 hover:bg-dark-800 hover:text-white hover:scale-[1.02]'
                }`}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User logout footer */}
        <div className="p-4 border-t border-dark-800">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex flex-col">
              <span className="text-xs text-white font-semibold truncate max-w-[140px]">
                {currentUser?.displayName || 'Administrador'}
              </span>
              <span className="text-[10px] text-dark-400 truncate max-w-[140px] font-medium">{currentUser?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-950/20 transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        {/* Loading overlay */}
        {loading && activeTab === 'bookings' ? (
          <div className="h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-dark-800 border-t-gold rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* Header tab metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold font-title text-gold uppercase tracking-wider">
                  {activeTab === 'bookings' && 'Controle de Agendamentos'}
                  {activeTab === 'services' && 'Gestão de Serviços'}
                  {activeTab === 'employees' && 'Nossa Equipe'}
                  {activeTab === 'testimonials' && 'Depoimentos dos Clientes'}
                  {activeTab === 'gallery' && 'Galeria de Fotos'}
                  {activeTab === 'settings' && 'Configurações Globais'}
                </h1>
                <p className="text-dark-300 text-xs mt-1 uppercase tracking-widest font-medium">
                  {activeTab === 'bookings' && 'Acompanhe as reservas de horários em tempo real'}
                  {activeTab === 'services' && 'Adicione, edite ou exclua serviços oferecidos'}
                  {activeTab === 'employees' && 'Gerencie os barbeiros parceiros e seus perfis'}
                  {activeTab === 'testimonials' && 'Monitore e aprove feedbacks e depoimentos'}
                  {activeTab === 'gallery' && 'Adicione fotos de cortes ou do espaço físico'}
                  {activeTab === 'settings' && 'Atualize contatos, endereço e WhatsApp da barbearia'}
                </p>
              </div>

              {/* Add CTA */}
              {activeTab !== 'settings' && activeTab !== 'bookings' && (
                <div className="flex items-center gap-3 shrink-0">
                  {activeTab === 'services' && (
                    <button
                      type="button"
                      onClick={handleSeedServices}
                      disabled={actionLoading}
                      className="btn-outline px-4 py-2.5 rounded-lg text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-gold" />
                      Popular Padrão
                    </button>
                  )}
                  <button
                    onClick={() => openModal(activeTab.slice(0, -1))}
                    className="btn-gold px-5 py-3 rounded-lg text-xs flex items-center gap-2 shadow-md font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Item
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT: BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Hoje', value: totalHoje, desc: 'Agendamentos para hoje', icon: Clock, color: 'text-blue-400 bg-blue-500/10' },
                    { label: 'Pendentes', value: bookings.filter(b => b.status === 'pendente').length, desc: 'Aguardando confirmação', icon: Calendar, color: 'text-yellow-400 bg-yellow-500/10' },
                    { label: 'Confirmados', value: bookings.filter(b => b.status === 'confirmado').length, desc: 'Horários garantidos', icon: Check, color: 'text-green-400 bg-green-500/10' },
                    { label: 'Faturamento Estimado', value: `R$ ${getFaturamentoEstimado()}`, desc: 'Total dos confirmados', icon: DollarSign, color: 'text-gold bg-gold/10' },
                  ].map((card, i) => (
                    <div key={i} className="glass-card p-6 rounded-xl border border-dark-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-dark-300 uppercase tracking-widest">{card.label}</span>
                        <h3 className="text-3xl font-bold mt-2 font-sans">{card.value}</h3>
                        <p className="text-[10px] text-dark-400 mt-1 font-medium">{card.desc}</p>
                      </div>
                      <div className={`p-4 rounded-xl ${card.color}`}>
                        <card.icon className="w-6 h-6" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bookings Table/List */}
                <div className="glass-card rounded-xl border border-dark-800 overflow-hidden">
                  <div className="p-6 border-b border-dark-800">
                    <h3 className="text-lg font-bold text-gold uppercase tracking-wider">Histórico de Reservas</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {bookings.length === 0 ? (
                      <div className="p-12 text-center text-dark-300 font-medium">
                        Nenhum agendamento realizado até o momento.
                      </div>
                    ) : (
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-dark-900 border-b border-dark-800 text-dark-300 text-xs uppercase tracking-widest font-bold">
                            <th className="p-4 pl-6">Cliente</th>
                            <th className="p-4">Contato</th>
                            <th className="p-4">Unidade</th>
                            <th className="p-4">Barbeiro</th>
                            <th className="p-4">Serviço / Valor</th>
                            <th className="p-4">Data / Hora</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-800">
                          {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-dark-900/50 transition-colors">
                              <td className="p-4 pl-6 font-semibold">{booking.clientName}</td>
                              <td className="p-4">
                                <div className="flex flex-col text-xs text-dark-300 font-medium">
                                  <span>{booking.clientPhone}</span>
                                  <span>{booking.clientEmail}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-1 rounded bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/20">
                                  {booking.branchName || 'Qualquer'}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-semibold">{booking.employeeName}</td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{booking.serviceName}</span>
                                  <span className="text-xs text-gold">R$ {booking.price}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold">{booking.date.split('-').reverse().join('/')}</span>
                                  <span className="text-xs text-dark-300 font-medium">{booking.time}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  booking.status === 'confirmado' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                  booking.status === 'cancelado' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {booking.status === 'pendente' && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateBookingStatus(booking, 'confirmado')}
                                      className="p-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
                                      title="Confirmar Horário"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                  {booking.status !== 'cancelado' && (
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateBookingStatus(booking, 'cancelado')}
                                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                                      title="Cancelar Horário"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                    title="Excluir Agendamento"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SERVICES */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl border border-dark-800 p-6 flex flex-col justify-between hover:border-gold/30 transition-all">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="font-title font-bold text-lg text-gold uppercase tracking-wider">{item.name}</h3>
                        <span className="text-xl font-bold font-sans text-white shrink-0">R$ {item.price}</span>
                      </div>
                      <p className="text-xs text-dark-300 mb-4 line-clamp-3 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-dark-300 font-medium">
                        <Clock className="w-4 h-4 text-gold" />
                        <span>Duração: {item.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-dark-800">
                      <button
                        onClick={() => openModal('service', item)}
                        className="p-2 rounded-lg bg-dark-800 hover:text-gold transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('service', item.id)}
                        className="p-2 rounded-lg bg-dark-800 hover:text-red-400 hover:bg-red-950/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: EMPLOYEES */}
            {activeTab === 'employees' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl border border-dark-800 overflow-hidden hover:border-gold/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="h-48 w-full relative overflow-hidden bg-dark-900 border-b border-dark-800">
                        <img 
                          src={item.photo || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400'} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-dark-950/80 backdrop-blur-sm border border-gold/20 px-2 py-1 rounded text-xs text-gold flex items-center gap-1 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-gold stroke-gold" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-title font-bold text-lg text-white uppercase tracking-wider">{item.name}</h3>
                          {item.branchName && (
                            <span className="text-[9px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                              {item.branchName.split(' - ')[1] || item.branchName}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gold font-semibold uppercase tracking-widest">{item.role}</span>
                        <p className="text-xs text-dark-300 mt-4 leading-relaxed line-clamp-3 font-medium">{item.bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-800">
                      <button
                        onClick={() => openModal('employee', item)}
                        className="p-2 rounded-lg bg-dark-800 hover:text-gold transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('employee', item.id)}
                        className="p-2 rounded-lg bg-dark-800 hover:text-red-400 hover:bg-red-950/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: TESTIMONIALS */}
            {activeTab === 'testimonials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl border border-dark-800 p-6 flex flex-col justify-between hover:border-gold/30 transition-all">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        <div className="flex gap-0.5 text-gold">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-gold" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-dark-300 italic leading-relaxed font-medium">"{item.text}"</p>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-800">
                      <span className="text-[10px] text-dark-300 uppercase font-semibold">{item.date}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('testimonial', item)}
                          className="p-2 rounded-lg bg-dark-800 hover:text-gold transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('testimonial', item.id)}
                          className="p-2 rounded-lg bg-dark-800 hover:text-red-400 hover:bg-red-950/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {gallery.map((item) => (
                  <div key={item.id} className="glass-card rounded-xl border border-dark-800 overflow-hidden hover:border-gold/30 transition-all flex flex-col justify-between">
                    <div className="h-48 w-full bg-dark-900 overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-3 left-3 bg-dark-950/80 backdrop-blur-sm border border-gold/10 px-2 py-0.5 rounded text-[10px] text-gold uppercase tracking-wider font-semibold">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-dark-800">
                      <span className="text-xs font-semibold truncate max-w-[150px]">{item.title}</span>
                      <button
                        onClick={() => handleDeleteItem('gallery', item.id)}
                        className="p-1.5 rounded bg-dark-800 text-dark-500 hover:text-red-400 hover:bg-red-950/20 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="glass-card rounded-xl border border-dark-800 p-6 max-w-3xl">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">WhatsApp da Barbearia</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                          type="text"
                          placeholder="5516994206778"
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-dark-400 mt-1 font-medium">Código do país + DDD + Número (apenas números)</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">E-mail de Contato</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                          type="email"
                          placeholder="contato@barbeariaflores.com"
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">Endereço Físico</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="text"
                        placeholder="Av. Paulista, 1000 - São Paulo"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">Horário de Funcionamento</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                      <input
                        type="text"
                        placeholder="Seg a Sex: 09h às 21h | Sáb: 09h às 19h"
                        value={settings.openingHours}
                        onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">Modelo de Mensagem do WhatsApp</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-dark-400" />
                      <textarea
                        rows="3"
                        placeholder="Insira o texto base de confirmação..."
                        value={settings.whatsappMessageTemplate}
                        onChange={(e) => setSettings({ ...settings, whatsappMessageTemplate: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm font-sans"
                        required
                      ></textarea>
                    </div>
                    <p className="text-[10px] text-dark-400 mt-1 font-medium">
                      Variáveis permitidas: <code className="text-gold">{`{data}`}</code>, <code className="text-gold">{`{hora}`}</code>, <code className="text-gold">{`{barbeiro}`}</code>, <code className="text-gold">{`{servico}`}</code>, <code className="text-gold">{`{unidade}`}</code>.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-dark-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gold uppercase tracking-wider">Gestão de Unidades</h3>
                        <p className="text-dark-400 text-xs mt-0.5 font-medium">Cadastre e gerencie as filiais físicas da barbearia</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBranch}
                        className="btn-outline px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 font-bold uppercase tracking-wider"
                      >
                        <Plus className="w-4 h-4 text-gold" />
                        Adicionar Unidade
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {(settings.branches || []).map((branch, index) => (
                        <div key={branch.id || index} className="p-5 bg-dark-900/60 border border-dark-800 rounded-xl space-y-4 relative">
                          <div className="flex justify-between items-center pb-3 border-b border-dark-800">
                            <span className="text-xs font-bold text-gold uppercase tracking-wider">Unidade #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBranch(index)}
                              className="p-1.5 rounded-lg bg-dark-950 text-dark-400 hover:text-red-400 hover:bg-red-950/20 transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remover
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-widest mb-1.5">Nome da Unidade</label>
                              <input
                                type="text"
                                placeholder="Ex: Unidade Jardins"
                                value={branch.name}
                                onChange={(e) => handleUpdateBranchField(index, 'name', e.target.value)}
                                className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-xs"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-widest mb-1.5">WhatsApp de Agendamento</label>
                              <input
                                type="text"
                                placeholder="Ex: 5516994206778"
                                value={branch.phone}
                                onChange={(e) => handleUpdateBranchField(index, 'phone', e.target.value)}
                                className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-xs"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-widest mb-1.5">Endereço</label>
                              <input
                                type="text"
                                placeholder="Ex: Alameda Lorena, 1500 - Jardins"
                                value={branch.address}
                                onChange={(e) => handleUpdateBranchField(index, 'address', e.target.value)}
                                className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-xs placeholder-dark-400/80 transition-colors"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-widest mb-1.5">Horário de Funcionamento</label>
                              <input
                                type="text"
                                placeholder="Ex: Seg a Sex: 10h às 22h | Sáb: 09h às 20h"
                                value={branch.openingHours}
                                onChange={(e) => handleUpdateBranchField(index, 'openingHours', e.target.value)}
                                className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-xs placeholder-dark-400/80 transition-colors"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-dark-300 uppercase tracking-widest mb-1.5">Google Maps Embed URL (iframe src)</label>
                            <input
                              type="text"
                              placeholder="Ex: https://www.google.com/maps/embed?pb=..."
                              value={branch.googleMapsEmbedUrl}
                              onChange={(e) => handleUpdateBranchField(index, 'googleMapsEmbedUrl', e.target.value)}
                              className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold text-xs font-mono placeholder-dark-400/80 transition-colors"
                              required
                            />
                            <p className="text-[9px] text-dark-400 mt-1 font-medium">Insira apenas o link contido no atributo <code className="text-gold">src="..."</code> do código de incorporar do Google Maps.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dark-800">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="btn-gold px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CRUD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-xl border border-gold/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="text-lg font-bold font-title text-gold uppercase tracking-wider">
                {editingItem ? 'Editar' : 'Novo'} {
                  modalType === 'service' ? 'Serviço' :
                  modalType === 'employee' ? 'Barbeiro' :
                  modalType === 'testimonial' ? 'Depoimento' :
                  'Item da Galeria'
                }
              </h3>
              <button 
                onClick={closeModal} 
                className="p-1 rounded hover:bg-dark-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-dark-400 hover:text-white" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem}>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                
                {/* Form Fields: SERVICE */}
                {modalType === 'service' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Nome do Serviço</label>
                      <input 
                        type="text"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Preço (R$)</label>
                        <input 
                          type="number"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Duração (minutos)</label>
                        <input 
                          type="number"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Descrição</label>
                      <textarea 
                        rows="3"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm font-sans"
                        required
                      ></textarea>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="service-active"
                        checked={serviceForm.active !== false}
                        onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked })}
                        className="w-4 h-4 rounded border-dark-700 text-gold focus:ring-gold accent-gold"
                      />
                      <label htmlFor="service-active" className="text-xs font-semibold text-dark-300 uppercase tracking-widest cursor-pointer select-none">Serviço Ativo (Exibir na tela)</label>
                    </div>
                  </>
                )}

                {/* Form Fields: EMPLOYEE */}
                {modalType === 'employee' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Nome Completo</label>
                      <input 
                        type="text"
                        value={employeeForm.name}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Unidade / Filial</label>
                      <select 
                        value={employeeForm.branchId || 'br1'}
                        onChange={(e) => {
                          const selectedBranch = settings.branches?.find(b => b.id === e.target.value) || { name: 'Barbearia Flores - Benassi' };
                          setEmployeeForm({ 
                            ...employeeForm, 
                            branchId: e.target.value, 
                            branchName: selectedBranch.name 
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm cursor-pointer"
                      >
                        {settings.branches?.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Cargo / Especialidade</label>
                        <input 
                          type="text"
                          placeholder="Mestre Barbeiro"
                          value={employeeForm.role}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Avaliação (1 a 5)</label>
                        <input 
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={employeeForm.rating}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, rating: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Bio / Resumo</label>
                      <textarea 
                        rows="2"
                        value={employeeForm.bio}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, bio: e.target.value })}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm font-sans"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">Foto de Perfil</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-lg bg-dark-900 border border-dark-700 overflow-hidden flex items-center justify-center shrink-0">
                          {uploadPreview || employeeForm.photo ? (
                            <img src={uploadPreview || employeeForm.photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-dark-400" />
                          )}
                        </div>
                        <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-dark-900 border border-dashed border-dark-700 rounded-lg cursor-pointer hover:border-gold transition-colors text-xs text-dark-400 font-semibold gap-1.5">
                          <Upload className="w-4 h-4 text-gold" />
                          <span>Selecionar Imagem (PNG/JPG)</span>
                          <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Form Fields: TESTIMONIAL */}
                {modalType === 'testimonial' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Nome do Cliente</label>
                        <input 
                          type="text"
                          value={testimonialForm.name}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Nota (Estrelas)</label>
                        <select
                          value={testimonialForm.rating}
                          onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm cursor-pointer"
                          required
                        >
                          <option value="5">5 Estrelas</option>
                          <option value="4">4 Estrelas</option>
                          <option value="3">3 Estrelas</option>
                          <option value="2">2 Estrelas</option>
                          <option value="1">1 Estrela</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Texto do Depoimento</label>
                      <textarea 
                        rows="3"
                        value={testimonialForm.text}
                        onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                        className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm font-sans"
                        required
                      ></textarea>
                    </div>
                  </>
                )}

                {/* Form Fields: GALLERY */}
                {modalType === 'gallery' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Título da Imagem</label>
                        <input 
                          type="text"
                          value={galleryForm.title}
                          onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-gold transition-colors text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-1">Categoria</label>
                        <select
                          value={galleryForm.category}
                          onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                          className="w-full px-4 py-2.5 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors text-sm cursor-pointer"
                          required
                        >
                          <option value="Corte">Corte</option>
                          <option value="Barba">Barba</option>
                          <option value="Ambiente">Ambiente</option>
                          <option value="Produtos">Produtos</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-300 uppercase tracking-widest mb-2">Carregar Imagem</label>
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-lg bg-dark-900 border border-dark-700 overflow-hidden flex items-center justify-center shrink-0">
                          {uploadPreview || galleryForm.image ? (
                            <img src={uploadPreview || galleryForm.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Image className="w-8 h-8 text-dark-400" />
                          )}
                        </div>
                        <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-dark-900 border border-dashed border-dark-700 rounded-lg cursor-pointer hover:border-gold transition-colors text-xs text-dark-400 font-semibold gap-1.5">
                          <Upload className="w-4 h-4 text-gold" />
                          <span>Fazer Upload (PNG/JPG)</span>
                          <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </>
                )}

              </div>
              
              {/* Modal Actions */}
              <div className="p-6 border-t border-dark-800 flex justify-end gap-3 bg-dark-900/30">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-lg border border-dark-700 text-xs uppercase font-bold text-dark-400 hover:text-white hover:bg-dark-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-gold px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {actionLoading ? 'Salvando...' : 'Confirmar e Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
