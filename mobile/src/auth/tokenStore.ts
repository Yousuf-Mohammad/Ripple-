import * as SecureStore from 'expo-secure-store';

/**
 * Secure JWT storage. Uses expo-secure-store (Keychain/Keystore) — never plain
 * AsyncStorage (§9 / DO-NOT).
 */
const TOKEN_KEY = 'ripple.jwt';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
