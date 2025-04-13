import React from 'react'
import notFoundAnimation from '../assets/images/404 error with a tired person-pana.svg'

export default function Notfound() {
  return <>
    <div className="grid h-[90vh]">
      <img src={notFoundAnimation} className='w-1/3 m-auto' alt="page not found" />
    </div>
  </>
}
