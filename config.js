
require('dotenv').config();

const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    name: "Promob Converter",
    description: "Converta arquivos XML do Promob para Excel",
    url: process.env.NEXT_PUBLIC_APP_URL || process.env.VITE_API_URL || "http://localhost:3000",
  },
  email: {
    from: {
      name: "Promob Converter",
      email: process.env.EMAIL_FROM || "noreply@promobconverter.cloud",
    },
    transport: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
  },
};

module.exports = config; 
