import { create } from 'zustand';

export interface UserPersonalProfile {
  fullName: string;
  email: string;
  phone: string;
  dob: string; // YYYY-MM-DD
  aadhaarNumber: string;
  panNumber: string;
  familyIncome: string;
  address: string;
  education: string;
  employmentStatus: string;
}

export const DEFAULT_USER_PROFILE: UserPersonalProfile = {
  fullName: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  phone: '9876543210',
  dob: '1998-05-15',
  aadhaarNumber: '1234 5678 9012',
  panNumber: 'ABCDE1234F',
  familyIncome: '2,50,000',
  address: '123 MG Road, Sector 4, New Delhi',
  education: 'Bachelor of Technology (Computer Science)',
  employmentStatus: 'Student',
};

interface UserProfileState {
  profile: UserPersonalProfile;
  loadProfile: () => Promise<void>;
  saveProfile: (partial: Partial<UserPersonalProfile>) => Promise<void>;
}

export const useUserProfileStore = create<UserProfileState>((set, get) => ({
  profile: DEFAULT_USER_PROFILE,

  loadProfile: async () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['sahayak_user_profile'], (result) => {
        if (result.sahayak_user_profile) {
          set({ profile: { ...DEFAULT_USER_PROFILE, ...result.sahayak_user_profile } });
        }
      });
    }
  },

  saveProfile: async (partial) => {
    const updated = { ...get().profile, ...partial };
    set({ profile: updated });
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ sahayak_user_profile: updated });
    }
  },
}));
