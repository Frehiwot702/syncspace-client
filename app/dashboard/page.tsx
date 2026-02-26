'use client';

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useAuthStore, useWorkspaceStore } from '../store';
import { Workspace } from '@/types/types';
import Workspaces from '@/components/Workspaces';


const Dashboard = () => {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);

    console.log('user data in dashboard: ', user)

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    if (!user) return null;

  return (
    <div className='p-5'>
        <h3 className='text-2xl font-semibold'>Welcome back, {user.name}</h3>
         <Workspaces />
        
    </div>
  )
}

export default Dashboard