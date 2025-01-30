import request from 'supertest';
import { app } from '../src/server'; // Import the app
import admin from 'firebase-admin';

describe('Integration Tests', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
  });

  it('should verify Firebase Auth integration', async () => {
    const token = 'valid-firebase-token';
    const decodedToken = { uid: 'test-uid' };

    jest.spyOn(admin.auth(), 'verifyIdToken').mockResolvedValue(decodedToken);

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .query({ uid: 'test-uid' });

    expect(response.status).toBe(200);
    expect(response.body.uid).toBe('test-uid');
  });

  it('should verify data persistence in Firestore', async () => {
    const profileData = {
      uid: 'test-uid',
      email: 'test@example.com',
      companyDetails: {
        name: 'Test Company',
        industry: 'Tech',
        size: '50-200',
        location: 'Berlin',
        existingAIInitiatives: ['AI Project 1']
      },
      managerProfile: {
        role: 'CEO',
        decisionStyle: 'data-driven',
        aiExperience: 'intermediate',
        communicationPreference: 'detailed'
      },
      strategicGoals: ['Goal 1'],
      businessChallenges: ['Challenge 1'],
      outputPreferences: {
        preferredFormats: ['PDF'],
        reportingFrequency: 'weekly',
        languagePreference: 'en'
      },
      dataConsent: {
        marketingConsent: true,
        analyticsConsent: true,
        lastConsentUpdate: new Date()
      }
    };

    await request(app)
      .post('/api/users/profile')
      .set('Authorization', 'Bearer {firebase-token}')
      .send(profileData);

    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer {firebase-token}')
      .query({ uid: 'test-uid' });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('test@example.com');
  });
});