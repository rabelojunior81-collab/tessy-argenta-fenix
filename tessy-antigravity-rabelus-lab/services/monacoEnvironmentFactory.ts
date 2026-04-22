export type MonacoWorkerConstructor = new () => Worker;

export interface MonacoWorkerSet {
  editorWorker: MonacoWorkerConstructor;
  jsonWorker: MonacoWorkerConstructor;
  cssWorker: MonacoWorkerConstructor;
  htmlWorker: MonacoWorkerConstructor;
  tsWorker: MonacoWorkerConstructor;
}

export interface MonacoEnvironmentShape {
  getWorker: (_moduleId: string, label: string) => Worker;
}

export const createMonacoEnvironment = ({
  editorWorker,
  jsonWorker,
  cssWorker,
  htmlWorker,
  tsWorker,
}: MonacoWorkerSet): MonacoEnvironmentShape => ({
  getWorker: (_moduleId: string, label: string) => {
    switch (label) {
      case 'json':
        return new jsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new cssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new htmlWorker();
      case 'typescript':
      case 'javascript':
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
});
