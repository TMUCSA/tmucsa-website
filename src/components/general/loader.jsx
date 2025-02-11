import React, { useEffect } from 'react'

const Loader = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center overflow-hidden z-[1000] absolute top-0 left-0 bg-default'>
        <img src='/assets/loader.gif' alt='loading...' className='h-48 w-auto' />
    </div>
  )
}

export default Loader