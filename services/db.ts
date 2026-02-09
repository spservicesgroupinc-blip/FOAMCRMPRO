import { neon } from '@neondatabase/serverless';

// In a real app, this should be an API endpoint to avoid exposing credentials.
// For this demo/prototype, we use the direct connection string from env.
const connectionString = import.meta.env.VITE_DATABASE_URL;

if (!connectionString) {
    console.error("Missing VITE_DATABASE_URL");
}

export const sql = neon(connectionString);

/**
 * Helper to ensure we have a valid user ID for operations.
 * For now, this returns the first user found or creates a default one.
 */
export const getActiveUserId = async (): Promise<string | null> => {
    try {
        const users = await sql`SELECT id FROM users LIMIT 1`;
        if (users.length > 0) {
            return users[0].id;
        }
        // Create default user if none exists
        const newUser = await sql`
            INSERT INTO users (username, password_hash, company_name)
            VALUES ('demo_user', 'hash_placeholder', 'Demo Company')
            RETURNING id
        `;
        return newUser[0].id;
    } catch (e) {
        console.error("Error getting active user:", e);
        return null;
    }
};
