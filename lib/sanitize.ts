// Security Helper: HTML Sanitization
// Use this when you need to render user-generated HTML content

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML to prevent XSS attacks
 * @param dirty - Raw HTML string from user input
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHTML(dirty: string, options?: DOMPurify.Config): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'title'],
        ALLOW_DATA_ATTR: false,
        ...options
    } as any) as unknown as string;
}

/**
 * Strips all HTML tags, leaving only text
 * Useful for titles, short descriptions, etc.
 * @param dirty - Raw string that may contain HTML
 * @returns Plain text string
 */
export function stripHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

/**
 * Example usage in components:
 * 
 * // For rich text (proposal descriptions)
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(proposal.description) }} />
 * 
 * // For plain text (titles, etc)
 * <h1>{stripHTML(proposal.title)}</h1>
 */
