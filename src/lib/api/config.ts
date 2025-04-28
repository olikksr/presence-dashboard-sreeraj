import { fetchWithCache, handleApiError, ApiResponse, ATTENDANCE_API_BASE_URL, clearApiCacheEntry } from './utils';

// Config types
export interface ConfigData {
  googleMapsApiKey: string;
  office_location: {
    latitude: number;
    longitude: number;
  };
  allowed_radius_km: number;
  attendance_settings: {
    late_buffer_minutes: number;
    allow_manual_time: boolean;
    max_time_adjustment: number;
    require_approval: boolean;
  };
  id?: string;
  created_at?: string;
  last_modified?: string;
  last_modified_by?: string;
  enforce_geofence?: boolean;
}

// Get config data
// Get config data
export const getConfigData = async (companyId: string): Promise<ConfigData> => {
  try {
    const authState = JSON.parse(localStorage.getItem('authState') || '{}');
    const companyId = authState.companyId || '';

    if (!companyId) {
      throw new Error('Company ID is missing in auth state');
    }
    const response = await fetchWithCache<ApiResponse<ConfigData>>(
      `${ATTENDANCE_API_BASE_URL}/api/config`,
      {
        cacheTTL: 60 * 60 * 1000,
        headers: {
          'X-Company-ID': companyId,
        },
      }
    );

    if (!response.data) {
      throw new Error('Invalid response format from config API');
    }

    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch config data');
  }
};



// Update config data
export const updateConfigData = async (configData: Partial<ConfigData>): Promise<ConfigData> => {
  try {
    const authState = JSON.parse(localStorage.getItem('authState') || '{}');
    const companyId = authState.companyId || '';

    if (!companyId) {
      throw new Error('Company ID is missing in auth state');
    }

    // Fetch current config
    const currentConfig = await getConfigData(companyId);

    const updatedConfig = {
      id: companyId,
      companyId: companyId,
      ...currentConfig,
      ...configData,
      last_modified: new Date().toISOString(),
      last_modified_by: "user"
    };

    console.log("Sending updated config to API:", updatedConfig);

    const response = await fetch(`${ATTENDANCE_API_BASE_URL}/api/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Company-ID': companyId,
      },
      body: JSON.stringify(updatedConfig),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Clear correct cache entry after update
    clearApiCacheEntry(`${ATTENDANCE_API_BASE_URL}/api/config`, { 'X-Company-ID': companyId });

    return data.data;
  } catch (error) {
    return handleApiError(error, 'Failed to update config data');
  }
};
