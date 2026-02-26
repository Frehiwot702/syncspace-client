'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useAuthStore } from '../store';
import Image from 'next/image';

const Login = () => {

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();

    const setAuth = useAuthStore((state) => state.setAuth);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await fetch('https://3j20j2tc-5000.uks1.devtunnels.ms/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail,
                    password: userPassword
                })
            })

            const res  = await response.json();
            console.log('login result: ', res);

            if(res.message) {
                setLoading(false);
                setError(res.message);
                return
            }
            setAuth(res.user);
            setLoading(false);
            router.push('/dashboard');
            return;
        } catch (error) {
            alert(error)
            setLoading(false);
        }
        
    }


  return (
    <div className="grid grid-cols-2 min-h-screen  text-black font-sans">
        <form onSubmit={handleSubmit} className='h-screen px-10 flex flex-col gap-5 my-auto'>
            <div className='my-auto grid gap-5 px-5'>
                <h3 className='text-[#A71A15] font-bold text-4xl'>SyncSpace</h3>
                <h3 className='text-4xl font-semibold'>Welcome back, team!</h3>
                <div className='grid gap-5'>
                    <input 
                        type='email'
                        required
                        placeholder='Enter your email'
                        className='border border-[#A71A15] rounded-full px-4 py-2'
                        onChange={(e) => setUserEmail(e.target.value)}
                    />
                    <input 
                        type='password'
                        required
                        placeholder='Enter your password'
                        className='border border-[#A71A15] rounded-full px-4 py-2'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className='text-red-500 text-sm text-center'>{error}</p>}
                <button 
                    type='submit'
                    className='bg-[#A71A15] text-white text-lg w-full py-2 font-semibold rounded-full cursor-pointer'
                >{loading ? 'loading...' : 'Login'}</button>
                <h3 className='text-sm'>Dont have an account? <span className='text-red-500'>Register here</span></h3>
            </div>
        </form>
        <div className="relative w-full">
            <Image
                src='/image1.jpg'
                alt='red theme office'
                fill
                objectFit='cover'
                className="relative"
            />
        </div>

    </div>
  )
}

export default Login