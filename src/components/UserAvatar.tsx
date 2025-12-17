import Image from 'next/image'

interface UserAvatarProps {
    src?: string | null
    username: string
    size?: number
    className?: string
}

export default function UserAvatar({ src, username, size = 40, className = '' }: UserAvatarProps) {
    // Se tem URL válida, usa a imagem
    if (src && src.startsWith('http')) {
        return (
            <Image
                src={src}
                alt={username}
                width={size}
                height={size}
                className={`rounded-full object-cover ${className}`}
                unoptimized={src.includes('googleusercontent.com')} // Google avatars não precisam de otimização
            />
        )
    }

    // Caso contrário, gera avatar com iniciais
    const initials = username
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Gera cor baseada no username (consistente)
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ]

    const colorIndex = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    const bgColor = colors[colorIndex]

    return (
        <div
            className={`${bgColor} rounded-full flex items-center justify-center text-white font-bold ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {initials}
        </div>
    )
}
