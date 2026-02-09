import { Customer, Estimate, InventoryItem, AppSettings, User } from "../types";
import { DEFAULT_SETTINGS, INITIAL_INVENTORY } from "../constants";
import { sql, getActiveUserId } from "./db";

// --- Auth (Simplified for Demo) ---
export const getUser = async (): Promise<User | null> => {
  // In a real app, this would check the session
  try {
    const users = await sql`SELECT username, company_name as company FROM users LIMIT 1`;
    if (users.length > 0) {
      return { username: users[0].username, company: users[0].company, isAuthenticated: true };
    }
    return null;
  } catch (e) {
    console.error("Error fetching user", e);
    return null;
  }
};

export const loginUser = async (username: string, company: string): Promise<User> => {
  // Simple "login" by ensuring the user exists or returning the existing one
  // For this prototype, we just grab the first user or create one matching these details
  const users = await sql`SELECT * FROM users WHERE username = ${username}`;
  if (users.length > 0) {
    return { username: users[0].username, company: users[0].company_name, isAuthenticated: true };
  }

  await sql`
    INSERT INTO users (username, password_hash, company_name)
    VALUES (${username}, 'placeholder', ${company})
  `;
  return { username, company, isAuthenticated: true };
};

export const logoutUser = async (): Promise<void> => {
  // standard auth would handle this
};

// --- Customers ---
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const userId = await getActiveUserId();
    if (!userId) return [];

    // Explicitly mapping fields to match interface if DB column names differ slightly
    // (Here they mostly match, but good practice to be explicit)
    const rows = await sql`
        SELECT id, name, company_name as "companyName", email, phone, address, city, state, zip, notes, created_at as "createdAt"
        FROM customers 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
    `;
    return rows as unknown as Customer[];
  } catch (e) {
    console.error("Error fetching customers", e);
    return [];
  }
};

export const saveCustomer = async (customer: Customer): Promise<void> => {
  const userId = await getActiveUserId();
  if (!userId) return;

  // Check if update or insert
  // We use ON CONFLICT or simple check. Since we generate IDs in frontend sometimes, 
  // we might need to handle the ID generation on backend or consistent UUIDs.
  // The current app uses UUIDs generated likely in frontend or existing types.

  await sql`
    INSERT INTO customers (id, user_id, name, company_name, email, phone, address, city, state, zip, notes)
    VALUES (${customer.id}, ${userId}, ${customer.name}, ${customer.companyName || ''}, ${customer.email}, ${customer.phone}, ${customer.address}, ${customer.city}, ${customer.state}, ${customer.zip}, ${customer.notes})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      company_name = EXCLUDED.company_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      city = EXCLUDED.city,
      state = EXCLUDED.state,
      zip = EXCLUDED.zip,
      notes = EXCLUDED.notes
  `;
};

export const deleteCustomer = async (id: string): Promise<void> => {
  await sql`DELETE FROM customers WHERE id = ${id}`;
};

// --- Estimates ---
export const getEstimates = async (): Promise<Estimate[]> => {
  const userId = await getActiveUserId();
  if (!userId) return [];

  const rows = await sql`
        SELECT 
            id, number, customer_id as "customerId", date, status,
            job_name as "jobName", job_address as "jobAddress", location, images,
            calc_data as "calcData",
            total_board_feet_open as "totalBoardFeetOpen",
            total_board_feet_closed as "totalBoardFeetClosed",
            sets_required_open as "setsRequiredOpen",
            sets_required_closed as "setsRequiredClosed",
            items, subtotal, tax, total, notes
        FROM estimates
        WHERE user_id = ${userId}
        ORDER BY date DESC
    `;
  return rows as unknown as Estimate[];
};

export const saveEstimate = async (estimate: Estimate): Promise<void> => {
  const userId = await getActiveUserId();
  if (!userId) return;

  await sql`
        INSERT INTO estimates (
            id, user_id, customer_id, number, date, status,
            job_name, job_address, location, images,
            calc_data,
            total_board_feet_open, total_board_feet_closed,
            sets_required_open, sets_required_closed,
            items, subtotal, tax, total, notes
        ) VALUES (
            ${estimate.id}, ${userId}, ${estimate.customerId}, ${estimate.number}, ${estimate.date}, ${estimate.status},
            ${estimate.jobName}, ${estimate.jobAddress}, ${estimate.location || null}, ${estimate.images ? JSON.stringify(estimate.images) : null},
            ${estimate.calcData},
            ${estimate.totalBoardFeetOpen}, ${estimate.totalBoardFeetClosed},
            ${estimate.setsRequiredOpen}, ${estimate.setsRequiredClosed},
            ${JSON.stringify(estimate.items)}, ${estimate.subtotal}, ${estimate.tax}, ${estimate.total}, ${estimate.notes}
        )
        ON CONFLICT (id) DO UPDATE SET
            customer_id = EXCLUDED.customer_id,
            status = EXCLUDED.status,
            job_name = EXCLUDED.job_name,
            job_address = EXCLUDED.job_address,
            location = EXCLUDED.location,
            images = EXCLUDED.images,
            calc_data = EXCLUDED.calc_data,
            items = EXCLUDED.items,
            subtotal = EXCLUDED.subtotal,
            tax = EXCLUDED.tax,
            total = EXCLUDED.total,
            notes = EXCLUDED.notes
    `;
};

