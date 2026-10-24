'use client'

import { useEffect } from 'react'
import { setMenu } from 'nextra-theme-docs'

export default function AccessibilityPatches() {
  useEffect(() => {
    // Nextra's mobile sidebar menu has no Escape-to-close handler of its own.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

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