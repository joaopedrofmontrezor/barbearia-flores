import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Edit3, Trash2 } from 'lucide-react';

/**
 * ServiceCard - Componente de exibição de serviço com estilo premium da Barbearia Flores.
 * 
 * @param {Object} props
 * @param {Object} props.service - Objeto contendo dados do serviço (name, price, description, duration, etc)
 * @param {Function} [props.onBook] - Callback executado ao clicar no botão de agendamento (modo público)
 * @param {Function} [props.onEdit] - Callback de edição para painel administrativo
 * @param {Function} [props.onDelete] - Callback de exclusão para painel administrativo
 * @param {Boolean} [props.isAdmin=false] - Define se exibe controles administrativos ou de agendamento público
 */
const ServiceCard = ({ service, onBook, onEdit, onDelete, isAdmin = false }) => {
  const { name, price, description, duration, active } = service;

  // Formata o preço do serviço para o padrão monetário BRL (Real)
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, cubicBezier: [0.16, 1, 0.3, 1] }}
      className={`glass-card rounded-xl p-8 border border-dark-800 flex flex-col justify-between glass-card-hover group relative overflow-hidden h-full ${
        !active ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Detalhe Premium: Linha superior dourada brilhante visível no hover */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      <div>
        {/* Cabeçalho do Card: Nome e Preço */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h3 className="font-title font-bold text-lg text-white group-hover:text-gold transition-colors uppercase tracking-wider leading-relaxed">
            {name}
          </h3>
          <span className="text-xl font-bold font-sans text-gold-gradient shrink-0">
            {formattedPrice}
          </span>
        </div>

        {/* Descrição do serviço */}
        <p className="text-xs text-dark-500 leading-relaxed font-light mb-6 min-h-[50px] line-clamp-3 group-hover:text-dark-400 transition-colors">
          {description || "Serviço exclusivo de beleza e estética masculina executado com excelência."}
        </p>
      </div>

      {/* Rodapé do Card: Duração e Ações */}
      <div className="flex items-center justify-between pt-5 border-t border-dark-950">
        <div className="flex items-center gap-2 text-xs text-dark-500 font-semibold group-hover:text-dark-400 transition-colors">
          <Clock className="w-4 h-4 text-gold/70" />
          <span>{duration || 30} min</span>
        </div>

        {isAdmin ? (
          // Controles do Painel Administrativo
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(service)}
                className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-500 hover:text-gold hover:border-gold/30 transition-all cursor-pointer"
                title="Editar serviço"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(service.id)}
                className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-500 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/30 transition-all cursor-pointer"
                title="Excluir serviço"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          // Ação para o Usuário Final (Agendamento)
          onBook && (
            <button
              onClick={() => onBook(service)}
              className="text-xs font-bold text-gold group-hover:text-gold-light flex items-center gap-1.5 uppercase tracking-widest transition-all cursor-pointer hover:underline"
            >
              Agendar
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )
        )}
      </div>
    </motion.div>
  );
};

export default ServiceCard;
