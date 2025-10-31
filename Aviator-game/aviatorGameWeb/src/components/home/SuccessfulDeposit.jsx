import React from 'react'
import tick from './../../assets/images/wallet/success.png'
export default function SuccessfulDeposit() {
  return (
    <div className='flex flex-col gap-3 justify-end align-middle mx-auto'>
        <img src={tick} alt="..." className='w-32 mx-auto' />
        <p className='text-lg font-medium text-blue-600 text-center'>Deposite Done Successful!</p>
        <p className='text-lg font-medium text-blue-600 text-center'>Amount will be credited in your account.</p>
    </div>
  )
}
