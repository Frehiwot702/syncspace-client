import Navbar from '@/components/Navbar';
import React from 'react'

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  
  return (
    <div className='min-h-screen'>
        <Navbar />
        {children}
    </div>
  )
}

export default layout