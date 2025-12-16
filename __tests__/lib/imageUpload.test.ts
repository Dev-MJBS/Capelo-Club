import { validateFileSize, validateFileType, sanitizeFilename, generateUniqueFilename } from '@/lib/imageUpload'

describe('Image Upload Validation', () => {
    describe('validateFileSize', () => {
        it('accepts files under 5MB', () => {
            const file = new File(['a'.repeat(1024 * 1024 * 4)], 'test.jpg', { type: 'image/jpeg' })
            const result = validateFileSize(file)
            expect(result.valid).toBe(true)
        })

        it('rejects files over 5MB', () => {
            const file = new File(['a'.repeat(1024 * 1024 * 6)], 'test.jpg', { type: 'image/jpeg' })
            const result = validateFileSize(file)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('muito grande')
        })
    })

    describe('validateFileType', () => {
        it('accepts JPEG files', () => {
            const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
            const result = validateFileType(file)
            expect(result.valid).toBe(true)
        })

        it('accepts PNG files', () => {
            const file = new File(['test'], 'test.png', { type: 'image/png' })
            const result = validateFileType(file)
            expect(result.valid).toBe(true)
        })

        it('rejects GIF files', () => {
            const file = new File(['test'], 'test.gif', { type: 'image/gif' })
            const result = validateFileType(file)
            expect(result.valid).toBe(false)
            expect(result.error).toContain('não permitido')
        })

        it('rejects files with wrong extension', () => {
            const file = new File(['test'], 'test.exe', { type: 'application/exe' })
            const result = validateFileType(file)
            expect(result.valid).toBe(false)
        })
    })

    describe('sanitizeFilename', () => {
        it('removes special characters', () => {
            const result = sanitizeFilename('test@#$%file.jpg')
            expect(result).toBe('test____file.jpg')
        })

        it('removes path separators', () => {
            const result = sanitizeFilename('../../../etc/passwd')
            expect(result).toBe('._._._etc_passwd')
        })

        it('removes leading dots', () => {
            const result = sanitizeFilename('.hidden.jpg')
            expect(result).toBe('hidden.jpg')
        })

        it('preserves valid characters', () => {
            const result = sanitizeFilename('my-photo_2024.jpg')
            expect(result).toBe('my-photo_2024.jpg')
        })
    })

    describe('generateUniqueFilename', () => {
        it('generates unique filenames', () => {
            const filename1 = generateUniqueFilename('test.jpg')
            const filename2 = generateUniqueFilename('test.jpg')
            expect(filename1).not.toBe(filename2)
        })

        it('preserves file extension', () => {
            const result = generateUniqueFilename('test.jpg')
            expect(result).toMatch(/\.jpg$/)
        })

        it('includes timestamp', () => {
            const result = generateUniqueFilename('test.png')
            expect(result).toMatch(/^\d+_/)
        })
    })
})
