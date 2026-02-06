'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for user tasks
  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const taskList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        })) as Task[];
        setTasks(taskList);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tasks');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const addTask = useCallback(
    async (title: string, description?: string, dueDate?: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const docRef = await addDoc(collection(db, 'tasks'), {
          userId: user.uid,
          title,
          description,
          status: 'todo',
          dueDate: dueDate ? new Date(dueDate) : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return docRef.id;
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to add task');
      }
    },
    [user?.uid]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, {
          ...updates,
          updatedAt: new Date(),
        });
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to update task');
      }
    },
    [user?.uid]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');

      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (err) {
        throw err instanceof Error ? err : new Error('Failed to delete task');
      }
    },
    [user?.uid]
  );

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
}
