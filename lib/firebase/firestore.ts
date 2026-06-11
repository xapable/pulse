import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { app } from './clientApp';
import type { UserProfile, Idea, Project, ApiSettings } from '@/types';

const db = getFirestore(app);

// ── Collections ──
const USERS = 'users';
const PROJECTS = 'projects';
const IDEAS = 'ideas';
const API_SETTINGS = 'apiSettings';

// ── User Profile ──

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
  const ref = doc(db, USERS, profile.userId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, cleanData({
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }));
  } else {
    await updateDoc(ref, cleanData({
      ...profile,
      updatedAt: serverTimestamp(),
    }));
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, USERS, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    userId: snap.id,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as UserProfile;
}

// ── Helpers ──

/** Strip undefined values — Firestore rejects undefined */
function cleanData<T extends Record<string, unknown>>(data: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

// ── Projects ──

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = doc(collection(db, PROJECTS));
  await setDoc(ref, cleanData({
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function getProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(db, PROJECTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Project;
  });
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
  const ref = doc(db, PROJECTS, id);
  await updateDoc(ref, cleanData({ ...updates, updatedAt: serverTimestamp() }));
}

export async function deleteProject(id: string): Promise<void> {
  // Also delete all ideas in this project
  const ideasSnap = await getDocs(
    query(collection(db, IDEAS), where('projectId', '==', id)),
  );
  const batch = writeBatch(db);
  ideasSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, PROJECTS, id));
  await batch.commit();
}

// ── Ideas ──

export async function createIdea(idea: Omit<Idea, 'id' | 'createdAt'>): Promise<string> {
  const ref = doc(collection(db, IDEAS));
  await setDoc(ref, cleanData({
    ...idea,
    createdAt: serverTimestamp(),
    sortOrder: Date.now(),
  }));
  return ref.id;
}

export async function updateIdea(id: string, updates: Partial<Idea>): Promise<void> {
  const ref = doc(db, IDEAS, id);
  await updateDoc(ref, cleanData({ ...updates, updatedAt: serverTimestamp() }));
}

export async function deleteIdea(id: string): Promise<void> {
  const ref = doc(db, IDEAS, id);
  await deleteDoc(ref);
}

export async function getUserIdeas(userId: string): Promise<Idea[]> {
  const q = query(
    collection(db, IDEAS),
    where('userId', '==', userId),
    orderBy('sortOrder', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate(),
    } as Idea;
  });
}

export async function getProjectIdeas(projectId: string): Promise<Idea[]> {
  const q = query(
    collection(db, IDEAS),
    where('projectId', '==', projectId),
    orderBy('sortOrder', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate(),
    } as Idea;
  });
}

export async function getPinnedIdeas(userId: string): Promise<Idea[]> {
  const q = query(
    collection(db, IDEAS),
    where('userId', '==', userId),
    where('isPinned', '==', true),
    orderBy('sortOrder', 'asc'),
    limit(10),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate(),
    } as Idea;
  });
}

export async function getRecentIdeas(userId: string, maxCount: number = 5): Promise<Idea[]> {
  const q = query(
    collection(db, IDEAS),
    where('userId', '==', userId),
    orderBy('sortOrder', 'desc'),
    limit(maxCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate(),
    } as Idea;
  });
}

export async function reorderPinnedIdeas(userId: string, orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderedIds.forEach((id, index) => {
    const ref = doc(db, IDEAS, id);
    batch.update(ref, { sortOrder: index });
  });
  await batch.commit();
}

// ── API Settings ──

export async function getApiSettings(userId: string): Promise<ApiSettings | null> {
  const ref = doc(db, API_SETTINGS, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    userId: snap.id,
    updatedAt: data.updatedAt?.toDate(),
  } as ApiSettings;
}

export async function saveApiSettings(settings: Omit<ApiSettings, 'updatedAt'>): Promise<void> {
  const ref = doc(db, API_SETTINGS, settings.userId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      selectedProvider: settings.selectedProvider,
      selectedModel: settings.selectedModel,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...settings,
      updatedAt: serverTimestamp(),
    });
  }
}

export { db };
