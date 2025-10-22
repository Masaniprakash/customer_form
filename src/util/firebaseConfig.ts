import * as admin from 'firebase-admin';

export const initializeFirebase = () => {
    if (
        !process.env.FIREBASE_TYPE
        || !process.env.FIREBASE_PROJECT_ID
        || !process.env.FIREBASE_PRIVATE_KEY_ID
        || !process.env.FIREBASE_PRIVATE_KEY
        || !process.env.FIREBASE_CLIENT_EMAIL
        || !process.env.FIREBASE_CLIENT_ID
        || !process.env.FIREBASE_AUTH_URI
        || !process.env.FIREBASE_TOKEN_URI
        || !process.env.FIREBASE_AUTH_PROVIDER_CERT_URL
        || !process.env.FIREBASE_CLIENT_CERT_URL
        || !process.env.FIREBASE_UNIVERSE_DOMAIN
    ) {
        throw new Error('Missing required Firebase credentials in environment variables');
    }
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                type: process.env.FIREBASE_TYPE,
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY, // Replace escaped newlines
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI,
                token_uri: process.env.FIREBASE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
                client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
                universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
            } as admin.ServiceAccount),
        });
        console.log('Firebase initialized successfully');
        return true;
    }
};