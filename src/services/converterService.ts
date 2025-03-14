
import axios from 'axios';

// Definir a URL base da API
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sua-api-de-producao.com/api' 
  : 'http://localhost:5000/api';

// Configurar headers de autorização para requisições autenticadas
const authHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Converter XML para Excel
export const convertXmlToExcel = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('xmlFile', file);

  try {
    const response = await axios.post(`${API_URL}/converter/xml-to-excel`, formData, {
      headers: {
        ...authHeader(),
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.data.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const errorData = JSON.parse(reader.result as string);
          throw new Error(errorData.message || 'Erro ao converter arquivo');
        };
        reader.readAsText(error.response.data);
      } else {
        throw new Error('Erro ao converter arquivo');
      }
    }
    throw new Error('Erro ao conectar ao servidor');
  }
};

// Converter XML string para Excel
export const convertXmlStringToExcel = async (xmlContent: string, filename: string): Promise<Blob> => {
  try {
    const response = await axios.post(`${API_URL}/converter/xml-to-excel`, 
      { xmlContent, filename },
      {
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      // Tentar ler o erro como JSON
      if (error.response.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Erro ao converter conteúdo XML');
        } catch (e) {
          throw new Error('Erro ao converter conteúdo XML');
        }
      } else if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw new Error('Erro ao conectar ao servidor');
  }
};

// Obter histórico de conversões
export const getConversionHistory = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/converter/history`, {
      headers: authHeader()
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao obter histórico de conversões:', error);
    return [];
  }
};

// Excluir uma conversão
export const deleteConversion = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/converter/${id}`, {
      headers: authHeader()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao excluir conversão:', error);
    return false;
  }
};

// Verificar créditos do usuário
export const checkCredits = async (): Promise<number> => {
  try {
    const response = await axios.get(`${API_URL}/credits`, {
      headers: authHeader()
    });
    
    return response.data.credits;
  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return 0;
  }
};
