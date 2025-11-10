import mysql, { Pool } from 'mysql2/promise';

// Configuración de la conexión (usa variables de entorno de .env)
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'CACEI_ADMISION_DB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Ejecuta una consulta a la base de datos.
 * @param sql La consulta SQL a ejecutar.
 * @param values Los valores a sanitizar en la consulta.
 */
export const query = async <T>(sql: string, values?: any[]): Promise<T[]> => {
    try {
        const [rows] = await pool.execute(sql, values);
        return rows as T[];
    } catch (error) {
        console.error('Error en la consulta a la DB:', error);
        throw new Error('Database query failed');
    }
};