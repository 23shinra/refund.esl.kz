import { useEffect } from 'react';

export function setDocumentMeta({ title, description } = {}) {
  if (typeof document === 'undefined') return;

  if (title) document.title = String(title);

  if (description !== undefined) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', String(description ?? ''));
  }
}

export function useDocumentMeta({ title, description } = {}) {
  useEffect(() => {
    setDocumentMeta({ title, description });
  }, [title, description]);
}

