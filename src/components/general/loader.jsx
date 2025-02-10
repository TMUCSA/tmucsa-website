import React, { useEffect } from 'react'

const Loader = () => {
  return (
    <div className='w-full h-full flex items-center justify-center bg-black overflow-hidden z-[1000] absolute top-0 left-0 bg-opacity-30'>
        <img src='/assets/loader.gif' alt='loading...' className='h-48 w-auto' />
    </div>
  )
}

export default Loader