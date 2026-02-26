'use client'

import { useState } from 'react'

import { useEffect } from "react";
import { socket } from '@/app/socket';
import { Workspace } from '@/types/types';
import { useAuthStore, useWorkspaceStore } from '@/app/store';
import Link from 'next/link';




const Workspaces = () => {
 const user = useAuthStore((state) => state.user);
 const [workspace, setWorkspace] = useState<Workspace[]>([]);
 const [error, setError] = useState('');
 const setWorkspaces = useWorkspaceStore((state) => state.setWorkspace)

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const result = await fetch(`https://3j20j2tc-5000.uks1.devtunnels.ms/api/workspaces/${user?._id}`,
                    {   method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                    }
                )
                const res = await result.json();
                console.log('fetch workspace result: ', res)

                if(res.message) {
                    setError(res.message);
                }
                setWorkspace(res);
                setWorkspaces(res);
                return;
            } catch(error) {
                alert(error)
            }
            
        }
        if (user) {
            fetchWorkspaces();
        }
    }, [user]);

  console.log('workspace in component: ', workspace);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className='py-10'>
      <h3 className='text-2xl font-semibold'>Workspaces</h3>
      <p className='text-black/50'>List of workspaces that you have join by admin approval</p>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-10 py-5'>
        {workspace.map((w) =>  (
          <Link key={w._id} href={`/workspaces/${w._id}`}>
            <div  className='border border-[#A71A15] text-black h-24 rounded-md flex items-center justify-center cursor-pointer'>
              {w.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Workspaces