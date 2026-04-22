import type React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
// Fix: Split imports between dbService and githubService
import { db, generateUUID } from '../services/dbService';
import {
  getGeminiToken,
  MODEL_FLASH_PREVIEW,
  MODEL_PRO_PREVIEW,
  MODEL_STABLE_FLASH,
  MODEL_STABLE_FLASH_LITE,
  MODEL_STABLE_PRO,
} from '../services/gemini/client';
import { applyFactorsAndGenerate, interpretIntent } from '../services/gemini/service';
import { getGitHubToken } from '../services/githubService';
import type { AttachedFile, Conversation, ConversationTurn, Factor } from '../types';
import { useLayoutContext } from './LayoutContext';
import { useWorkspace } from './WorkspaceContext';

const INITIAL_FACTORS: Factor[] = [
  {
    id: 'tone',
    type: 'dropdown',
    label: 'Tom da Resposta',
    enabled: true,
    value: 'profissional',
    options: ['profissional', 'casual', 'técnico', 'criativo', 'formal'],
  },
  {
    id: 'model',
    type: 'dropdown',
    label: 'Modelo de Linguagem',
    enabled: true,
    value: MODEL_STABLE_FLASH, // Default: gemini-2.5-flash (estável)
    options: [
      MODEL_STABLE_FLASH,
      MODEL_STABLE_PRO,
      MODEL_STABLE_FLASH_LITE,
      MODEL_PRO_PREVIEW,
      MODEL_FLASH_PREVIEW,
    ],
  },
  {
    id: 'format',
    type: 'dropdown',
    label: 'Formato de Saída',
    enabled: true,
    value: 'markdown',
    options: ['markdown', 'texto plano', 'html', 'json'],
  },
  { id: 'grounding', type: 'toggle', label: 'Busca em Tempo Real', enabled: true },
  {
    id: 'detail_level',
    type: 'slider',
    label: 'Nível de Detalhe',
    enabled: true,
    value: 3,
    min: 1,
    max: 5,
  },
  {
    id: 'audience',
    type: 'dropdown',
    label: 'Público-Alvo',
    enabled: true,
    value: 'intermediario',
    options: ['iniciante', 'intermediario', 'avancado', 'especialista', 'executivo'],
  },
  { id: 'context', type: 'text', label: 'Contexto Adicional', enabled: true, value: '' },
];

interface ChatContextType {
  currentConversation: Conversation | null;
  factors: Factor[];
  isLoading: boolean;
  inputText: string;
  attachedFiles: AttachedFile[];
  statusMessage: string;
  isUploadingFiles: boolean;
  conversations: Conversation[];
  refreshConversations: () => Promise<void>;

