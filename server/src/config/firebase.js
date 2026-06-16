import admin from 'firebase-admin';

let firebaseAdmin = null;

const initFirebaseAdmin = () => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY 
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null;

    if (projectId && clientEmail && privateKey) {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log('Firebase Admin SDK Initialized Successfully.');
    } else {
      console.warn('Firebase Admin credentials not complete in environment variables.');
      console.warn('Backend will run in JWT/Mock Authentication Fallback Mode.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    console.warn('Backend will run in JWT/Mock Authentication Fallback Mode.');
  }
};

initFirebaseAdmin();

export { admin, firebaseAdmin };
export default firebaseAdmin;
