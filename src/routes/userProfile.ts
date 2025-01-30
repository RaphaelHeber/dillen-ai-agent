import express, { Request, Response, NextFunction } from 'express';
import { Timestamp } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import { UserProfile } from '../types/user';
import { supabase } from '../utils/supabaseClient';

const router = express.Router();
const db = admin.firestore();

// Extend the Request interface to include the user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

// Middleware to authenticate Firebase token
const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Create/Update Profile
router.post('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  console.log('Received request to create/update profile');
  try {
    const uid = req.user?.uid;
    if (!uid) {
      console.log('User ID is missing');
      res.status(400).json({ error: 'User ID is missing' });
      return;
    }
    const userRef = db.collection('users').doc(uid);
    
    const profileData: Partial<UserProfile> = {
      ...req.body,
      uid,
      lastUpdated: Timestamp.now(),
    };

    // For new profiles, add creation timestamp
    const doc = await userRef.get();
    if (!doc.exists) {
      profileData.createdAt = Timestamp.now();
    }

    await userRef.set(profileData, { merge: true });
    
    const updatedDoc = await userRef.get();
    console.log('Profile updated successfully');
    res.json(updatedDoc.data());
  } catch (error) {
    if (error instanceof Error) {
      console.error('Profile update error:', error.message);
      res.status(500).json({ error: 'Failed to update profile', details: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});

// Get Profile
router.get('/profile', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  console.log('Received request to get profile');
  try {
    const uid = req.user?.uid;
    if (!uid) {
      console.log('User ID is missing');
      res.status(400).json({ error: 'User ID is missing' });
      return;
    }
    const userRef = db.collection('users').doc(uid);
    
    const doc = await userRef.get();
    if (!doc.exists) {
      console.log('Profile not found');
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    
    console.log('Profile fetched successfully');
    res.json(doc.data());
  } catch (error) {
    if (error instanceof Error) {
      console.error('Profile fetch error:', error.message);
      res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});

// Update Onboarding Status
router.put('/profile/onboarding', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  console.log('Received request to update onboarding status');
  try {
    const { step, completed } = req.body;
    const uid = req.user?.uid;
    if (!uid) {
      console.log('User ID is missing');
      res.status(400).json({ error: 'User ID is missing' });
      return;
    }
    const userRef = db.collection('users').doc(uid);
    
    await userRef.update({
      onboardingCompleted: completed,
      lastUpdated: Timestamp.now(),
      'onboarding.currentStep': step
    });
    
    console.log('Onboarding status updated successfully');
    res.json({
      currentStep: step,
      onboardingCompleted: completed
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Onboarding update error:', error.message);
      res.status(500).json({ error: 'Failed to update onboarding status', details: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
});

export default router;