import { sanitizeHTML, stripHTML } from '../sanitize';

describe('HTML Sanitization', () => {
    describe('sanitizeHTML', () => {
        it('should remove script tags', () => {
            const dirty = '<p>Hello</p><script>alert("XSS")</script>';
            const clean = sanitizeHTML(dirty);
            expect(clean).toBe('<p>Hello</p>');
            expect(clean).not.toContain('<script>');
        });

        it('should allow safe HTML tags', () => {
            const dirty = '<p>Hello <strong>World</strong></p>';
            const clean = sanitizeHTML(dirty);
            expect(clean).toBe('<p>Hello <strong>World</strong></p>');
        });

        it('should remove onclick handlers', () => {
            const dirty = '<a href="#" onclick="alert(1)">Click</a>';
            const clean = sanitizeHTML(dirty);
            expect(clean).not.toContain('onclick');
        });

        it('should allow safe links', () => {
            const dirty = '<a href="https://example.com">Link</a>';
            const clean = sanitizeHTML(dirty);
            expect(clean).toContain('href="https://example.com"');
        });
    });

    describe('stripHTML', () => {
        it('should remove all HTML tags', () => {
            const dirty = '<p>Hello <b>World</b></p>';
            const clean = stripHTML(dirty);
            expect(clean).toBe('Hello World');
        });

        it('should handle nested tags', () => {
            const dirty = '<div><p><strong>Test</strong></p></div>';
            const clean = stripHTML(dirty);
            expect(clean).toBe('Test');
        });

        it('should return plain text unchanged', () => {
            const dirty = 'Plain text';
            const clean = stripHTML(dirty);
            expect(clean).toBe('Plain text');
        });
    });
});
