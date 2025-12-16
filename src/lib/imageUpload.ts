/**
 * Image Upload Utilities
 * Handles validation, sanitization, and upload of images to Supabase Storage
 */

import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png']

export interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

export interface ValidationResult {
    valid: boolean
    error?: string
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): ValidationResult {
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `Arquivo muito grande. Tamanho máximo: 5MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }
    }
    return { valid: true }
}

/**
 * Validate file type
 */
export function validateFileType(file: File): ValidationResult {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Tipo de arquivo não permitido. Use apenas JPEG ou PNG.`
        }
    }

    // Double-check extension
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            error: `Extensão de arquivo não permitida. Use apenas .jpg, .jpeg ou .png`
        }
    }

    return { valid: true }
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
    // Remove path separators and special characters
    const sanitized = filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.+/g, '.')
        .replace(/_+/g, '_')

    // Ensure it doesn't start with a dot
    return sanitized.startsWith('.') ? sanitized.substring(1) : sanitized
}

/**
 * Generate unique filename with UUID
 */
export function generateUniqueFilename(originalFilename: string): string {
    const extension = originalFilename.substring(originalFilename.lastIndexOf('.'))
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    return `${timestamp}_${randomString}${extension}`
}

/**
 * Compress image before upload (basic quality reduction)
 * Returns a promise that resolves to a compressed File
 */
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'))
                            return
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        })

                        resolve(compressedFile)
                    },
                    file.type,
                    quality
                )
            }

            img.onerror = () => reject(new Error('Failed to load image'))
            img.src = e.target?.result as string
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
    })
}

/**
 * Upload image to Supabase Storage with validation
 */
export async function uploadImage(
    file: File,
    userId: string,
    compress: boolean = true
): Promise<UploadResult> {
    try {
        // Validate file size
        const sizeValidation = validateFileSize(file)
        if (!sizeValidation.valid) {
            return { success: false, error: sizeValidation.error }
        }

        // Validate file type
        const typeValidation = validateFileType(file)
        if (!typeValidation.valid) {
            return { success: false, error: typeValidation.error }
        }

        // Compress image if requested
        let fileToUpload = file
        if (compress) {
            try {
                fileToUpload = await compressImage(file)
            } catch (error) {
                console.warn('Image compression failed, uploading original:', error)
                // Continue with original file if compression fails
            }
        }

        // Generate unique filename
        const sanitizedOriginalName = sanitizeFilename(file.name)
        const uniqueFilename = generateUniqueFilename(sanitizedOriginalName)
        const filePath = `${userId}/${uniqueFilename}`

        // Upload to Supabase Storage
        const supabase = createClient()
        const { data, error } = await supabase.storage
            .from('post-images')
            .upload(filePath, fileToUpload, {
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('Upload error:', error)
            return { success: false, error: `Erro ao fazer upload: ${error.message}` }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('post-images')
            .getPublicUrl(filePath)

        return { success: true, url: publicUrl }
    } catch (error) {
        console.error('Unexpected upload error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro inesperado ao fazer upload'
        }
    }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
    try {
        const supabase = createClient()

        // Extract file path from URL
        const urlParts = imageUrl.split('/post-images/')
        if (urlParts.length < 2) {
            console.error('Invalid image URL format')
            return false
        }

        const filePath = urlParts[1]

        const { error } = await supabase.storage
            .from('post-images')
            .remove([filePath])

        if (error) {
            console.error('Delete error:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Unexpected delete error:', error)
        return false
    }
}
