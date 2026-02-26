'use client'
import { useAuthStore } from '@/app/store';
import React from 'react'

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout)

  return (
    
    <div className='bg-white'>
        <div className='w-full border-b-2 fixed top-0 z-50 border-gray-200 bg-white px-8 py-5 shadow flex justify-between items-center'>
           <h3 className='text-[#A71A15] font-bold text-2xl'>SyncSpace</h3>
           <div className='flex items-center space-x-5'>
                <div className='text-end'>
                    <h3 className='text-black'>{user?.name}</h3>
                    <h3 className='text-black/50 text-sm'>{user?.email}</h3>
                </div>
              <button onClick={logout} className='bg-[#A71A15] text-white px-4 py-2 rounded-full font-semibold'>Logout</button>
           </div>
        </div>
    r</div>
  )
}

export default Navbar