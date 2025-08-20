"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Input,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea
} from "@/components/ui/custom/prompt/input";
import { Button } from "@/components/ui/button";
import {
  ArrowUpIcon,
  Paperclip,
  SquareIcon,
  X,
  Plus,
  History,
  Trash2,
  Menu,
  MessageSquare
} from "lucide-react";
import { Suggestion } from "@/components/ui/custom/prompt/suggestion";
import { ChatContainer } from "@/components/ui/custom/prompt/chat-container";
import { Message, MessageContent } from "@/components/ui/custom/prompt/message";
import { Markdown } from "@/components/ui/custom/prompt/markdown";
import { cn } from "@/lib/utils";
import { PromptLoader } from "@/components/ui/custom/prompt/loader";
import { PromptScrollButton } from "@/components/ui/custom/prompt/scroll-button";

const chatSuggestions = [
  "Qual é a última tendência em tecnologia?",
  "Como isso funciona?",
  "Gere uma imagem de um gato",
  "Gere uma API REST com Express.js",
  "Qual é a melhor UX para onboarding?"
];

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // Interface para o histórico de conversas

interface Conversa {
  id: string;
  titulo: string;
  timestamp: number;
  mensagens: { id: number; role: string; conteudo: string; arquivos?: File[] }[];
}

