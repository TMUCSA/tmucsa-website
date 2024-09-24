import React from 'react'
import Image from "next/legacy/image";

export default function Body() {
  return (
    <div className="flex flex-col items-center justify-center my-36">

      <div className="flex justify-between w-4/5 bg-red">
        <div className="text-white ">
          hello
        </div>
        <img src="/images/carousel/bunny.jpg" className="w-40 h-96" />
        <Image 
          src="/images/carousel/bunny.jpg"
          alt="bunny"
          layout='fill'
          className="w-40 h-40"
         />
      </div>

    </div>
  )
}