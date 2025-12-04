import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { validatePassword, calculatePasswordStrength } from '../../../utils/passwordValidation';

describe('Password Validation Utility', () => {
    test('validatePassword returns valid for strong password', () => {
        const result = validatePassword('StrongPass1!');
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('validatePassword fails for short password', () => {
        const result = validatePassword('Short1!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('At least 8 characters');
    });

    test('validatePassword fails for missing number', () => {
        const result = validatePassword('NoNumber!');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('One number');
    });

    test('validatePassword fails for missing special char', () => {
        const result = validatePassword('NoSpecial1');
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('One special character');
    });

    test('calculatePasswordStrength returns correct score', () => {
        expect(calculatePasswordStrength('weak').level).toBe('weak');
        expect(calculatePasswordStrength('Medium123').level).toBe('medium');
        expect(calculatePasswordStrength('StrongPass1!').level).toBe('strong');
    });
});
