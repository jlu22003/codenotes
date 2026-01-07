'use client'

import { useEffect } from 'react'

export default function AccessibilityPatches() {
  useEffect(() => {
    // Fix "Copy page" button
    document
      .querySelectorAll('button[title="Copy page"]')
      .forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
          btn.setAttribute('aria-label', 'Copy page')
        }
      })

    // Fix Headless UI listbox buttons (small icon-only)
    document
      .querySelectorAll<HTMLButtonElement>('button[aria-haspopup="listbox"]')
      .forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
          btn.setAttribute('aria-label', 'Open menu')
        }

        btn.style.minHeight = '48px'
        btn.style.minWidth = '48px'
      })
  }, [])

  return null
}