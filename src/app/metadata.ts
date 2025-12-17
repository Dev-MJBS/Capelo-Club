import { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        default: 'Capelo Club - Comunidade de Leitores',
        template: '%s | Capelo Club'
    },
    description: 'A maior comunidade de leitores do Brasil. Discuta livros, compartilhe resenhas e conecte-se com outros leitores.',
    keywords: ['livros', 'leitura', 'comunidade', 'resenhas', 'discussão', 'literatura'],
    authors: [{ name: 'Capelo Club' }],
    creator: 'Capelo Club',
    publisher: 'Capelo Club',
    icons: {
        icon: [
            { url: '/images/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/images/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/images/favicon.ico', sizes: 'any' }
        ],
        apple: [
            { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
        ],
        other: [
            { url: '/images/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/images/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
    },
    manifest: '/images/site.webmanifest',
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: 'https://cclub.com.br',
        title: 'Capelo Club - Comunidade de Leitores',
        description: 'A maior comunidade de leitores do Brasil',
        siteName: 'Capelo Club',
        images: [
            {
                url: '/images/logo.png',
                width: 1200,
                height: 630,
                alt: 'Capelo Club'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Capelo Club - Comunidade de Leitores',
        description: 'A maior comunidade de leitores do Brasil',
        images: ['/images/logo.png']
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
        }
    },
    verification: {
        // Adicione aqui quando tiver:
        // google: 'seu-codigo-google',
        // yandex: 'seu-codigo-yandex',
    }
}
