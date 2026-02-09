import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Starting migration...');

    try {
        // 1. Users Table (Simple Auth for now)
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        company_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Checked/Created users table');

        // 2. Customers Table
        await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        name TEXT NOT NULL,
        company_name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Checked/Created customers table');

        // 3. Estimates Table
        await sql`
      CREATE TABLE IF NOT EXISTS estimates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        customer_id UUID REFERENCES customers(id),
        number TEXT NOT NULL,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        status TEXT NOT NULL,
        job_name TEXT,
        job_address TEXT,
        location JSONB,
        images JSONB,
        calc_data JSONB NOT NULL,
        total_board_feet_open NUMERIC,
        total_board_feet_closed NUMERIC,
        sets_required_open NUMERIC,
        sets_required_closed NUMERIC,
        items JSONB NOT NULL,
        subtotal NUMERIC NOT NULL,
        tax NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Checked/Created estimates table');

        // 4. Inventory Table
        await sql`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity NUMERIC NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        min_level NUMERIC DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Checked/Created inventory table');

        // 5. Settings Table
        await sql`
      CREATE TABLE IF NOT EXISTS settings (
        user_id UUID PRIMARY KEY REFERENCES users(id),
        company_details JSONB,
        pricing_config JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        console.log('Checked/Created settings table');

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

main();
