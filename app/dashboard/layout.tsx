import React from 'react' 
import Navbar from '@/components/Navbar';

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {

  
  return (
    <div className='min-h-screen'>
        <Navbar/>
        {children}
    </div>
  )
}

export default layout