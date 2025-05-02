import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Edit2, Trash, Download, BookOpen, PenTool, SpellCheck, MessageCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface ResourceItemProps {
  id: number;
  tipo: string;
  titulo: string;
  createdAt: string;
  onDelete: (id: number) => void;
  onDownload: (id: number) => void;
}

const ResourceItem: React.FC<ResourceItemProps> = ({
  id,
  tipo,
  titulo,
  createdAt,
  onDelete,
  onDownload
}) => {
  // Seleccionar el icono según el tipo
  const getIcon = () => {
    switch (tipo) {
      case 'comprension':
        return <BookOpen size={20} className="text-blue-600" />;
      case 'escritura':
        return <PenTool size={20} className="text-green-600" />;
      case 'gramatica':
        return <SpellCheck size={20} className="text-orange-600" />;
      case 'oral':
        return <MessageCircle size={20} className="text-violet-600" />;
      default:
        return <BookOpen size={20} className="text-blue-600" />;
    }
  };
  
  // Obtener el color de la etiqueta según el tipo
  const getBadgeColor = () => {
    switch (tipo) {
      case 'comprension':
        return 'bg-blue-100 text-blue-800';
      case 'escritura':
        return 'bg-green-100 text-green-800';
      case 'gramatica':
        return 'bg-orange-100 text-orange-800';
      case 'oral':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Obtener el nombre del tipo
  const getTipoNombre = () => {
    switch (tipo) {
      case 'comprension':
        return 'Comprensión lectora';
      case 'escritura':
        return 'Producción escrita';
      case 'gramatica':
        return 'Gramática y ortografía';
      case 'oral':
        return 'Comunicación oral';
      default:
        return tipo;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border shadow-sm p-4 mb-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-start mb-3 sm:mb-0">
          <div className="p-2 rounded-full bg-gray-100 mr-3">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">{titulo}</h3>
            <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs ${getBadgeColor()}`}>
                {getTipoNombre()}
              </span>
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link 
            to={`/recursos/${id}`}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar"
          >
            <Edit2 size={18} />
          </Link>
          
          <button
            onClick={() => onDownload(id)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            title="Descargar PDF"
          >
            <Download size={18} />
          </button>
          
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Eliminar"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceItem;