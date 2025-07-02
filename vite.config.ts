import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno del archivo .env correspondiente al modo
  const env = loadEnv(mode, process.cwd(), ''); // El tercer argumento '' carga todas las variables sin prefijo, si quieres solo las que empiezan con VITE_ pones 'VITE_'

  return {
    define: {
      // Asegúrate de que tus variables de entorno tengan el prefijo VITE_
      // Por ejemplo, en tu archivo .env deberías tener VITE_GEMINI_API_KEY=tu_valor
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
      // Si necesitas acceder a GEMINI_API_KEY sin prefijo, asegúrate de que exista en .env
      // y cárgala explícitamente si no se carga con el prefijo VITE_
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
