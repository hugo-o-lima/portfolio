import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLanguage } from './useLanguage';
import { LanguageProvider } from './LanguageContext';

describe('useLanguage', () => {
  beforeEach(() => {
    // Deterministic initial language: no stored preference, pt-BR browser.
    window.localStorage.clear();
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('pt-BR');
  });

  it('throws when used outside a LanguageProvider', () => {
    expect(() => renderHook(() => useLanguage())).toThrow(/LanguageProvider/);
  });

  it('provides pt translations by default inside the provider', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });
    expect(result.current.lang).toBe('pt');
    expect(result.current.t.contact.form.send).toBe('Enviar mensagem');
  });

  it('toggles between pt and en', () => {
    const { result } = renderHook(() => useLanguage(), {
      wrapper: ({ children }) => <LanguageProvider>{children}</LanguageProvider>,
    });
    expect(result.current.lang).toBe('pt');
    act(() => result.current.toggleLang());
    expect(result.current.lang).toBe('en');
    expect(result.current.t.contact.form.send).toBe('Send message');
  });
});
