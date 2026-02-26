import {create} from 'zustand'
import { persist } from "zustand/middleware";

type userStore = {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: "online" | "offline";
    password: string;
    setUser: (data: object) => void;
}

type workspaceStore = {
    _id: string;
    name: string;
    members: string[];
}

interface AuthState {
    user: userStore | null;
    setAuth: (user: userStore) => void;
    logout: () => void
}

interface WorkspaceState {
    workspace: workspaceStore | workspaceStore[] | null;
    setWorkspace: (workspace: workspaceStore) => void;
}

// default value to user store and store my auth sate in localStorage.auth-storage
//  this is a custom hook like usestate which allow us to access data without having to pass the dataas a pro[]
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setAuth: (user) => set({ user }),

      logout: () => {
        set({ user: null })
        
      }
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);


export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspace: null,

      setWorkspace: (workspace) => set({ workspace  }),

    }),
    {
      name: "workspace-storage", // localStorage key
    }
  )
);