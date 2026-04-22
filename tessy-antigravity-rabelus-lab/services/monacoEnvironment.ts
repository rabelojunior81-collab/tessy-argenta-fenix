import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import {
  createMonacoEnvironment,
  type MonacoEnvironmentShape,
  type MonacoWorkerConstructor,
  type MonacoWorkerSet,
} from './monacoEnvironmentFactory';

let isInstalled = false;

export const installMonacoEnvironment = (): MonacoEnvironmentShape => {
  const environment = createMonacoEnvironment({
    editorWorker: editorWorker as unknown as MonacoWorkerConstructor,
    jsonWorker: jsonWorker as unknown as MonacoWorkerConstructor,
    cssWorker: cssWorker as unknown as MonacoWorkerConstructor,
    htmlWorker: htmlWorker as unknown as MonacoWorkerConstructor,
    tsWorker: tsWorker as unknown as MonacoWorkerConstructor,
  });

  if (!isInstalled) {
    (globalThis as typeof globalThis & { MonacoEnvironment?: MonacoEnvironmentShape }).MonacoEnvironment =
      environment;
    isInstalled = true;
  }

  return environment;
};

installMonacoEnvironment();
