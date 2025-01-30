import { Timestamp } from 'firebase-admin/firestore';

export interface UserProfile {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User's email
  createdAt: Timestamp;           // Account creation date
  lastUpdated: Timestamp;         // Last profile update
  onboardingCompleted: boolean;   // Onboarding status

  // Company Information
  companyDetails: {
    name: string;
    industry: string;
    size: string;                 // e.g., "50-200"
    location: string;             // City in Germany
    existingAIInitiatives: string[];
  };

  // Personal Information
  managerProfile: {
    role: string;                 // e.g., "CEO", "CTO"
    decisionStyle: string;        // e.g., "data-driven", "intuitive"
    aiExperience: string;         // e.g., "beginner", "intermediate"
    communicationPreference: string; // e.g., "detailed", "concise"
  };

  // Strategic Focus
  strategicGoals: string[];       // Array of primary goals
  businessChallenges: string[];   // Array of key challenges

  // Output Preferences
  outputPreferences: {
    preferredFormats: string[];   // e.g., ["PDF", "Excel"]
    reportingFrequency: string;   // e.g., "weekly"
    languagePreference: string;   // "de" or "en"
  };

  // GDPR & Consent
  dataConsent: {
    marketingConsent: boolean;
    analyticsConsent: boolean;
    lastConsentUpdate: Timestamp;
  };
}