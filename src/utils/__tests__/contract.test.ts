import { describe, expect, test } from 'bun:test'
import { windowsPathToPosixPath } from '../windowsPaths.js'

describe('Runtime contract tests', () => {
  test('windowsPathToPosixPath strips NT namespace prefixes', () => {
    expect(windowsPathToPosixPath('\\\\?\\C:\\Users\\test\\file.txt')).toBe('/c/Users/test/file.txt')
    expect(windowsPathToPosixPath('\\\\.\\C:\\Users\\test\\file.txt')).toBe('/c/Users/test/file.txt')
    expect(windowsPathToPosixPath('\\\\?\\UNC\\server\\share\\file.txt')).toBe('//server/share/file.txt')
  })

  test('windowsPathToPosixPath handles standard paths', () => {
    expect(windowsPathToPosixPath('C:\\Users\\sysadmin\\doc.txt')).toBe('/c/Users/sysadmin/doc.txt')
    expect(windowsPathToPosixPath('relative/path/to/file')).toBe('relative/path/to/file')
  })
})
