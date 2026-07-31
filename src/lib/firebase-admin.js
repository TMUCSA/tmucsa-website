import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required server environment variable: ${name}`)
  return value
}

export function getAdminApp() {
  if (getApps().length) return getApp()

  return initializeApp({
    credential: cert({
      projectId: requiredEnvironment('FIREBASE_ADMIN_PROJECT_ID'),
      clientEmail: requiredEnvironment('FIREBASE_ADMIN_CLIENT_EMAIL'),
      privateKey: requiredEnvironment('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n'),
    }),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      `${requiredEnvironment('FIREBASE_ADMIN_PROJECT_ID')}.firebasestorage.app`,
  })
}

export const getAdminAuth = () => getAuth(getAdminApp())
export const getAdminDb = () => getFirestore(getAdminApp())
export const getAdminStorage = () => getStorage(getAdminApp())
