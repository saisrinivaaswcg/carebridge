import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "carebridge_access_token";
const USER_KEY = "carebridge_user";

export async function saveToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveUser(user) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getUser() {
  const user = await AsyncStorage.getItem(USER_KEY);

  if (!user) return null;

  return JSON.parse(user);
}

export async function logout() {
  await AsyncStorage.multiRemove([
    TOKEN_KEY,
    USER_KEY,
  ]);
}