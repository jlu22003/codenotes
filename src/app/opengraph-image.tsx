import { ImageResponse } from 'next/og'
import { JOB_TITLE, SITE_NAME, SITE_URL } from '@/lib/site'

// The link-preview card for every page: the home hero's name and role, on the
// light-mode tokens from globals.css. Satori can't parse oklch(), so each token
// is its sRGB equivalent: --background oklch(0.9821 0 0), --foreground
// oklch(0.3485 0 0), --muted-foreground oklch(0.4313 0 0), and Highlighter
// Cream, --accent oklch(0.9354 0.0456 94.8549) / --accent-foreground
// oklch(0.4015 0.0436 37.9587).
const colors = {
  background: '#f9f9f9',
  foreground: '#3a3a3a',
  mutedForeground: '#505050',
  accent: '#f3eac8',
  accentForeground: '#5d4037',
}

export const alt = `${SITE_NAME} · ${JOB_TITLE}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '96px',
          background: colors.background,
          color: colors.foreground,
        }}
      >
        <div style={{ fontSize: 128, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', marginTop: 24 }}>
          <div
            style={{
              fontSize: 56,
              color: colors.accentForeground,
              background: colors.accent,
              padding: '4px 20px',
              borderRadius: 6,
            }}
          >
            {JOB_TITLE}
          </div>
        </div>
        <div style={{ fontSize: 32, color: colors.mutedForeground, marginTop: 48 }}>
          {new URL(SITE_URL).host}
        </div>
      </div>
    ),
    size,
  )
}
