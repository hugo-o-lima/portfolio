import { useContext } from 'react';
import { ContentContext } from './ContentContext';

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within a ContentProvider');
  return ctx;
}