// --- Inventory ---
export const getInventory = async (): Promise<InventoryItem[]> => {
  const userId = await getActiveUserId();
  if (!userId) return INITIAL_INVENTORY; // Fallback if no user / offline for now

  const rows = await sql`
        SELECT id, name, category, quantity, unit, min_level as "minLevel"
        FROM inventory
        WHERE user_id = ${userId}
    `;

  if (rows.length === 0) {
    // Init default inventory for new user
    for (const item of INITIAL_INVENTORY) {
      await saveInventoryItem(item); // Recursive but safe for small initial set
    }
    return INITIAL_INVENTORY;
  }

  return rows as unknown as InventoryItem[];
};

export const saveInventoryItem = async (item: InventoryItem): Promise<void> => {
  const userId = await getActiveUserId();
  if (!userId) return;

  await sql`
        INSERT INTO inventory (id, user_id, name, category, quantity, unit, min_level)
        VALUES (${item.id}, ${userId}, ${item.name}, ${item.category}, ${item.quantity}, ${item.unit}, ${item.minLevel})
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            category = EXCLUDED.category,
            quantity = EXCLUDED.quantity,
            unit = EXCLUDED.unit,
            min_level = EXCLUDED.min_level,
            updated_at = NOW()
    `;
};

// --- Settings ---
export const getSettings = async (): Promise<AppSettings> => {
  const userId = await getActiveUserId();
  if (!userId) return DEFAULT_SETTINGS;

  const rows = await sql`
        SELECT company_details, pricing_config
        FROM settings
        WHERE user_id = ${userId}
    `;

  if (rows.length === 0) return DEFAULT_SETTINGS;

  const row = rows[0];
  // Merge back into AppSettings flat structure
  return {
    ...DEFAULT_SETTINGS, // defaults
    ...(row.company_details as object),
    ...(row.pricing_config as object)
  };
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  const userId = await getActiveUserId();
  if (!userId) return;

  // Split settings into the two JSON columns
  const company_details = {
    companyName: settings.companyName,
    companyAddress: settings.companyAddress,
    companyPhone: settings.companyPhone,
    companyEmail: settings.companyEmail,
    logoUrl: settings.logoUrl
  };

  const pricing_config = {
    openCellYield: settings.openCellYield,
    closedCellYield: settings.closedCellYield,
    openCellCost: settings.openCellCost,
    closedCellCost: settings.closedCellCost,
    laborRate: settings.laborRate,
    taxRate: settings.taxRate
  };

  await sql`
        INSERT INTO settings (user_id, company_details, pricing_config)
        VALUES (${userId}, ${company_details}, ${pricing_config})
        ON CONFLICT (user_id) DO UPDATE SET
            company_details = EXCLUDED.company_details,
            pricing_config = EXCLUDED.pricing_config,
            updated_at = NOW()
    `;
};

// --- Data Management ---
export const exportData = async () => {
  const userId = await getActiveUserId();
  if (!userId) return;

  const [customers, estimates, inventory, settings] = await Promise.all([
    getCustomers(),
    getEstimates(),
    getInventory(),
    getSettings()
  ]);

  const data = {
    customers,
    estimates,
    inventory,
    settings,
    timestamp: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `spf_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = async (jsonContent: string) => {
  try {
    const data = JSON.parse(jsonContent);
    // Note: This is a simple append/overwrite. In a real app we might want smarter merging.
    if (data.customers) {
      for (const c of data.customers) await saveCustomer(c);
    }
    if (data.estimates) {
      for (const e of data.estimates) await saveEstimate(e);
    }
    if (data.inventory) {
      for (const i of data.inventory) await saveInventoryItem(i);
    }
    if (data.settings) {
      await saveSettings(data.settings);
    }
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const clearData = async () => {
  const userId = await getActiveUserId();
  if (!userId) return;

  // Careful with this!
  await sql`DELETE FROM customers WHERE user_id = ${userId}`;
  await sql`DELETE FROM estimates WHERE user_id = ${userId}`;
  // We might want to keep inventory or settings? The original cleared inventory too.
  await sql`DELETE FROM inventory WHERE user_id = ${userId}`;
};

export const generatePDF = (estimate: Estimate, customer?: Customer, settings?: AppSettings) => {
  console.log("Generating PDF for", estimate.id);
  alert(`PDF Generation Simulation:\n\nEstimate #${estimate.number}\nCustomer: ${customer?.name || 'Unknown'}\nTotal: $${estimate.total.toFixed(2)}\n\n(In a real app, this downloads a PDF file)`);
};
