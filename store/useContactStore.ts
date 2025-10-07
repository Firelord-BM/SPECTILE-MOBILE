import { getCurrentLocation, LocationData } from '@/utils/location';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';

// Generate UUID using expo-crypto
const generateUUID = () => {
  return Crypto.randomUUID();
};

export interface Contact {
  id: string;
  syncId: string;
  name: string;
  phone: string;
  email?: string;
  stage: 'Lead' | 'Qualified Lead' | 'Customer';
  location: LocationData;
  lastVisitLocation?: LocationData;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  synced: boolean;
}

interface ContactStore {
  contacts: Contact[];
  loading: boolean;
  loadContacts: () => Promise<void>;
  addContact: (data: Partial<Contact>) => Promise<Contact>;
  updateContact: (syncId: string, updates: Partial<Contact>) => Promise<void>;
  getContactById: (syncId: string) => Contact | undefined;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  loading: false,

  loadContacts: async () => {
    set({ loading: true });
    try {
      // Mock data for now
      set({ 
        contacts: [
          {
            id: '1',
            syncId: generateUUID(),
            name: 'Acme Corp',
            phone: '+254712345678',
            email: 'contact@acme.co.ke',
            stage: 'Lead',
            lastActivity: '2 days ago',
            location: {
              latitude: -1.2921,
              longitude: 36.8219,
              timestamp: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            synced: false,
          },
          {
            id: '2',
            syncId: generateUUID(),
            name: 'Tech Solutions Ltd',
            phone: '+254723456789',
            email: 'info@techsol.co.ke',
            stage: 'Customer',
            lastActivity: '1 week ago',
            location: {
              latitude: -1.2865,
              longitude: 36.8174,
              timestamp: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            synced: false,
          }
        ],
        loading: false 
      });
    } catch (error) {
      console.error('Error loading contacts:', error);
      set({ loading: false });
    }
  },

  addContact: async (contactData) => {
    try {
      const location = await getCurrentLocation();
      
      const newContact: Contact = {
        id: Date.now().toString(),
        syncId: generateUUID(),
        name: contactData.name || '',
        phone: contactData.phone || '',
        email: contactData.email,
        stage: contactData.stage || 'Lead',
        location,
        lastActivity: 'Just now',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        synced: false,
      };
      
      set(state => ({
        contacts: [newContact, ...state.contacts]
      }));
      
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  updateContact: async (syncId, updates) => {
    try {
      const location = await getCurrentLocation();
      
      set(state => ({
        contacts: state.contacts.map(c => 
          c.syncId === syncId 
            ? { 
                ...c, 
                ...updates, 
                lastVisitLocation: location,
                updatedAt: new Date().toISOString(),
                synced: false 
              } 
            : c
        )
      }));
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  getContactById: (syncId) => {
    return get().contacts.find(c => c.syncId === syncId);
  },
}));