import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LabelItem } from '../types/label';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without passing firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by the Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client is offline.');
    }
  }
}
testConnection();

const LABELS_COLLECTION = 'labels';

export const firebaseService = {
  // Real-time synchronization of labels
  subscribeLabels(onData: (labels: LabelItem[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, LABELS_COLLECTION));

    return onSnapshot(
      q,
      (snapshot) => {
        const items: LabelItem[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.id.startsWith('sample') || docSnap.id.includes('sample')) {
            deleteDoc(doc(db, LABELS_COLLECTION, docSnap.id)).catch(() => {});
            return;
          }
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            codigo: data.codigo || '',
            descricao: data.descricao || '',
            quantidade: data.quantidade || '',
            validade: data.validade || '',
            tipoOrigem: data.tipoOrigem || 'fabrica',
            observacoes: data.observacoes || '',
            missingFields: data.missingFields || [],
            needsManualReview: data.needsManualReview || false,
            createdAt: data.createdAt ? Number(data.createdAt) : Date.now(),
            copias: data.copias || 1,
          });
        });

        // Sort latest first
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onData(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, LABELS_COLLECTION);
        if (onError) onError(error);
      }
    );
  },

  async addOrUpdateLabel(label: LabelItem): Promise<void> {
    const labelDocRef = doc(db, LABELS_COLLECTION, label.id);
    const payload = {
      codigo: label.codigo || '',
      descricao: label.descricao || '',
      quantidade: label.quantidade || '',
      validade: label.validade || '',
      tipoOrigem: label.tipoOrigem || 'fabrica',
      observacoes: label.observacoes || '',
      missingFields: label.missingFields || [],
      needsManualReview: label.needsManualReview || false,
      copias: label.copias || 1,
      createdAt: String(label.createdAt || Date.now()),
    };

    try {
      await setDoc(labelDocRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${LABELS_COLLECTION}/${label.id}`);
    }
  },

  async deleteLabel(labelId: string): Promise<void> {
    const labelDocRef = doc(db, LABELS_COLLECTION, labelId);
    try {
      await deleteDoc(labelDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${LABELS_COLLECTION}/${labelId}`);
    }
  },
};
