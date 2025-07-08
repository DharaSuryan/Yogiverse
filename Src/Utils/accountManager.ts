import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCOUNTS_KEY = 'accounts';
export const ACTIVE_ACCOUNT_KEY = 'activeAccount';

export interface Account {
  username: string;
  token: string;
  profileImage?: string;
  [key: string]: any;
}

export const getAccounts = async (): Promise<Account[]> => {
  const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getActiveAccount = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(ACTIVE_ACCOUNT_KEY);
};

export const saveAccount = async (account: Account): Promise<void> => {
  let accounts = await getAccounts();
  accounts = accounts.filter((a: Account) => a.username !== account.username);
  accounts.push(account);
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  await AsyncStorage.setItem(ACTIVE_ACCOUNT_KEY, account.username);
};

export const switchAccount = async (username: string): Promise<void> => {
  await AsyncStorage.setItem(ACTIVE_ACCOUNT_KEY, username);
};

export const removeAccount = async (username: string): Promise<void> => {
  let accounts = await getAccounts();
  accounts = accounts.filter((a: Account) => a.username !== username);
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  const active = await getActiveAccount();
  if (active === username && accounts.length > 0) {
    await switchAccount(accounts[0].username);
  } else if (accounts.length === 0) {
    await AsyncStorage.removeItem(ACTIVE_ACCOUNT_KEY);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  const accounts = await getAccounts();
  const active = await getActiveAccount();
  const acc = accounts.find((a: Account) => a.username === active);
  return acc ? acc.token : null;
}; 