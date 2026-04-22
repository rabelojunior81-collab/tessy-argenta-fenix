import { describe, expect, it, vi } from 'vitest';
import { buildMonacoOptions } from '../../../components/editor/MonacoWrapper';
import { createMonacoEnvironment } from '../../../services/monacoEnvironmentFactory';
import { defineMonacoTheme } from '../../../services/monacoTheme';

describe('monaco setup', () => {
  it('builds safe-mode options that disable heavyweight editor features', () => {
    const normalOptions = buildMonacoOptions('normal', false, { tabSize: 2 });
    expect(normalOptions?.tabSize).toBe(2);
    expect(normalOptions?.readOnly).toBe(false);
    expect(normalOptions?.domReadOnly).toBe(false);
    expect(normalOptions?.minimap).toEqual({ enabled: false });
    expect(normalOptions?.formatOnPaste).toBe(true);

    const safeOptions = buildMonacoOptions('safe', false, { tabSize: 4 });
    expect(safeOptions?.readOnly).toBe(true);
    expect(safeOptions?.domReadOnly).toBe(true);
    expect(safeOptions?.codeLens).toBe(false);
    expect(safeOptions?.stickyScroll).toEqual({ enabled: false });
    expect(safeOptions?.formatOnPaste).toBe(false);
    expect(safeOptions?.tabSize).toBe(4);
  });

  it('defines the liquid glass theme only once', () => {
    const defineTheme = vi.fn();
    const monaco = {
      editor: {
        defineTheme,
      },
    } as any;

    defineMonacoTheme(monaco);
    defineMonacoTheme(monaco);

    expect(defineTheme).toHaveBeenCalledTimes(1);
    expect(defineTheme).toHaveBeenCalledWith(
      'liquid-glass',
      expect.objectContaining({
        base: 'vs-dark',
        inherit: true,
      })
    );
  });

  it('maps language labels to the expected worker constructors', () => {
    class EditorWorkerMock {}
    class JsonWorkerMock {}
    class CssWorkerMock {}
    class HtmlWorkerMock {}
    class TsWorkerMock {}

    const environment = createMonacoEnvironment({
      editorWorker: EditorWorkerMock as any,
      jsonWorker: JsonWorkerMock as any,
      cssWorker: CssWorkerMock as any,
      htmlWorker: HtmlWorkerMock as any,
      tsWorker: TsWorkerMock as any,
    });

    expect(environment.getWorker('module', 'json')).toBeInstanceOf(JsonWorkerMock);
    expect(environment.getWorker('module', 'scss')).toBeInstanceOf(CssWorkerMock);
    expect(environment.getWorker('module', 'html')).toBeInstanceOf(HtmlWorkerMock);
    expect(environment.getWorker('module', 'javascript')).toBeInstanceOf(TsWorkerMock);
    expect(environment.getWorker('module', 'unknown')).toBeInstanceOf(EditorWorkerMock);
  });
});
