import { getIntensity, getWhiteMixAmount } from '@/utils/color'

export const getThemeColor = (color: string | undefined) => {
  if (!color)
    return {
      theme: '#000',
      whiteMixAmount: 0,
      darkColor: '#000',
      emptyColor: 'fff',
    }

  const theme = getIntensity(color) < 200 ? color : '#000'
  const whiteMixAmount = getWhiteMixAmount(theme)
  const darkColor = getIntensity(color) < 200 ? color : '#333'
  const emptyColor =
    getIntensity(color) > 250 || getIntensity(color) < 20
      ? '#F2F2F2'
      : getIntensity(color) > 200
        ? '#000'
        : '#fff'

  return {
    theme,
    whiteMixAmount,
    darkColor,
    emptyColor,
  }
}