export default function AppRender() {
  const [prompt, setPrompt] = useState("");
  const [arquivos, setArquivos] = useState<File[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [isFirstResponse, setIsFirstResponse] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const streamControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [mensagens, setMensagens] = React.useState<
    { id: number; role: string; conteudo: string; arquivos?: File[] }[]
  >([]);

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [idConversaAtual, setIdConversaAtual] = useState<string | null>(null);
  // Verificar se é mobile na inicialização e no redimensionamento
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carregar conversas do localStorage ao inicializar
  useEffect(() => {
    const conversasSalvas = localStorage.getItem("chatConversas");
    if (conversasSalvas) {
      try {
        setConversas(JSON.parse(conversasSalvas));
      } catch (e) {
        console.error("Erro ao carregar conversas do localStorage", e);
      }
    }
  }, []);

  // Salvar conversas no localStorage sempre que mudarem
  useEffect(() => {
    if (conversas.length > 0) {
      localStorage.setItem("chatConversas", JSON.stringify(conversas));
    }
  }, [conversas]);

  // Iniciar uma nova conversa
  const iniciarNovaConversa = () => {
    // Salvar a conversa atual se houver mensagens
    if (mensagens.length > 0) {
      salvarConversaAtual();
    }

    // Limpar mensagens atuais
    setMensagens([]);
    setPrompt("");
    setArquivos([]);
    setIsFirstResponse(false);
    setIdConversaAtual(null);

    // Fechar o histórico em mobile após seleção
    if (isMobile) {
      setShowHistory(false);
    }
  };

  // Salvar a conversa atual no histórico
  const salvarConversaAtual = () => {
    if (mensagens.length === 0) return;

    const titulo =
      mensagens[0]?.conteudo?.substring(0, 30) +
        (mensagens[0]?.conteudo?.length > 30 ? "..." : "") || "Nova Conversa";

    const novaConversa: Conversa = {
      id: idConversaAtual || Date.now().toString(),
      titulo,
      timestamp: Date.now(),
      mensagens: [...mensagens]
    };

    if (idConversaAtual) {
      // Atualizar conversa existente
      setConversas((prev) =>
        prev.map((conv) => (conv.id === idConversaAtual ? novaConversa : conv))
      );
    } else {
      // Adicionar nova conversa
      setConversas((prev) => [novaConversa, ...prev]);
      setIdConversaAtual(novaConversa.id);
    }
  };

  // Carregar uma conversa do histórico
  const carregarConversa = (idConversa: string) => {
    // Salvar a conversa atual primeiro, se houver
    if (mensagens.length > 0 && idConversaAtual !== idConversa) {
      salvarConversaAtual();
    }

    const conversa = conversas.find((conv) => conv.id === idConversa);
    if (conversa) {
      setMensagens(conversa.mensagens);
      setIdConversaAtual(idConversa);
      setIsFirstResponse(conversa.mensagens.length > 0);

      // Fechar o histórico em mobile após seleção
      if (isMobile) {
        setShowHistory(false);
      }
    }
  };

  // Excluir uma conversa do histórico
  const excluirConversa = (idConversa: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Impedir que o evento de clique propague para o elemento pai
    setConversas((prev) => prev.filter((conv) => conv.id !== idConversa));

    // Se a conversa atual foi excluída, iniciar uma nova
    if (idConversaAtual === idConversa) {
      iniciarNovaConversa();
    }
  };

  // Limpar todo o histórico
  const limparTodoHistorico = () => {
    setConversas([]);
    localStorage.removeItem("chatConversas");
  };

  const streamResponse = async () => {
    if (isStreaming) {
      // Se já está streaming, cancela a requisição atual
      if (streamControllerRef.current) {
        streamControllerRef.current.abort();
      }
      setIsStreaming(false);
      return;
    }

    if (prompt.trim() || arquivos.length > 0) {
      setIsFirstResponse(true);
      setIsStreaming(true);

      const newMessageId = mensagens.length > 0 ? Math.max(...mensagens.map((m) => m.id)) + 1 : 1;

      // Adiciona mensagem do usuário
      setMensagens((prev) => [
        ...prev,
        {
          id: newMessageId,
          role: "user",
          conteudo: prompt,
          arquivos: arquivos
        }
      ]);

      // Adiciona placeholder para a resposta do assistente
      setMensagens((prev) => [
        ...prev,
        {
          id: newMessageId + 1,
          role: "assistant",
          conteudo: ""
        }
      ]);

      setPrompt("");
      setArquivos([]);

      try {
        const controller = new AbortController();
        streamControllerRef.current = controller;

        // Prepara o histórico de mensagens para a API
        const messageHistory = [
          {
            role: "system",
            content: "Você é um assistente útil. Forneça respostas claras e concisas."
          },
          ...mensagens.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.conteudo
          })),
          { role: "user", content: prompt }
        ];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: messageHistory,
            stream: true,
            max_tokens: 1000
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ") && line !== "data: [DONE]") {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices[0].delta.content) {
                    assistantMessage += data.choices[0].delta.content;

                    // Atualiza a mensagem em tempo real
                    setMensagens((prev) =>
                      prev.map((msg) =>
                        msg.id === newMessageId + 1 ? { ...msg, conteudo: assistantMessage } : msg
                      )
                    );
                  }
                } catch (e) {
                  // Ignora erros de parsing em chunks incompletos
                }
              }
            }
          }
        }

        // Salvar a conversa após receber a resposta
        setTimeout(() => {
          salvarConversaAtual();
        }, 100);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Requisição cancelada");
        } else {
          console.error("Erro:", error);
          // Adiciona mensagem de erro
          setMensagens((prev) =>
            prev.map((msg) =>
              msg.id === newMessageId + 1
                ? {
                    ...msg,
                    conteudo:
                      "❌ Erro ao gerar resposta. Por favor, verifique sua chave de API e tente novamente."
                  }
                : msg
            )
          );
        }
      } finally {
        setIsStreaming(false);
        streamControllerRef.current = null;
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setArquivos((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  const FileListItem = ({
    file,
    dismiss = true,
    index
  }: {
    file: File;
    dismiss?: boolean;
    index: number;
  }) => (
    <div className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
      <Paperclip className="size-4" />
      <span className="max-w-[120px] truncate">{file.name}</span>
      {dismiss && (
        <button
          onClick={() => handleRemoveFile(index)}
          className="hover:bg-secondary/50 rounded-full p-1">
          <X className="size-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="bg-background flex h-full w-full">
      {/* Sidebar de histórico - 20% da tela */}
      <div
        className={cn(
          "bg-muted/20 flex w-2/12 flex-col border-r transition-all duration-300",
          isMobile ? "fixed inset-y-0 left-0 z-50" : "relative",
          isMobile && !showHistory && "-translate-x-full"
        )}>
        <div>
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-primary" size={24} />
              <h1 className="text-xl font-bold">Assistente AI</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(false)}
              className={cn("md:hidden")}>
              <X size={18} />
            </Button>
          </div>

          <div className="p-4">
            <Button
              variant="default"
              className="mb-4 w-full justify-center gap-2"
              onClick={iniciarNovaConversa}>
              <Plus size={16} />
              Novo Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-muted-foreground text-sm font-semibold">CHATS RECENTES</h2>
              {conversas.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparTodoHistorico}
                  className="text-muted-foreground hover:text-destructive h-7 text-xs">
                  Limpar tudo
                </Button>
              )}
            </div>

            {conversas.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Nenhum histórico de conversa
              </p>
            ) : (
              <div className="space-y-1">
                {conversas.map((conversa) => (
                  <div
                    key={conversa.id}
                    onClick={() => carregarConversa(conversa.id)}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between rounded-md p-3",
                      idConversaAtual === conversa.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{conversa.titulo}</p>
                      <p
                        className={cn(
                          "truncate text-xs",
                          idConversaAtual === conversa.id
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}>
                        {new Date(conversa.timestamp).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => excluirConversa(conversa.id, e)}
                      className={cn(
                        "h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100",
                        idConversaAtual === conversa.id
                          ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20"
                          : "text-muted-foreground hover:text-destructive"
                      )}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal - 80% da tela */}
      <div className="flex w-10/12 flex-1 flex-col">
        {/* Header para mobile */}
        <div className="border-b p-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)}>
            <Menu size={20} />
          </Button>
        </div>

        {/* Área de chat */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer
            className={cn("h-full w-full space-y-4 px-4 pb-4", { hidden: !isFirstResponse })}
            ref={containerRef}
            scrollToRef={bottomRef}>
            {mensagens.map((mensagem) => {
              const isAssistant = mensagem.role === "assistant";
              return (
                <Message
                  key={mensagem.id}
                  className={mensagem.role === "user" ? "justify-end" : "justify-start"}>
                  <div
                    className={cn("max-w-[85%] flex-1 sm:max-w-[75%]", {
                      "justify-end text-end": !isAssistant
                    })}>
                    {isAssistant ? (
                      <div className="bg-muted text-foreground prose rounded-lg border px-3 py-2">
                        <Markdown className={"space-y-4"}>{mensagem.conteudo}</Markdown>
                      </div>
                    ) : mensagem?.arquivos && mensagem.arquivos.length > 0 ? (
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex flex-wrap justify-end gap-2">
                          {mensagem.arquivos.map((arquivo, index) => (
                            <FileListItem
                              key={index}
                              index={index}
                              file={arquivo}
                              dismiss={false}
                            />
                          ))}
                        </div>
                        {mensagem.conteudo ? (
                          <MessageContent className="bg-primary text-primary-foreground inline-flex">
                            {mensagem.conteudo}
                          </MessageContent>
                        ) : null}
                      </div>
                    ) : (
                      <MessageContent className="bg-primary text-primary-foreground inline-flex text-start">
                        {mensagem.conteudo}
                      </MessageContent>
                    )}
                  </div>
                </Message>
              );
            })}

            {isStreaming && (
              <div className="ps-2">
                <PromptLoader variant="pulse-dot" />
              </div>
            )}
          </ChatContainer>

          {/* Sugestões para primeira interação */}
          {!isFirstResponse && (
            <div className="flex h-full flex-col items-center justify-center pb-32">
              <div className="mx-auto max-w-lg px-4 text-center">
                <h2 className="mb-6 text-2xl font-bold">Como posso ajudá-lo hoje?</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {chatSuggestions.map((suggestion: string, key: number) => (
                    <Suggestion key={key} onClick={() => setPrompt(suggestion)}>
                      {suggestion}
                    </Suggestion>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área de entrada fixa na parte inferior */}
        <div className="bg-background sticky bottom-0 border-t p-4">
          <div className="mx-auto max-w-4xl">
            <Input
              value={prompt}
              onValueChange={setPrompt}
              onSubmit={streamResponse}
              className="w-full">
              {arquivos.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {arquivos.map((arquivo, index) => (
                    <FileListItem key={index} index={index} file={arquivo} />
                  ))}
                </div>
              )}

              <PromptInputTextarea placeholder="Pergunte-me qualquer coisa..." />

              <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                <PromptInputAction tooltip="Anexar arquivos">
                  <label
                    htmlFor="file-upload"
                    className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Paperclip className="text-primary size-5" />
                  </label>
                </PromptInputAction>

                <PromptInputAction tooltip={isStreaming ? "Parar geração" : "Enviar mensagem"}>
                  <Button
                    variant="default"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={streamResponse}>
                    {isStreaming ? <SquareIcon /> : <ArrowUpIcon />}
                  </Button>
                </PromptInputAction>
              </PromptInputActions>
            </Input>
          </div>
        </div>

        {/* Botão de scroll para mobile */}
        <div className="fixed right-4 bottom-20 md:bottom-4">
          <PromptScrollButton
            containerRef={containerRef}
            scrollRef={bottomRef}
            className="shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
