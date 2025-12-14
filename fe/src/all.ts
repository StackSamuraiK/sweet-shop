// API Configuration
const API_BASE_URL = 'http://localhost:3000'; // Change this to your actual API URL

// Types
interface RegisterUserData {
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterShopData {
  name: string;
  email: string;
  password: string;
  role: 'admin';
}

interface AddSweetData {
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: File;
}

interface UpdateSweetData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  image?: File | string;
}

interface SearchSweetsParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface RestockData {
  quantity: number;
}

interface PurchaseData {
  quantity: number;
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers
const createHeaders = (includeAuth: boolean = false, isFormData: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// ============================================
// USER AUTHENTICATION APIs
// ============================================

/**
 * Register a new user
 * POST /auth/register
 */
export const registerUser = async (data: RegisterUserData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Registration failed');
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }

    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login user
 * POST /auth/login
 */
export const loginUser = async (data: LoginData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Login failed');
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }

    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// ============================================
// SHOP AUTHENTICATION APIs
// ============================================

/**
 * Register a new shop (admin)
 * POST /shop/register
 */
export const registerShop = async (data: RegisterShopData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shop/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Shop registration failed');
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }

    return result;
  } catch (error) {
    console.error('Error registering shop:', error);
    throw error;
  }
};

/**
 * Login shop (admin)
 * POST /shop/login
 */
export const loginShop = async (data: LoginData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/shop/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Shop login failed');
    }

    // Store token in localStorage
    if (result.token) {
      localStorage.setItem('authToken', result.token);
    }

    return result;
  } catch (error) {
    console.error('Error logging in shop:', error);
    throw error;
  }
};

// ============================================
// SWEET MANAGEMENT APIs
// ============================================

/**
 * Add a new sweet (requires auth)
 * POST /sweet/add
 */
export const addSweet = async (data: AddSweetData) => {
  try {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('price', data.price.toString());
    formData.append('quantity', data.quantity.toString());
    formData.append('image', data.image);

    const response = await fetch(`${API_BASE_URL}/sweet/add`, {
      method: 'POST',
      headers: createHeaders(true, true),
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to add sweet');
    }

    return result;
  } catch (error) {
    console.error('Error adding sweet:', error);
    throw error;
  }
};

/**
 * Get all sweets (requires auth)
 * GET /sweet/bulk
 */
export const getAllSweets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sweet/bulk`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch sweets');
    }

    return result.response;
  } catch (error) {
    console.error('Error fetching sweets:', error);
    throw error;
  }
};

/**
 * Search sweets with filters (no auth required)
 * GET /sweet/search
 */
export const searchSweets = async (params: SearchSweetsParams) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.name) queryParams.append('name', params.name);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());

    const response = await fetch(`${API_BASE_URL}/sweet/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to search sweets');
    }

    return result;
  } catch (error) {
    console.error('Error searching sweets:', error);
    throw error;
  }
};

/**
 * Restock a sweet (requires auth + admin)
 * POST /sweet/:id/restock
 */
export const restockSweet = async (sweetId: number, data: RestockData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sweet/${sweetId}/restock`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to restock sweet');
    }

    return result;
  } catch (error) {
    console.error('Error restocking sweet:', error);
    throw error;
  }
};

/**
 * Purchase a sweet (requires auth)
 * POST /sweet/:id/purchase
 */
export const purchaseSweet = async (sweetId: number, data: PurchaseData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sweet/${sweetId}/purchase`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to purchase sweet');
    }

    return result;
  } catch (error) {
    console.error('Error purchasing sweet:', error);
    throw error;
  }
};

/**
 * Update a sweet (requires auth)
 * PUT /sweet/update/:id
 */
export const updateSweet = async (sweetId: number, data: UpdateSweetData) => {
  try {
    const formData = new FormData();
    
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.price !== undefined) formData.append('price', data.price.toString());
    if (data.quantity !== undefined) formData.append('quantity', data.quantity.toString());
    
    if (data.image instanceof File) {
      formData.append('image', data.image);
    } else if (typeof data.image === 'string') {
      formData.append('image', data.image);
    }

    const response = await fetch(`${API_BASE_URL}/sweet/update/${sweetId}`, {
      method: 'PUT',
      headers: createHeaders(true, true),
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update sweet');
    }

    return result;
  } catch (error) {
    console.error('Error updating sweet:', error);
    throw error;
  }
};

/**
 * Delete a sweet (requires auth)
 * DELETE /sweet/delete/:id
 */
export const deleteSweet = async (sweetId: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sweet/delete/${sweetId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete sweet');
    }

    return result;
  } catch (error) {
    console.error('Error deleting sweet:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Logout user/shop (clear token)
 */
export const logout = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Get stored auth token
 */
export const getStoredToken = (): string | null => {
  return getAuthToken();
};