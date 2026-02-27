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
      name: "auth-storage",
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
      name: "workspace-storage",
    }
  )
);