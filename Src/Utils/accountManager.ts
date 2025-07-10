// utils/accountManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCOUNTS_KEY = 'ACCOUNTS_LIST';
const CURRENT_KEY = 'CURRENT_ACCOUNT';

export async function getAccounts() {
  const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getCurrentAccount() {
  const data = await AsyncStorage.getItem(CURRENT_KEY);
  return data ? JSON.parse(data) : null;
}

export async function addAccount(account) {
  let accounts = await getAccounts();
  if (!accounts.find(a => a.userId === account.userId)) {
    accounts.push(account);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify(account));
}

export async function switchAccount(userId) {
  let accounts = await getAccounts();
  const found = accounts.find(a => a.userId === userId);
  if (found) {
    await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify(found));
  }
}
