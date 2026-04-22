import {
  ArrowRight,
  Copy,
  Download,
  FileText,
  Mic,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Wand2,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChat } from '../../contexts/ChatContext';
import { useViewer } from '../../hooks/useViewer';
import { getGeminiToken } from '../../services/gemini/client';
import { transcribeVoicePrompt } from '../../services/gemini/service';
import FilePreview from '../FilePreview';
import ControllersModal from '../modals/ControllersModal';
import MarkdownShareModal from '../modals/MarkdownShareModal';
import OptimizeModal from '../modals/OptimizeModal';
import RestartModal from '../modals/RestartModal';
import SaveModal from '../modals/SaveModal';
import ShareModal from '../modals/ShareModal';
import { TypewriterText } from './TypewriterText';

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const CoPilot: React.FC = () => {
  const {
    currentConversation,
    isLoading,
    inputText,
    setInputText,
    sendMessage,
    newConversation,
    loadConversation,
    attachedFiles,
    addFile,
    removeFile,
    isUploadingFiles,
    sendFeedback,
  } = useChat();

  const { abrirViewer } = useViewer();

  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isControllersModalOpen, setIsControllersModalOpen] = useState(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [selectedMarkdownContent, setSelectedMarkdownContent] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isTranscribingVoice, setIsTranscribingVoice] = useState(false);
  const [voicePhase, setVoicePhase] = useState<'idle' | 'recording' | 'processing' | 'ready'>(
    'idle'
  );
  const [voiceTranscriptMeta, setVoiceTranscriptMeta] = useState<{
    raw: string;
    organized: string;
    appliedText: string;
    rawAppliedText: string;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputTextRef = useRef(inputText);
  const voiceTranscriptMetaRef = useRef(voiceTranscriptMeta);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 32), 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  useEffect(() => {
    voiceTranscriptMetaRef.current = voiceTranscriptMeta;
  }, [voiceTranscriptMeta]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isUploadingFiles && (inputText.trim() || attachedFiles.length > 0)) {
        sendMessage();
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const openMarkdownModal = (content: string) => {
    setSelectedMarkdownContent(content);
    setIsMarkdownModalOpen(true);
  };

  const hasMessages = useMemo(
    () => (currentConversation?.turns.length || 0) > 0,
    [currentConversation]
  );
  const browserSpeechRecognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  );

  const clearVoiceState = useCallback(() => {
    setVoiceTranscriptMeta(null);
    setVoicePhase('idle');
  }, []);

  const applyVoicePrompt = (rawTranscript: string, organizedPrompt: string) => {
    const basePrompt = inputTextRef.current.trim();
    const mergedPrompt = basePrompt ? `${basePrompt}\n\n${organizedPrompt}` : organizedPrompt;
    const rawAppliedText = basePrompt ? `${basePrompt}\n\n${rawTranscript}` : rawTranscript;
    setVoiceTranscriptMeta({
      raw: rawTranscript,
      organized: organizedPrompt,
      appliedText: mergedPrompt,
      rawAppliedText,
    });
    setVoicePhase('ready');
    setInputText(mergedPrompt);
  };

  const applyRawVoicePrompt = useCallback(() => {
    if (!voiceTranscriptMeta) return;
    const nextPrompt = voiceTranscriptMeta.rawAppliedText;
    setVoiceTranscriptMeta({
      ...voiceTranscriptMeta,
      appliedText: nextPrompt,
    });
    setInputText(nextPrompt);
  }, [setInputText, voiceTranscriptMeta]);

  const transcribeWithBrowserFallback = async () => {
    if (!browserSpeechRecognition) {
      throw new Error('STT indisponível neste navegador.');
    }

    const recognition = new browserSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    return await new Promise<{ transcript: string; organized_prompt: string }>(
      (resolve, reject) => {
        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript?.trim();
          if (!transcript) {
            reject(new Error('Nenhuma fala reconhecida.'));
            return;
          }
          resolve({
            transcript,
            organized_prompt: transcript,
          });
        };
        recognition.onerror = () =>
          reject(new Error('Falha no reconhecimento de fala do navegador.'));
        recognition.start();
      }
    );
  };

  const stopVoiceCapture = async () => {
    if (!isRecordingVoice) return;

    setIsRecordingVoice(false);
    setVoicePhase('processing');
    mediaRecorderRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    mediaStreamRef.current = null;
  };

  const startVoiceCapture = async () => {
    clearVoiceState();
    const geminiToken = await getGeminiToken();

    if (!geminiToken) {
      setVoicePhase('processing');
      const fallback = await transcribeWithBrowserFallback();
      applyVoicePrompt(fallback.transcript, fallback.organized_prompt);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setVoicePhase('processing');
      const fallback = await transcribeWithBrowserFallback();
      applyVoicePrompt(fallback.transcript, fallback.organized_prompt);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    audioChunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || mimeType });
      audioChunksRef.current = [];
      setIsTranscribingVoice(true);
      setVoicePhase('processing');

      try {
        const base64Audio = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        const result = await transcribeVoicePrompt(
          geminiToken,
          base64Audio,
          audioBlob.type || mimeType
        );
        applyVoicePrompt(result.transcript, result.organized_prompt);
      } catch (error) {
        try {
          const fallback = await transcribeWithBrowserFallback();
          applyVoicePrompt(fallback.transcript, fallback.organized_prompt);
        } catch (fallbackError) {
          console.error('Voice capture failed:', error, fallbackError);
        }
      } finally {
        setIsTranscribingVoice(false);
        if (!voiceTranscriptMetaRef.current) {
          setVoicePhase('idle');
        }
      }
    };

    recorder.start();
    setIsRecordingVoice(true);
    setVoicePhase('recording');
  };

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  useEffect(() => {
    if (!voiceTranscriptMeta) {
      if (!isRecordingVoice && !isTranscribingVoice) {
        setVoicePhase('idle');
      }
      return;
    }

    if (inputText !== voiceTranscriptMeta.appliedText) {
      setVoiceTranscriptMeta(null);
      if (!isRecordingVoice && !isTranscribingVoice) {
        setVoicePhase('idle');
      }
    }
  }, [inputText, isRecordingVoice, isTranscribingVoice, voiceTranscriptMeta]);

  const handleInputChange = (value: string) => {
    if (voiceTranscriptMeta && value !== voiceTranscriptMeta.appliedText) {
      clearVoiceState();
    }
    setInputText(value);
  };

  const getVoiceStatusLabel = () => {
    if (voicePhase === 'recording') return 'Gravando voz';
    if (voicePhase === 'processing') return 'Transcrevendo e organizando prompt';
    if (voicePhase === 'ready') return 'Prompt derivado da voz';
    return null;
  };

  const toolbarItems = [
    { icon: FileText, label: 'Biblioteca', onClick: () => abrirViewer('library'), disabled: false },
    {
      icon: Wand2,
      label: 'Otimizar',
      onClick: () => setIsOptimizeModalOpen(true),
      disabled: !inputText.trim(),
    },
    {
      icon: Save,
      label: 'Salvar',
      onClick: () => setIsSaveModalOpen(true),
      disabled: !hasMessages,
    },
    {
      icon: Share2,
      label: 'Partilhar',
      onClick: () => setIsShareModalOpen(true),
      disabled: !hasMessages,
    },
    {
      icon: RotateCcw,
      label: 'Reiniciar',
      onClick: () => setIsRestartModalOpen(true),
      disabled: !hasMessages,
      color: 'text-red-400',
    },
  ];

  return (
    <aside className="w-full h-full glass-panel flex flex-col z-[60] grow-0 pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-0.5 glass-header shrink-0">
        <div className="flex items-center gap-1.5">
          <div
            style={{ backgroundColor: isLoading ? 'var(--glass-accent)' : undefined }}
            className={`w-1.5 h-1.5 ${isLoading ? 'animate-soft-pulse' : 'bg-glass-muted/40'}`}
          ></div>
          <h2 className="text-[9px] uppercase font-bold text-glass tracking-widest opacity-80">
            Tessy CoPilot
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setIsControllersModalOpen(true)}
          className="p-0.5 text-glass-muted hover:text-glass-accent transition-all active:scale-95"
          title="Parâmetros"
        >
          <Settings2 size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 pb-2 relative"
        >
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 animate-fade-in">
              <p className="text-[11px] font-normal tracking-wider italic text-glass-muted">
                READY FOR INSTRUCTION
              </p>
            </div>
          )}

          {currentConversation?.turns.map((turn) => (
            <div key={turn.id} className="space-y-1 animate-fade-in">
              {/* User Message */}
              <div className="flex flex-col items-start gap-0.5">
                <div className="w-full glass-card px-3 py-2 text-sm text-glass leading-relaxed font-normal border-l-2 border-l-glass-muted/30">
                  {turn.userMessage}
                </div>
              </div>

              {/* Tessy Response */}
              <div className="flex flex-col items-start gap-0.5">
                <div className="w-full glass-card px-3 py-2 prose max-w-none font-normal min-h-[40px] border-l-2 border-l-glass-accent/50">
                  {(() => {
                    const isLast =
                      turn.id ===
                      currentConversation?.turns[currentConversation.turns.length - 1].id;
                    if (isLast && isLoading && !turn.tessyResponse) {
                      return (
                        <div className="flex items-center gap-1.5 py-2 px-1">
                          <div className="w-1.5 h-1.5 bg-glass-accent animate-soft-pulse"></div>
                          <div className="w-1.5 h-1.5 bg-glass-accent animate-soft-pulse [animation-delay:200ms]"></div>
                          <div className="w-1.5 h-1.5 bg-glass-accent animate-soft-pulse [animation-delay:400ms]"></div>
                        </div>
                      );
                    }

                    if (!turn.tessyResponse) return null;

                    const markdownRenderer = (content: string) => (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={prismTheme as any}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                                customStyle={{
                                  margin: '0.5rem 0',
                                  padding: '12px',
                                  background: 'rgba(0,0,0,0.3)',
                                  borderRadius: '0',
                                  border: '1px solid var(--glass-border)',
                                  fontSize: '12px',
                                }}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code
                                className="bg-glass-accent/20 px-1 text-glass-accent font-normal"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    );

                    // Apenas aplica o efeito de digitação na última resposta recebida
                    if (isLast && !isLoading) {
                      const handleAutoScroll = () => {
                        if (scrollRef.current) {
                          scrollRef.current.scrollTo({
                            top: scrollRef.current.scrollHeight,
                            behavior: 'auto',
                          });
                        }
                      };
                      return (
                        <TypewriterText
                          text={turn.tessyResponse}
                          onTick={handleAutoScroll}
                          renderFinal={markdownRenderer}
                        />
                      );
                    }

                    // Respostas anteriores já finalizadas renderizam diretamente
                    return markdownRenderer(turn.tessyResponse);
                  })()}

                  {turn.tessyResponse && (
                    <div className="flex items-center justify-end gap-2 mt-2 border-t border-glass pt-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(turn.tessyResponse)}
                        className="p-1 text-glass-muted hover:text-glass-accent transition-all hover:scale-105 active:scale-95"
                        title="Copiar texto"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openMarkdownModal(turn.tessyResponse)}
                        className="p-1 text-glass-muted hover:text-glass-accent transition-all hover:scale-105 active:scale-95"
                        title="Compartilhar em Markdown"
                      >
                        <Download size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => sendFeedback(turn.id, 'positive')}
                        className={`p-1 transition-all ${turn.feedback === 'positive' ? 'text-glass-accent scale-105' : 'text-glass-muted hover:text-glass-accent hover:scale-105 active:scale-95'}`}
                        title="Feedback positivo"
                      >
                        <ThumbsUp
                          size={12}
                          fill={turn.feedback === 'positive' ? 'currentColor' : 'none'}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => sendFeedback(turn.id, 'negative')}
                        className={`p-1 transition-all ${turn.feedback === 'negative' ? 'text-red-400 scale-105' : 'text-glass-muted hover:text-red-400 hover:scale-105 active:scale-95'}`}
                        title="Feedback negativo"
                      >
                        <ThumbsDown
                          size={12}
                          fill={turn.feedback === 'negative' ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 px-1">
                    {turn.groundingChunks.map((chunk) =>
                      chunk.web ? (
                        <a
                          key={chunk.web.uri}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] font-medium uppercase px-2 py-0.5 glass-card text-glass-accent hover:border-glass-accent transition-all tracking-wide"
                        >
                          {chunk.web.title}
                        </a>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3 pt-1 shrink-0">
          <div className="px-1 pb-2 flex items-center gap-3">
            {toolbarItems.map((item) => (
              <button
                type="button"
                key={item.label}
                onClick={item.onClick}
                disabled={item.disabled}
                title={item.label}
                className={`p-1 transition-all ${item.color || 'text-glass-muted hover:text-glass-accent'} ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
              >
                <item.icon size={16} />
              </button>
            ))}
          </div>

          {attachedFiles.length > 0 && (
            <div className="mb-3">
              <FilePreview files={attachedFiles} onRemove={removeFile} />
            </div>
          )}

          {(voicePhase === 'recording' || voicePhase === 'processing' || voiceTranscriptMeta) && (
            <div className="mb-2 glass-card border border-glass/10 px-2 py-1.5 text-[9px] text-glass-muted">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${voicePhase === 'recording' ? 'bg-red-400 animate-soft-pulse' : voicePhase === 'processing' ? 'bg-yellow-400 animate-soft-pulse' : 'bg-glass-accent'}`}
                  ></span>
                  <span className="uppercase tracking-widest text-glass-accent">
                    {getVoiceStatusLabel()}
                  </span>
                </div>
                {voiceTranscriptMeta && (
                  <button
                    type="button"
                    onClick={applyRawVoicePrompt}
                    className="text-[8px] uppercase tracking-widest text-glass-muted hover:text-glass-accent transition-colors"
                  >
                    Usar bruto
                  </button>
                )}
              </div>
              {voiceTranscriptMeta && (
                <p className="mt-1 text-[10px] text-glass-secondary">
                  O marcador some assim que voce editar ou limpar manualmente o texto.
                </p>
              )}
            </div>
          )}

          <div className="flex items-end gap-0 glass-input p-0 focus-within:border-glass-accent transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua instrução..."
              className="flex-1 bg-transparent border-none outline-none text-glass text-sm font-normal resize-none min-h-[24px] py-1 pl-1 leading-relaxed placeholder:text-glass-muted/50 custom-scrollbar transition-[height] duration-200"
            />

            <button
              type="button"
              onClick={() => (isRecordingVoice ? stopVoiceCapture() : startVoiceCapture())}
              disabled={isTranscribingVoice}
              className={`p-1 shrink-0 transition-colors ${isRecordingVoice ? 'text-red-400' : isTranscribingVoice ? 'text-glass-muted opacity-50' : 'text-glass-muted hover:text-glass-accent'}`}
              title={
                isRecordingVoice
                  ? 'Parar gravação'
                  : isTranscribingVoice
                    ? 'Transcrevendo...'
                    : 'Ditar prompt'
              }
            >
              <Mic size={16} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-glass-muted hover:text-glass-accent shrink-0 transition-colors"
              title="Anexar arquivo"
            >
              <Plus size={16} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && addFile(e.target.files[0])}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={
                isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)
              }
              className={`p-1 transition-all ${!inputText.trim() && attachedFiles.length === 0 ? 'text-glass-muted opacity-20' : 'text-glass-accent hover:scale-110 active:scale-90'}`}
              title="Transmitir"
            >
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <OptimizeModal
        isOpen={isOptimizeModalOpen}
        inputText={inputText}
        onClose={() => setIsOptimizeModalOpen(false)}
        onApply={setInputText}
      />
      <SaveModal
        isOpen={isSaveModalOpen}
        conversation={currentConversation}
        onClose={() => setIsSaveModalOpen(false)}
        onSuccess={loadConversation}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        conversation={currentConversation}
        onClose={() => setIsShareModalOpen(false)}
      />
      <RestartModal
        isOpen={isRestartModalOpen}
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => newConversation(true)}
        onSave={() => {
          setIsRestartModalOpen(false);
          setIsSaveModalOpen(true);
        }}
      />
      <ControllersModal
        isOpen={isControllersModalOpen}
        onClose={() => setIsControllersModalOpen(false)}
      />
      <MarkdownShareModal
        isOpen={isMarkdownModalOpen}
        content={selectedMarkdownContent}
        onClose={() => setIsMarkdownModalOpen(false)}
      />
    </aside>
  );
};

export default React.memo(CoPilot);
