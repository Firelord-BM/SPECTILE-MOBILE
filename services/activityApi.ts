import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.spectile.co.ke/api';

interface LocationDTO {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp?: string;
}

interface ActivityDTO {
  id?: number;
  syncId: string;
  activityType: string;
  businessName: string;
  contactPerson: string;
  email?: string;
  phone?: string;
  notes?: string;
  location?: LocationDTO | null;
  timestamp: string;
  userId?: number;
  userName?: string;
  userFullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

class ActivityApiService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@auth_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    const token = await this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }

    return await response.json();
  }

  // Get all activities (paginated)
  async getAllActivities(page: number = 0, size: number = 20): Promise<PagedResponse<ActivityDTO>> {
    const response = await this.makeRequest<PagedResponse<ActivityDTO>>(
      `/activities?page=${page}&size=${size}`
    );
    return response.data;
  }

  // Get recent activities
  async getRecentActivities(page: number = 0, size: number = 20): Promise<PagedResponse<ActivityDTO>> {
    const response = await this.makeRequest<PagedResponse<ActivityDTO>>(
      `/activities/recent?page=${page}&size=${size}`
    );
    return response.data;
  }

  // Get activity by ID
  async getActivityById(id: number): Promise<ActivityDTO> {
    const response = await this.makeRequest<ActivityDTO>(`/activities/${id}`);
    return response.data;
  }

  // Get activity by sync ID
  async getActivityBySyncId(syncId: string): Promise<ActivityDTO> {
    const response = await this.makeRequest<ActivityDTO>(`/activities/sync/${syncId}`);
    return response.data;
  }

  // Create activity
  async createActivity(activity: Omit<ActivityDTO, 'id' | 'userId' | 'userName' | 'userFullName' | 'createdAt' | 'updatedAt'>): Promise<ActivityDTO> {
    const response = await this.makeRequest<ActivityDTO>(
      '/activities',
      'POST',
      activity
    );
    return response.data;
  }

  // Update activity
  async updateActivity(id: number, activity: Partial<ActivityDTO>): Promise<ActivityDTO> {
    const response = await this.makeRequest<ActivityDTO>(
      `/activities/${id}`,
      'PUT',
      activity
    );
    return response.data;
  }

  // Delete activity
  async deleteActivity(id: number): Promise<void> {
    await this.makeRequest<void>(`/activities/${id}`, 'DELETE');
  }

  // Search activities by business name
  async searchActivities(businessName: string, page: number = 0, size: number = 20): Promise<PagedResponse<ActivityDTO>> {
    const response = await this.makeRequest<PagedResponse<ActivityDTO>>(
      `/activities/search?businessName=${encodeURIComponent(businessName)}&page=${page}&size=${size}`
    );
    return response.data;
  }

  // Get activities by type
  async getActivitiesByType(activityType: string, page: number = 0, size: number = 20): Promise<PagedResponse<ActivityDTO>> {
    const response = await this.makeRequest<PagedResponse<ActivityDTO>>(
      `/activities/type/${encodeURIComponent(activityType)}?page=${page}&size=${size}`
    );
    return response.data;
  }

  // Get user's activities
  async getUserActivities(userId: number): Promise<ActivityDTO[]> {
    const response = await this.makeRequest<ActivityDTO[]>(`/activities/user/${userId}`);
    return response.data;
  }

  // Sync pending activities
  async syncPendingActivities(activities: ActivityDTO[]): Promise<{ synced: number; failed: number }> {
    let synced = 0;
    let failed = 0;

    for (const activity of activities) {
      try {
        // Check if activity already exists on server by syncId
        try {
          await this.getActivityBySyncId(activity.syncId);
          // Activity already exists, skip
          synced++;
          continue;
        } catch (error) {
          // Activity doesn't exist, create it
        }

        await this.createActivity(activity);
        synced++;
      } catch (error) {
        console.error('Failed to sync activity:', error);
        failed++;
      }
    }

    return { synced, failed };
  }
}

export const activityApi = new ActivityApiService();
export type { ActivityDTO, LocationDTO, PagedResponse };