  setInputText: (text: string) => void;
  setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
  updateFactor: (id: string, value?: any) => void;
  resetFactors: () => void;
  sendMessage: (forcedText?: string) => Promise<void>;
  newConversation: (deleteOld?: boolean) => Promise<void>;
  loadConversation: (conv: Conversation) => void;
  deleteConversation: (id: string) => Promise<void>;
  addFile: (file: File) => void;
  removeFile: (id: string) => void;
  sendFeedback: (turnId: string, type: 'positive' | 'negative') => Promise<void>;
  setCurrentProjectId: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode; currentProjectId: string }> = ({
  children,
  currentProjectId: initialProjectId,
}) => {
  const { setIsAuthPanelOpen } = useLayoutContext();
  const { directoryHandle } = useWorkspace();
  const [activeProjectId, setActiveProjectId] = useState(initialProjectId);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [factors, setFactors] = useState<Factor[]>(INITIAL_FACTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [statusMessage, setStatusMessage] = useState('PRONTO');
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const setCurrentProjectId = useCallback((id: string) => {
    setActiveProjectId(id);
  }, []);

  const refreshConversations = useCallback(async () => {
    if (!activeProjectId) {
      setConversations([]);
      return;
    }
    try {
      const all = await db.conversations.where('projectId').equals(activeProjectId).toArray();

      // Sort in memory to be 100% sure and avoid collection issues
      const sorted = all.sort((a, b) => b.updatedAt - a.updatedAt);
      setConversations(sorted);
    } catch (err) {
      console.error('[refreshConversations] Error:', err);
    }
  }, [activeProjectId]);

  // Load factors once on mount
  useEffect(() => {
    db.settings.get('tessy-factors').then((saved) => {
      if (saved) setFactors(saved.value);
    });
  }, []);

  // Load last conversation for active project whenever project changes
  useEffect(() => {
    const loadProjectConversation = async () => {
      const all = await db.conversations.where('projectId').equals(activeProjectId).toArray();
      const sorted = all.sort((a, b) => b.updatedAt - a.updatedAt);

      if (sorted.length > 0) {
        setCurrentConversation(sorted[0]);
        setConversations(sorted);
      } else {
        // Create a new conversation for this project
        const id = generateUUID();
        const newConv: Conversation = {
          id,
          projectId: activeProjectId,
          title: 'Nova Conversa',
          turns: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        await db.conversations.put(newConv);
        setCurrentConversation(newConv);
        setConversations([newConv]);
      }
      setInputText('');
      setAttachedFiles([]);
      setStatusMessage('PRONTO');
    };
    loadProjectConversation();
  }, [activeProjectId]);

  // Persist Factors
  useEffect(() => {
    db.settings.put({ key: 'tessy-factors', value: factors });
  }, [factors]);

  useEffect(() => {
    if (currentConversation) {
      db.conversations.put(currentConversation).then(() => {
        refreshConversations();
      });
      db.settings.put({ key: 'tessy_last_conv_id', value: currentConversation.id });
    }
  }, [currentConversation, refreshConversations]);

  const updateFactor = (id: string, value?: any) => {
    setFactors((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              enabled: value !== undefined ? true : !f.enabled,
              value: value !== undefined ? value : f.value,
            }
          : f
      )
    );
  };

  const resetFactors = () => {
    setFactors(INITIAL_FACTORS);
  };

  const newConversation = async (deleteOld: boolean = false) => {
    if (deleteOld && currentConversation?.id) {
      const exists = await db.conversations.get(currentConversation.id);
      if (exists) {
        await db.conversations.delete(currentConversation.id);
      }
    }

    const id = generateUUID();
    const newConv: Conversation = {
      id,
      projectId: activeProjectId,
      title: 'Nova Conversa',
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.conversations.put(newConv);
    setCurrentConversation(newConv);
    // refreshConversations will be triggered by currentConversation useEffect
    setInputText('');
    setAttachedFiles([]);
    setStatusMessage('PRONTO');
  };

  const loadConversation = (conv: Conversation) => {
    setCurrentConversation(conv);
    setInputText('');
    setAttachedFiles([]);
    setStatusMessage('PRONTO');
  };

  const deleteConversation = async (id: string) => {
    try {
      await db.conversations.delete(id);

      // Get updated list
      const remaining = await db.conversations.where('projectId').equals(activeProjectId).toArray();

      const sorted = remaining.sort((a, b) => b.updatedAt - a.updatedAt);

      // If we deleted the active conversation, switch to another or create new
      if (currentConversation?.id === id) {
        if (sorted.length > 0) {
          loadConversation(sorted[0]);
        } else {
          await newConversation();
        }
      } else {
        // Just update the list if background conversation was deleted
        setConversations(sorted);
      }
    } catch (err) {
      console.error('[deleteConversation] Error:', err);
    }
  };

  const addFile = (file: File) => {
    setIsUploadingFiles(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      setAttachedFiles((prev) => [
        ...prev,
        {
          id: generateUUID(),
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          size: file.size,
        },
      ]);
      setIsUploadingFiles(false);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const sendMessage = async (forcedText?: string) => {
    if (!currentConversation) return;
    const text = forcedText ?? inputText;
    if (!text.trim() && attachedFiles.length === 0) return;

    const currentInput = text;
    const currentFiles = [...attachedFiles];

    // Optimistic Update: Create Turn immediately
    const tempTurnId = generateUUID();
    const tempTurn: ConversationTurn = {
      id: tempTurnId,
      userMessage: currentInput,
      tessyResponse: '', // Placeholder while loading
      timestamp: Date.now(),
      attachedFiles: currentFiles.length > 0 ? currentFiles : undefined,
    };

    setCurrentConversation((prev) => {
      if (!prev) return null;
      const isFirstMessage = prev.turns.length === 0;
      let newTitle = prev.title;
      if (isFirstMessage) {
        const rawTitle = currentInput.trim();
        newTitle = rawTitle.substring(0, 40) + (rawTitle.length > 40 ? '...' : '');
      }
      return {
        ...prev,
        title: newTitle,
        turns: [...prev.turns, tempTurn],
        updatedAt: Date.now(),
      };
    });

    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStatusMessage('INTERPRETANDO...');

    try {
      const activeProject = await db.projects.get(activeProjectId);
      const repoPath = activeProject?.githubRepo;
      const githubToken = await getGitHubToken();
      const geminiToken = await getGeminiToken();

      if (!geminiToken) {
        // Redireciona para Central de Autenticação (AuthPanel) via estado global
        setIsAuthPanelOpen(true);
        setStatusMessage('CHAVE GEMINI AUSENTE');
        setIsLoading(false);
        return;
      }

      const interpretation = await interpretIntent(
        geminiToken,
        currentInput,
        currentFiles,
        currentConversation.turns
      );

      const groundingEnabled = factors.find((f) => f.id === 'grounding')?.enabled ?? true;

      const generationResult = await applyFactorsAndGenerate(
        geminiToken,
        interpretation,
        currentInput,
        factors,
        currentFiles,
        currentConversation.turns.filter((t) => t.id !== tempTurnId),
        groundingEnabled,
        repoPath,
        githubToken,
        directoryHandle
      );

      // Atualiza com resposta final
      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          turns: prev.turns.map((t) =>
            t.id === tempTurnId
              ? {
                  ...t,
                  tessyResponse: generationResult.text,
                  groundingChunks: generationResult.groundingChunks,
                }
              : t
          ),
          updatedAt: Date.now(),
        };
      });

      setStatusMessage('PRONTO');
    } catch (error) {
      console.error(error);
      setStatusMessage('ERRO');
      // Update turn with error message
      setCurrentConversation((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          turns: prev.turns.map((t) =>
            t.id === tempTurnId
              ? {
                  ...t,
                  tessyResponse: 'Desculpe, ocorreu um erro ao processar sua solicitação.',
                }
              : t
          ),
          updatedAt: Date.now(),
        };
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendFeedback = async (turnId: string, type: 'positive' | 'negative') => {
    if (!currentConversation) return;

    const updatedTurns = currentConversation.turns.map((turn) =>
      turn.id === turnId ? { ...turn, feedback: type } : turn
    );

    const updatedConversation = {
      ...currentConversation,
      turns: updatedTurns,
      updatedAt: Date.now(),
    };

    setCurrentConversation(updatedConversation);
    await db.conversations.put(updatedConversation);

    // Log RLHF (Simulado para JSON por enquanto)
    console.log(`[RLHF] Feedback ${type} recebido para Turno ${turnId}`);
    // Futuro: Enviar para tabela de Logs de Aprendizagem
  };

  return (
    <ChatContext.Provider
      value={{
        currentConversation,
        factors,
        isLoading,
        inputText,
        attachedFiles,
        statusMessage,
        isUploadingFiles,
        setInputText,
        setAttachedFiles,
        updateFactor,
        resetFactors,
        sendMessage,
        newConversation,
        loadConversation,
        deleteConversation,
        addFile,
        removeFile,
        conversations,
        refreshConversations,
        sendFeedback,
        setCurrentProjectId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
