import { User, UserData, Wallet, Transaction } from '../types';
import { INITIAL_WALLETS, INITIAL_TRANSACTIONS } from '../constants';

const USERS_KEY = 'kapital_users';
const DATA_PREFIX = 'kapital_data_';
const SESSION_KEY = 'kapital_session_user';

// --- Auth Methods ---

export const getSessionUser = (): User | null => {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const loginUser = (email: string, password: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const { password: _, ...safeUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
};

export const loginWithGoogleMock = (): User => {
    // Simulacion de usuario de Google
    const googleUser: User = {
        id: 'g_user_12345',
        name: 'Usuario Google',
        email: 'usuario@gmail.com',
        photoURL: 'https://ui-avatars.com/api/?name=Google+User&background=10b981&color=fff',
        provider: 'google',
        hasSeenTutorial: false
    };

    // Check if exists, if not register
    const usersStr = localStorage.getItem(USERS_KEY);
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const existing = users.find(u => u.email === googleUser.email);

    if (!existing) {
        users.push(googleUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        
        // Init data
        const initialWallet: Wallet = {
            id: 'w1',
            name: 'Principal',
            balance: 0,
            currency: 'EUR',
            color: 'bg-primary-500',
        };
        const initialData: UserData = { wallets: [initialWallet], transactions: [] };
        localStorage.setItem(DATA_PREFIX + googleUser.id, JSON.stringify(initialData));
    } else {
        // If exists, check tutorial status from storage to preserve it
        googleUser.hasSeenTutorial = existing.hasSeenTutorial;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(googleUser));
    return googleUser;
}

export const registerUser = (name: string, email: string, password: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  if (users.some(u => u.email === email)) {
    throw new Error('El usuario ya existe');
  }

  const newUser: User = {
    id: 'user_' + Date.now(),
    name,
    email,
    password, // In a real app, never store plain text passwords
    provider: 'email',
    hasSeenTutorial: false
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Initialize default data for new user
  // CHANGED: Start with only ONE wallet and NO transactions
  const initialWallet: Wallet = {
    id: 'w1',
    name: 'Principal',
    balance: 0,
    currency: 'EUR',
    color: 'bg-primary-500',
  };

  const initialData: UserData = {
    wallets: [initialWallet],
    transactions: []
  };
  localStorage.setItem(DATA_PREFIX + newUser.id, JSON.stringify(initialData));

  const { password: _, ...safeUser } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  
  return safeUser;
};

export const updateUser = (updatedUser: User) => {
  // Update session
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

  // Update main user list
  const usersStr = localStorage.getItem(USERS_KEY);
  if (usersStr) {
    const users: User[] = JSON.parse(usersStr);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      // Keep the password from the existing record
      users[index] = { ...users[index], ...updatedUser }; 
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

// --- Data Methods ---

export const loadUserData = (userId: string): UserData => {
  const dataStr = localStorage.getItem(DATA_PREFIX + userId);
  if (!dataStr) {
    return { wallets: [], transactions: [] };
  }
  return JSON.parse(dataStr);
};

export const saveUserData = (userId: string, data: UserData) => {
  localStorage.setItem(DATA_PREFIX + userId, JSON.stringify(data));
};