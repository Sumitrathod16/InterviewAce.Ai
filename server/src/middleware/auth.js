import jwt from 'jsonwebtoken';
import { admin, firebaseAdmin } from '../config/firebase.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

export const checkSubscriptionStatus = async (user) => {
  if (!user) return user;

  const now = new Date();
  const registrationDate = user.createdAt || now;
  const trialDuration = 60 * 24 * 60 * 60 * 1000; // 2 months (60 days in ms)

  const isWithinTrial = (now - registrationDate) < trialDuration;

  if (isWithinTrial) {
    // During trial period, auto-upgrade to Premium if Free
    if (user.subscription === 'Free') {
      user.subscription = 'Premium';
      await user.save();
    }
    return user;
  }

  // Trial expired. Check for active paid/trialing subscription
  const activeSub = await Subscription.findOne({
    userId: user._id,
    status: { $in: ['active', 'trialing'] },
    currentPeriodEnd: { $gt: now }
  });

  if (!activeSub) {
    if (user.subscription !== 'Free') {
      console.log(`[TRIAL EXPIRED] Downgrading user ${user.email} to Free subscription tier.`);
      user.subscription = 'Free';
      await user.save();
    }
  } else {
    if (user.subscription !== activeSub.plan) {
      user.subscription = activeSub.plan;
      await user.save();
    }
  }

  return user;
};


export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Mock Authentication Fallback for local development/testing
      if (token.startsWith('mock-token')) {
        const parts = token.split(':');
        const email = parts[1] || 'student@interviewace.ai';
        const name = parts[2] || 'Student Candidate';
        const role = parts[3] || 'Student';
        const targetRole = parts[4] || 'Frontend Engineer';
        const firebaseId = `firebase-mock-id-${email}`;

        let user = await User.findOne({ firebaseId });
        if (!user) {
          user = await User.create({
            firebaseId,
            email,
            name,
            role,
            targetRole,
            subscription: 'Premium'
          });
        }
        user = await checkSubscriptionStatus(user);
        req.user = user;
        return next();
      }

      // 2. Custom signed JWT (issued by backend when Firebase Admin is not configured)
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'local_dev_jwt_secret_interviewace_2026');
        let user = await User.findById(decoded.id);
        if (user) {
          user = await checkSubscriptionStatus(user);
          req.user = user;
          return next();
        }
      } catch (jwtErr) {
        // Token might be a Firebase ID token instead, continue to Firebase verify
      }

      // 3. Firebase ID Token Verification
      if (firebaseAdmin) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          const { uid, email, name } = decodedToken;

          // Find or create user in DB
          let user = await User.findOne({ firebaseId: uid });
          if (!user) {
            user = await User.create({
              firebaseId: uid,
              email: email || `${uid}@interviewace.ai`,
              name: name || email?.split('@')[0] || 'Candidate',
              role: 'Student', // Default role
              subscription: 'Premium'
            });
          }
          user = await checkSubscriptionStatus(user);
          req.user = user;
          return next();
        } catch (fbErr) {
          return res.status(401).json({ message: 'Not authorized, Firebase token verification failed' });
        }
      } else {
        // Fallback: If Firebase Admin is not configured but a Firebase token is passed,
        // decode the token directly (perfect for local developer test runs).
        try {
          const decodedToken = jwt.decode(token);
          if (decodedToken && decodedToken.user_id) {
            const uid = decodedToken.user_id;
            const email = decodedToken.email;
            const name = decodedToken.name;

            let user = await User.findOne({ firebaseId: uid });
            if (!user) {
              user = await User.create({
                firebaseId: uid,
                email: email || `${uid}@interviewace.ai`,
                name: name || email?.split('@')[0] || 'Candidate',
                role: 'Student',
                subscription: 'Premium'
              });
            }
            user = await checkSubscriptionStatus(user);
            req.user = user;
            return next();
          }
        } catch (decodeErr) {
          // Fall through
        }
      }

      return res.status(401).json({ message: 'Not authorized, token verification failed' });
    } catch (error) {
      console.error('Auth protection middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Admin protection middleware
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
