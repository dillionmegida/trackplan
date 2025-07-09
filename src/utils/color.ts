function hexToRgb(hex) {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('')
  }
  const num = parseInt(hex, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function luminance({ r, g, b }: { r: number; g: number; b: number }) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function getIntensity(hex: string) {
  const rgb = hexToRgb(hex)
  const lum = luminance(rgb)
  return lum
}

export const getWhiteMixAmount = (color: string) => {
  const intensity = getIntensity(color)
  const intensityPercentage = (intensity / 255) * 100

  return 100 - intensityPercentage
}
