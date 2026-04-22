export type FileOpenMode = 'normal' | 'safe';

export interface FileOpenMetrics {
  lineCount: number;
  byteSize: number;
}

export interface FileOpenSource extends FileOpenMetrics {
  path: string;
  content: string;
  language: string;
  isLocal: boolean;
}

export interface FileOpenDescriptor extends FileOpenSource {
  isLargeFile: boolean;
  isReadOnly: boolean;
  openMode: FileOpenMode;
}

export const LARGE_FILE_LINE_THRESHOLD = 50_000;
export const LARGE_FILE_BYTE_THRESHOLD = 1_048_576;

export const countFileLines = (content: string): number => {
  if (!content) return 0;
  return content.split(/\r\n|\r|\n/).length;
};

export const getUtf8ByteSize = (content: string): number => new TextEncoder().encode(content).length;

export const formatFileSize = (byteSize: number): string => {
  if (byteSize < 1024) {
    return `${byteSize} B`;
  }

  const units = ['KB', 'MB', 'GB'];
  let size = byteSize / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
};

export const classifyFileOpen = (metrics: FileOpenMetrics) => {
  const isLargeFile =
    metrics.lineCount >= LARGE_FILE_LINE_THRESHOLD || metrics.byteSize >= LARGE_FILE_BYTE_THRESHOLD;

  return {
    isLargeFile,
    recommendedMode: (isLargeFile ? 'safe' : 'normal') as FileOpenMode,
  };
};

export const createFileDescriptor = (
  source: FileOpenSource,
  openMode?: FileOpenMode
): FileOpenDescriptor => {
  const classification = classifyFileOpen(source);
  const finalOpenMode = openMode ?? classification.recommendedMode;

  return {
    ...source,
    isLargeFile: classification.isLargeFile,
    isReadOnly: source.isLocal ? finalOpenMode === 'safe' : true,
    openMode: finalOpenMode,
  };
};
