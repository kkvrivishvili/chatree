import { createSupabaseServerClient } from './server-client';
import fs from 'fs';
import path from 'path';

/**
 * Inicializa la base de datos local de Supabase
 * Ejecuta las migraciones y semillas necesarias
 */
export async function initializeDatabase() {
  console.log('Inicializando base de datos local de Supabase...');
  
  try {
    const supabase = createSupabaseServerClient();
    
    // Verificar la conexión
    const { data, error } = await supabase.from('profiles').select('count()', { count: 'exact' });
    
    if (error) {
      throw new Error(`Error al conectar con Supabase: ${error.message}`);
    }
    
    console.log(`Conexión exitosa. Perfiles en la base de datos: ${data[0].count}`);
    
    // Aquí podrías ejecutar migraciones o semillas adicionales si es necesario
    // Por ejemplo, cargar el seed.sql si la base de datos está vacía
    
    return { success: true };
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return { success: false, error };
  }
}

/**
 * Ejecuta un archivo SQL en la base de datos
 * @param filePath Ruta al archivo SQL
 */
export async function executeSqlFile(filePath: string) {
  try {
    const supabase = createSupabaseServerClient();
    const sql = fs.readFileSync(path.resolve(filePath), 'utf8');
    
    // Dividir el archivo en declaraciones individuales
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        throw new Error(`Error al ejecutar SQL: ${error.message}`);
      }
    }
    
    console.log(`Archivo SQL ejecutado correctamente: ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error(`Error al ejecutar archivo SQL ${filePath}:`, error);
    return { success: false, error };
  }
}
