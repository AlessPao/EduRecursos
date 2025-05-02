import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import { TIPOS_RECURSOS, OPCIONES_FORMULARIO, API_URL } from '../config';
import ResourcePreview from '../components/ResourcePreview';
import { formatTipoRecurso } from '../utils/formatters';
import { Edit, Save, Download, ArrowLeft } from 'lucide-react';

// Tipo para los datos del formulario
interface RecursoFormData {
  titulo: string;
  tipo: string;
  opciones: {
    [key: string]: string | number | boolean;
  };
}

const RecursoForm: React.FC = () => {
  const { tipo, id } = useParams<{ tipo?: string; id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [recurso, setRecurso] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Determinar si estamos editando o creando
  const isCreating = !id;
  
  // Tipo de recurso a generar
  const tipoRecurso = isCreating ? tipo : recurso?.tipo;
  
  // Título basado en la acción y tipo
  const tituloAccion = isCreating
    ? `Generar ${formatTipoRecurso(tipoRecurso || '')}`
    : 'Editar Recurso';
  
  // Buscar la información del tipo de recurso
  const tipoInfo = TIPOS_RECURSOS.find(t => t.id === tipoRecurso);
  
  // Opciones del formulario según el tipo
  const opcionesFormulario = tipoRecurso ? OPCIONES_FORMULARIO[tipoRecurso as keyof typeof OPCIONES_FORMULARIO] : {};
  
  // Configuración de React Hook Form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecursoFormData>();
  
  // Cargar recurso si estamos editando
  useEffect(() => {
    if (id) {
      const fetchRecurso = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${API_URL}/recursos/${id}`);
          if (res.data.success) {
            setRecurso(res.data.recurso);
            
            // Inicializar formulario con datos existentes
            reset({
              titulo: res.data.recurso.titulo,
              tipo: res.data.recurso.tipo,
              opciones: res.data.recurso.meta.opciones
            });
          }
        } catch (error) {
          console.error('Error al cargar el recurso:', error);
          toast.error('No se pudo cargar el recurso');
          navigate('/recursos');
        } finally {
          setLoading(false);
        }
      };
      
      fetchRecurso();
    }
  }, [id, reset, navigate]);
  
  // Manejar envío del formulario
  const onSubmit = async (data: RecursoFormData) => {
    try {
      setGenerando(true);
      
      if (isCreating) {
        // Generar nuevo recurso
        const res = await axios.post(`${API_URL}/recursos`, {
          tipo: tipoRecurso,
          titulo: data.titulo,
          opciones: data.opciones
        });
        
        if (res.data.success) {
          setRecurso(res.data.recurso);
          toast.success('Recurso generado correctamente');
        }
      } else if (isEditing) {
        // Actualizar recurso existente
        const res = await axios.put(`${API_URL}/recursos/${id}`, {
          titulo: data.titulo,
          contenido: recurso.contenido
        });
        
        if (res.data.success) {
          setRecurso(res.data.recurso);
          setIsEditing(false);
          toast.success('Recurso actualizado correctamente');
        }
      }
    } catch (error) {
      console.error('Error al procesar el recurso:', error);
      toast.error('Ocurrió un error al procesar el recurso');
    } finally {
      setGenerando(false);
    }
  };
  
  // Descargar recurso como PDF
  const handleDownload = async () => {
    try {
      if (!id) {
        toast.error('Primero debe guardar el recurso');
        return;
      }
      
      const response = await axios.get(`${API_URL}/recursos/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${recurso.titulo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      toast.error('No se pudo descargar el PDF');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{tituloAccion}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="titulo" className="form-label">
                  Título del recurso
                </label>
                <input
                  id="titulo"
                  type="text"
                  className={`form-input ${errors.titulo ? 'border-red-500' : ''}`}
                  placeholder="Ej: Ficha de lectura - El pequeño zorro"
                  disabled={generando || (!!recurso && !isEditing)}
                  {...register('titulo', { required: 'El título es requerido' })}
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
                )}
              </div>
              
              {isCreating && (
                <>
                  <div className="form-group">
                    <label className="form-label">Tipo de recurso</label>
                    <p className="text-gray-700 py-2">
                      {tipoInfo?.nombre || formatTipoRecurso(tipoRecurso || '')}
                    </p>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4">Opciones específicas</h3>
                  
                  {/* Opciones dinámicas según el tipo de recurso */}
                  {tipoRecurso === 'comprension' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="tipoTexto" className="form-label">
                          Tipo de texto
                        </label>
                        <select
                          id="tipoTexto"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoTexto', { required: true })}
                        >
                          {opcionesFormulario.tipoTexto?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema del texto
                        </label>
                        <input
                          id="tema"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Animales, amistad, la escuela"
                          disabled={generando}
                          {...register('opciones.tema', { required: true })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="longitud" className="form-label">
                          Longitud del texto
                        </label>
                        <select
                          id="longitud"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.longitud', { required: true })}
                        >
                          {opcionesFormulario.longitud?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="form-group">
                          <label htmlFor="numLiteral" className="form-label">
                            Preguntas literales
                          </label>
                          <input
                            id="numLiteral"
                            type="number"
                            min="1"
                            max="5"
                            className="form-input"
                            disabled={generando}
                            {...register('opciones.numLiteral', { 
                              required: true,
                              min: 1,
                              max: 5
                            })}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="numInferencial" className="form-label">
                            Preguntas inferenciales
                          </label>
                          <input
                            id="numInferencial"
                            type="number"
                            min="1"
                            max="5"
                            className="form-input"
                            disabled={generando}
                            {...register('opciones.numInferencial', { 
                              required: true,
                              min: 1,
                              max: 5
                            })}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="numCritica" className="form-label">
                            Preguntas críticas
                          </label>
                          <input
                            id="numCritica"
                            type="number"
                            min="1"
                            max="5"
                            className="form-input"
                            disabled={generando}
                            {...register('opciones.numCritica', { 
                              required: true,
                              min: 1,
                              max: 5
                            })}
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <div className="flex items-center">
                          <input
                            id="vocabulario"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={generando}
                            {...register('opciones.vocabulario')}
                          />
                          <label htmlFor="vocabulario" className="ml-2 block text-sm text-gray-700">
                            Incluir sección de vocabulario
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {tipoRecurso === 'escritura' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="tipoTexto" className="form-label">
                          Tipo de texto
                        </label>
                        <select
                          id="tipoTexto"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoTexto', { required: true })}
                        >
                          {opcionesFormulario.tipoTexto?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema o situación comunicativa
                        </label>
                        <input
                          id="tema"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Mi mascota favorita, un día en el parque"
                          disabled={generando}
                          {...register('opciones.tema', { required: true })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="nivelAyuda" className="form-label">
                          Nivel de ayuda
                        </label>
                        <select
                          id="nivelAyuda"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.nivelAyuda', { required: true })}
                        >
                          {opcionesFormulario.nivelAyuda?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <div className="flex items-center">
                          <input
                            id="conectores"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            disabled={generando}
                            {...register('opciones.conectores')}
                          />
                          <label htmlFor="conectores" className="ml-2 block text-sm text-gray-700">
                            Incluir banco de conectores
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {tipoRecurso === 'gramatica' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="aspecto" className="form-label">
                          Aspecto a trabajar
                        </label>
                        <select
                          id="aspecto"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.aspecto', { required: true })}
                        >
                          {opcionesFormulario.aspecto?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tipoEjercicio" className="form-label">
                          Tipo de ejercicio
                        </label>
                        <select
                          id="tipoEjercicio"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.tipoEjercicio', { required: true })}
                        >
                          {opcionesFormulario.tipoEjercicio?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="numItems" className="form-label">
                          Número de ítems
                        </label>
                        <input
                          id="numItems"
                          type="number"
                          min="5"
                          max="15"
                          className="form-input"
                          disabled={generando}
                          {...register('opciones.numItems', { 
                            required: true,
                            min: 5,
                            max: 15
                          })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="contexto" className="form-label">
                          Contexto o tema
                        </label>
                        <input
                          id="contexto"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Animales, juegos, familia"
                          disabled={generando}
                          {...register('opciones.contexto', { required: true })}
                        />
                      </div>
                    </>
                  )}
                  
                  {tipoRecurso === 'oral' && (
                    <>
                      <div className="form-group">
                        <label htmlFor="formato" className="form-label">
                          Formato de la actividad
                        </label>
                        <select
                          id="formato"
                          className="form-select"
                          disabled={generando}
                          {...register('opciones.formato', { required: true })}
                        >
                          {opcionesFormulario.formato?.map((opcion: string) => (
                            <option key={opcion} value={opcion}>
                              {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tema" className="form-label">
                          Tema o situación comunicativa
                        </label>
                        <input
                          id="tema"
                          type="text"
                          className="form-input"
                          placeholder="Ej: Mi familia, mis juguetes favoritos"
                          disabled={generando}
                          {...register('opciones.tema', { required: true })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="instrucciones" className="form-label">
                          Instrucciones específicas
                        </label>
                        <textarea
                          id="instrucciones"
                          rows={3}
                          className="form-input"
                          placeholder="Ej: Enfocarse en el uso de adjetivos, practicar descripciones"
                          disabled={generando}
                          {...register('opciones.instrucciones', { required: true })}
                        ></textarea>
                      </div>
                    </>
                  )}
                </>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {isCreating ? (
                  <button
                    type="submit"
                    disabled={generando}
                    className="btn btn-primary"
                  >
                    {generando ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando recurso...
                      </span>
                    ) : (
                      'Generar recurso'
                    )}
                  </button>
                ) : (
                  <>
                    {isEditing ? (
                      <button
                        type="submit"
                        className="btn btn-success"
                      >
                        <Save size={16} className="mr-2" />
                        Guardar cambios
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="btn btn-primary"
                      >
                        <Edit size={16} className="mr-2" />
                        Editar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="btn btn-secondary"
                    >
                      <Download size={16} className="mr-2" />
                      Descargar PDF
                    </button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
        
        {/* Vista previa */}
        <div>
          {recurso ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Vista previa</h2>
              <ResourcePreview
                tipo={recurso.tipo}
                contenido={recurso.contenido}
              />
            </motion.div>
          ) : (
            <div className="bg-gray-50 rounded-lg border p-6 flex items-center justify-center h-96">
              <p className="text-gray-500 text-center">
                {isCreating
                  ? 'Completa el formulario y genera el recurso para ver la vista previa'
                  : 'Cargando recurso...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecursoForm;