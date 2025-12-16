import Plausible from 'plausible-tracker'

const plausible = Plausible({
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || 'capelosclub.up.railway.app',
    apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io',
})

/**
 * Track page view
 */
export function trackPageView() {
    if (typeof window !== 'undefined') {
        plausible.trackPageview()
    }
}

/**
 * Track custom event
 */
export function trackEvent(
    eventName: string,
    props?: Record<string, string | number | boolean>
) {
    if (typeof window !== 'undefined') {
        plausible.trackEvent(eventName, { props })
    }
}

/**
 * Common events for the forum
 */
export const analytics = {
    // Post events
    postCreated: (postType: 'group' | 'subclub' | 'global') => {
        trackEvent('Post Created', { type: postType })
    },

    postEdited: () => {
        trackEvent('Post Edited')
    },

    postDeleted: () => {
        trackEvent('Post Deleted')
    },

    postLiked: () => {
        trackEvent('Post Liked')
    },

    // Comment events
    commentCreated: (depth: number) => {
        trackEvent('Comment Created', { depth })
    },

    commentEdited: () => {
        trackEvent('Comment Edited')
    },

    // Auth events
    userSignedUp: (method: 'email' | 'google' | 'github' | 'twitter') => {
        trackEvent('User Signed Up', { method })
    },

    userSignedIn: (method: 'email' | 'google' | 'github' | 'twitter') => {
        trackEvent('User Signed In', { method })
    },

    // Group/Subclub events
    groupJoined: () => {
        trackEvent('Group Joined')
    },

    subclubCreated: () => {
        trackEvent('Subclub Created')
    },

    subclubJoined: () => {
        trackEvent('Subclub Joined')
    },

    // Image upload
    imageUploaded: (size: number) => {
        trackEvent('Image Uploaded', { size_kb: Math.round(size / 1024) })
    },

    // Errors
    error: (errorType: string) => {
        trackEvent('Error Occurred', { type: errorType })
    },
}

export default plausible
