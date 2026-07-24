import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'

extend([mixPlugin])

const GITHUB_BASE_URL = 'https://github.com'
const GIST_BASE_URL = 'https://gist.github.com'

/**
 * Get GitHub URL.
 *
 * @param path - The path to the GitHub URL
 * @returns The GitHub URL
 */
export function getGithubUrl(path: string): string {
  return `${GITHUB_BASE_URL}${path}`
}

/**
 * Get Gist URL.
 *
 * @param path - The path to the Gist URL
 * @returns The Gist URL
 */
export function getGistUrl(path: string): string {
  return `${GIST_BASE_URL}${path}`
}

/**
 * Maps GitHub status to a display status string.
 *
 * @param status - The GitHub status
 * @returns The display status string
 *
 * @example
 * ```ts
 * getDisplayStatus('good')
 * // => 'All Systems Operational'
 *
 * getDisplayStatus('minor')
 * // => 'Minor Issues'
 *
 * getDisplayStatus('major')
 * // => 'Major Outage'
 *
 * getDisplayStatus('critical')
 * // => 'Critical Outage'
 *
 * getDisplayStatus('unknown')
 * // => 'Unknown'
 * ```
 */
export function getDisplayStatus(status: string): string {
  const statusLabels: Record<string, string> = {
    good: 'All Systems Operational',
    minor: 'Minor Issues',
    major: 'Major Outage',
    critical: 'Critical Outage',
  }

  return statusLabels[status] ?? 'Unknown'
}

/**
 * Get label style.
 *
 * @param labelHex - The label hex color
 * @param isDarkMode - Whether the mode is dark
 * @returns The label style
 */
export function getLabelStyle(labelHex: string, isDarkMode: boolean) {
  const color = colord(`#${labelHex}`)

  if (!color.isValid()) {
    return {
      backgroundColor: `#${labelHex}20`,
      color: `#${labelHex}`,
      border: `1px solid #${labelHex}40`,
    }
  }

  const brightness = color.brightness()
  const isLightLabel = brightness >= 0.5

  const bgColor =
    (isLightLabel && isDarkMode) || (!isLightLabel && !isDarkMode)
      ? color
      : isLightLabel
        ? color.darken(0.5)
        : color.lighten(0.55)

  const bgAlpha = isDarkMode ? 0.4 : 0.25
  const borderAlpha = isDarkMode ? 0.55 : 0.4

  const textColor =
    bgColor.brightness() >= 0.5 ? color.mix('#ffffff', 0.7) : color.mix('#000000', 0.75)

  return {
    backgroundColor: bgColor.alpha(bgAlpha).toRgbString(),
    color: textColor.toHex(),
    border: `1px solid ${bgColor.alpha(borderAlpha).toRgbString()}`,
  }
}
