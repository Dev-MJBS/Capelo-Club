import React from 'react'
import Image from 'next/image'

export default function VerifiedBadge({ size = 16 }: { size?: number }) {
    return (
        <Image 
            src="/icons/verified.png" 
            alt="Verified" 
            width={size}
            height={size}
            className="inline-block align-middle"
            style={{ width: size, height: size }}
        />
    )
}
