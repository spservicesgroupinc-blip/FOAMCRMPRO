import { Customer, Estimate, InventoryItem, AppSettings, User } from "../types";
import { DEFAULT_SETTINGS, INITIAL_INVENTORY } from "../constants";

const KEYS = {
  USER: 'spf_user',
  CUSTOMERS: 'spf_customers',
  ESTIMATES: 'spf_estimates',
  INVENTORY: 'spf_inventory',
  SETTINGS: 'spf_settings'
};

// --- Auth ---
export const getUser = (): User | null => {
  const data = localStorage.getItem(KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const loginUser = (username: string, company: string): User => {
  const user: User = { username, company, isAuthenticated: true };
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  return user;
};

export const logoutUser = (): void => {
  localStorage.removeItem(KEYS.USER);
};

// --- Customers ---
export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(KEYS.CUSTOMERS);
  return data ? JSON.parse(data) : [];
};

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
};

// --- Estimates ---
export const getEstimates = (): Estimate[] => {
  const data = localStorage.getItem(KEYS.ESTIMATES);
  return data ? JSON.parse(data) : [];
};

export const saveEstimate = (estimate: Estimate): void => {
  const estimates = getEstimates();
  const index = estimates.findIndex(e => e.id === estimate.id);
  if (index >= 0) {
    estimates[index] = estimate;
  } else {
    estimates.push(estimate);
  }
  localStorage.setItem(KEYS.ESTIMATES, JSON.stringify(estimates));
};

// --- Inventory ---
export const getInventory = (): InventoryItem[] => {
  const data = localStorage.getItem(KEYS.INVENTORY);
  if (!data) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
    return INITIAL_INVENTORY;
  }
  return JSON.parse(data);
};

export const saveInventoryItem = (item: InventoryItem): void => {
  const items = getInventory();
  const index = items.findIndex(i => i.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
  localStorage.setItem(KEYS.INVENTORY, JSON.stringify(items));
};

// --- Settings ---
export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(KEYS.SETTINGS);
  if (!data) {
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(data);
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

// --- Data Management ---
export const exportData = () => {
  const data = {
    customers: getCustomers(),
    estimates: getEstimates(),
    inventory: getInventory(),
    settings: getSettings(),
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

export const importData = (jsonContent: string) => {
  try {
    const data = JSON.parse(jsonContent);
    if (data.customers) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(data.customers));
    if (data.estimates) localStorage.setItem(KEYS.ESTIMATES, JSON.stringify(data.estimates));
    if (data.inventory) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(data.inventory));
    if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};

export const clearData = () => {
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.ESTIMATES);
  localStorage.removeItem(KEYS.INVENTORY);
  // We keep settings and user
};

// --- Mock PDF Generator ---
export const generatePDF = (estimate: Estimate, customer?: Customer, settings?: AppSettings) => {
  console.log("Generating PDF for", estimate.id);
  alert(`PDF Generation Simulation:\n\nEstimate #${estimate.number}\nCustomer: ${customer?.name || 'Unknown'}\nTotal: $${estimate.total.toFixed(2)}\n\n(In a real app, this downloads a PDF file)`);
};