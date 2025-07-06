/**
 * Standardized fetch function for use with SWR
 * This makes error handling consistent across the app
 */
export const fetcher = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options);
    
    // First check if the response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error: any = new Error(errorData.message || 'An error occurred while fetching the data.');
      error.status = response.status;
      error.info = errorData;
      throw error;
    }
    
    // For empty responses (like 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }
    
    return response.json();
  } catch (error: any) {
    if (!error.status) {
      error.status = 500;
      error.info = { message: error.message || 'Network error occurred' };
    }
    throw error;
  }
};

/**
 * POST request fetcher for use with SWR's mutate
 */
export const postFetcher = async <T = any>(url: string, data: any): Promise<T> => {
  return fetcher<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

/**
 * Utility to get the full URL for API requests
 */
export const getApiUrl = (path: string): string => {
  // In client-side code, use the current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api${path.startsWith('/') ? path : `/${path}`}`;
  }
  
  // In server-side code, use the environment variable or fallback
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Helper for consistent SWR error handling
 */
export const extractSWRError = (error: any): { message: string; status?: number } => {
  if (!error) {
    return { message: 'An unknown error occurred' };
  }
  
  return {
    message: error.info?.message || error.message || 'An unknown error occurred',
    status: error.status || 500,
  };
}; 