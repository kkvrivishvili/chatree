/** @type {import('next').NextConfig} */
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env en la raíz del proyecto
const rootEnvPath = path.resolve(process.cwd(), '../.env');
dotenv.config({ path: rootEnvPath });

// También cargar el .env local si existe (para desarrollo)
dotenv.config();

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  output: 'standalone',
  
  // Configuración para cargar variables de entorno desde la raíz
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    // Otras variables que necesite el frontend
  },
};

module.exports = nextConfig;
