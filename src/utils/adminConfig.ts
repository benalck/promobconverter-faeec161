interface AdminConfig {
  username: string;
  password: string;
}

export const getAdminConfig = (): AdminConfig => {
  const config = localStorage.getItem('adminConfig');
  if (config) {
    return JSON.parse(config);
  }
  
  // Configuração padrão
  const defaultConfig: AdminConfig = {
    username: 'admin',
    password: 'admin123'
  };
  
  localStorage.setItem('adminConfig', JSON.stringify(defaultConfig));
  return defaultConfig;
};

export const updateAdminConfig = (newConfig: AdminConfig): void => {
  localStorage.setItem('adminConfig', JSON.stringify(newConfig));
}; 