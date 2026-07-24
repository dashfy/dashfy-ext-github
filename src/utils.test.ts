import { describe, expect, it } from 'vitest'

import { getDisplayStatus, getGistUrl, getGithubUrl } from './utils'

describe('getGithubUrl', () => {
  it('should return GitHub URL with path', () => {
    expect(getGithubUrl('/facebook/react')).toBe('https://github.com/facebook/react')
  })

  it('should handle empty path', () => {
    expect(getGithubUrl('')).toBe('https://github.com')
  })

  it('should handle path with leading slash', () => {
    expect(getGithubUrl('/user/repo/issues')).toBe('https://github.com/user/repo/issues')
  })
})

describe('getGistUrl', () => {
  it('should return Gist URL with path', () => {
    expect(getGistUrl('/user/gist-id')).toBe('https://gist.github.com/user/gist-id')
  })

  it('should handle empty path', () => {
    expect(getGistUrl('')).toBe('https://gist.github.com')
  })
})

describe('getDisplayStatus', () => {
  it('should return "All Systems Operational" for good status', () => {
    expect(getDisplayStatus('good')).toBe('All Systems Operational')
  })

  it('should return "Minor Issues" for minor status', () => {
    expect(getDisplayStatus('minor')).toBe('Minor Issues')
  })

  it('should return "Major Outage" for major status', () => {
    expect(getDisplayStatus('major')).toBe('Major Outage')
  })

  it('should return "Critical Outage" for critical status', () => {
    expect(getDisplayStatus('critical')).toBe('Critical Outage')
  })

  it('should return "Unknown" for unknown status', () => {
    expect(getDisplayStatus('unknown')).toBe('Unknown')
  })

  it('should return "Unknown" for empty string', () => {
    expect(getDisplayStatus('')).toBe('Unknown')
  })

  it('should return "Unknown" for any unmapped status', () => {
    expect(getDisplayStatus('random')).toBe('Unknown')
    expect(getDisplayStatus('degraded')).toBe('Unknown')
  })
})
