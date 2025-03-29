// utils/auth.ts
export const storeAuthToken = (token: string): void => {
  const authData = {
    token: token,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiration
  };
  localStorage.setItem("auth", JSON.stringify(authData)); // Changed key to "auth" for consistency
};

export const getAuthToken = (): string | null => {
  try {
    const authString = localStorage.getItem("auth");
    console.log('Raw auth data from storage:', authString);
    
    if (!authString) {
      console.log('No auth data found in storage');
      return null;
    }
    
    const authData = JSON.parse(authString);
    console.log('Parsed auth data:', authData);
    
    if (!authData.token) {
      console.log('Token missing in auth data');
      clearAuthToken();
      return null;
    }
    
    if (authData.expiresAt && authData.expiresAt <= Date.now()) {
      console.log('Token expired');
      clearAuthToken();
      return null;
    }
    
    console.log('Returning valid token');
    return authData.token;
  } catch (error) {
    console.error('Error parsing auth data:', error);
    clearAuthToken();
    return null;
  }
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("auth");
  console.log('Auth token cleared');
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  console.log('isAuthenticated check - token exists:', !!token);
  return token !== null;
};