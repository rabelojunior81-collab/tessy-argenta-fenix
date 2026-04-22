import { describe, expect, it } from 'vitest';
import {
  LARGE_FILE_BYTE_THRESHOLD,
  LARGE_FILE_LINE_THRESHOLD,
  classifyFileOpen,
  countFileLines,
  createFileDescriptor,
  formatFileSize,
  getUtf8ByteSize,
} from '../../../services/fileOpenPolicy';

describe('file open policy', () => {
  it('counts lines and classifies large files using both thresholds', () => {
    expect(countFileLines('a\nb\r\nc')).toBe(3);
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(getUtf8ByteSize('hello')).toBe(5);

    const byLines = classifyFileOpen({
      lineCount: LARGE_FILE_LINE_THRESHOLD,
      byteSize: 10,
    });
    expect(byLines.isLargeFile).toBe(true);
    expect(byLines.recommendedMode).toBe('safe');

    const byBytes = classifyFileOpen({
      lineCount: 1,
      byteSize: LARGE_FILE_BYTE_THRESHOLD,
    });
    expect(byBytes.isLargeFile).toBe(true);
    expect(byBytes.recommendedMode).toBe('safe');
  });

  it('keeps local files editable by default and remote files read only', () => {
    const localDescriptor = createFileDescriptor({
      path: '/workspace/file.ts',
      content: 'console.log(1);',
      language: 'ts',
      lineCount: 1,
      byteSize: 15,
      isLocal: true,
    });

    expect(localDescriptor.openMode).toBe('normal');
    expect(localDescriptor.isReadOnly).toBe(false);
    expect(localDescriptor.isLargeFile).toBe(false);

    const safeLocalDescriptor = createFileDescriptor(
      {
        path: '/workspace/big.txt',
        content: 'a',
        language: 'txt',
        lineCount: LARGE_FILE_LINE_THRESHOLD,
        byteSize: LARGE_FILE_BYTE_THRESHOLD,
        isLocal: true,
      },
      'safe'
    );

    expect(safeLocalDescriptor.openMode).toBe('safe');
    expect(safeLocalDescriptor.isReadOnly).toBe(true);
    expect(safeLocalDescriptor.isLargeFile).toBe(true);

    const remoteDescriptor = createFileDescriptor({
      path: 'repo/file.ts',
      content: 'console.log(1);',
      language: 'ts',
      lineCount: 1,
      byteSize: 15,
      isLocal: false,
    });

    expect(remoteDescriptor.isReadOnly).toBe(true);
    expect(remoteDescriptor.openMode).toBe('normal');
  });
});
