"use client";

import { useState, useEffect, useRef } from "react";
import { getConversations, getMessages, sendMessage, createConversation, getAvailableUsers, clearChat } from "@/actions/chat-actions";
import { useSession } from "next-auth/react";
import { Send, Search, Plus, MessageSquare, MoreVertical, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";

// Interfaces
interface ChatUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
}

interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    read: boolean;
    createdAt: Date;
}

interface Conversation {
    id: string;
    participants: ChatUser[];
    messages: ChatMessage[];
    updatedAt: Date;
    clearedAt?: any;
}

export default function ChatPage() {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Estado del modal de nuevo chat
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
    const [userSearch, setUserSearch] = useState("");
    const [creatingChat, setCreatingChat] = useState(false);

    // Estado del modal de limpiar chat
    const [showClearChatModal, setShowClearChatModal] = useState(false);
    const [chatToClear, setChatToClear] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Cargar conversaciones
    const loadConversations = async () => {
        const result = await getConversations();
        if (result.success && result.data) {
            setConversations(result.data as unknown as Conversation[]);
        }
        setLoading(false);
    };

    // Cargar mensajes para la conversación activa
    const loadMessages = async (conversationId: string) => {
        const result = await getMessages(conversationId);
        if (result.success && result.data) {
            setMessages(result.data as unknown as ChatMessage[]);
            scrollToBottom();
            // Activar la actualización de la notificación
            window.dispatchEvent(new Event('notifications-updated'));
        }
    };

    // Cargar conversaciones iniciales
    useEffect(() => {
        loadConversations();
    }, []);

    // Cargar conversaciones y mensajes
    useEffect(() => {
        const interval = setInterval(() => {
            loadConversations();
            if (activeConversation) {
                loadMessages(activeConversation.id);
            }
        }, 10000); // Cargar cada 10 segundos

        return () => clearInterval(interval);
    }, [activeConversation]);

    // Scroll al finalizar los mensajes
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        setSending(true);
        const result = await sendMessage(activeConversation.id, newMessage);
        if (result.success) {
            setNewMessage("");
            loadMessages(activeConversation.id);
            loadConversations(); // Actualizar la conversación en el sidebar
            window.dispatchEvent(new Event('notifications-updated'));
        }
        setSending(false);
    };

    const handleNewChat = async () => {
        setShowNewChatModal(true);
        const result = await getAvailableUsers();
        if (result.success && result.data) {
            setAvailableUsers(result.data as unknown as ChatUser[]);
        }
    };

    const startConversation = async (userId: string) => {
        setCreatingChat(true);
        const result = await createConversation(userId);
        if (result.success && result.data) {
            setShowNewChatModal(false);
            await loadConversations();
            const updatedConvos = await getConversations();
            if (updatedConvos.success && updatedConvos.data) {
                const typedConvos = updatedConvos.data as unknown as Conversation[];
                setConversations(typedConvos);
                const fullConvo = typedConvos.find(c => c.id === result.data!.id);
                if (fullConvo) {
                    setActiveConversation(fullConvo);
                    loadMessages(fullConvo.id);
                }
            }
        }
        setCreatingChat(false);
    };

    const handleClearChatClick = () => {
        if (activeConversation) {
            setChatToClear(activeConversation.id);
            setShowMenu(false);
            setShowClearChatModal(true);
        }
    };

    const confirmClearChat = async () => {
        if (!chatToClear) return;

        const result = await clearChat(chatToClear);
        if (result.success) {
            // Si eliminamos la conversación activa, limpiamos la vista de mensajes
            if (activeConversation && activeConversation.id === chatToClear) {
                setMessages([]);
                setActiveConversation(null); // Deseleccionamos la conversación ya que desaparece
            }

            setShowClearChatModal(false);
            setChatToClear(null);
            loadConversations();
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(p => p.id !== session?.user?.id) || conversation.participants[0];
    };

    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>;
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Sidebar */}
            <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-xl text-gray-800">Mensajes</h2>
                    <button
                        onClick={handleNewChat}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No tienes conversaciones.</p>
                            <button onClick={handleNewChat} className="text-blue-600 text-sm font-bold mt-2 hover:underline">
                                Iniciar chat
                            </button>
                        </div>
                    ) : (
                        conversations.map(convo => {
                            const other = getOtherParticipant(convo);
                            const lastMsg = convo.messages[0];
                            const isActive = activeConversation?.id === convo.id;

                            return (
                                <div
                                    key={convo.id}
                                    onClick={() => {
                                        setActiveConversation(convo);
                                        loadMessages(convo.id);
                                        setShowMenu(false);
                                    }}
                                    className={`group relative p-4 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${isActive ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="relative w-12 h-12 flex-shrink-0">
                                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm overflow-hidden">
                                            {other.image ? (
                                                <Image
                                                    src={other.image}
                                                    alt={other.name}
                                                    width={48}
                                                    height={48}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                other.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold text-gray-900 truncate">{other.name}</h3>
                                            {lastMsg && (
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm truncate ${!lastMsg?.read && lastMsg?.senderId !== session?.user?.id ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                                            {lastMsg ? (
                                                lastMsg.senderId === session?.user?.id ? `Tú: ${lastMsg.content}` : lastMsg.content
                                            ) : (
                                                <span className="italic text-gray-400">Nueva conversación</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Botón de opciones */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === convo.id ? null : convo.id);
                                            }}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {/* Menu desplegable */}
                                        {openMenuId === convo.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(null);
                                                    }}
                                                />
                                                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setChatToClear(convo.id);
                                                            setShowClearChatModal(true);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Ventana de chat */}
            {activeConversation ? (
                <div className={`flex-1 flex flex-col bg-white ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10 relative">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveConversation(null)}
                                className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                                {getOtherParticipant(activeConversation).image ? (
                                    <Image
                                        src={getOtherParticipant(activeConversation).image!}
                                        alt=""
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    getOtherParticipant(activeConversation).name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{getOtherParticipant(activeConversation).name}</h3>
                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    En línea
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                                    <button
                                        onClick={handleClearChatClick}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Limpiar chat
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <p className="text-sm">No hay mensajes en esta conversación.</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.senderId === session?.user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 text-gray-400">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600">Tus Mensajes</h3>
                    <p className="text-sm max-w-xs text-center mt-2">Selecciona una conversación o inicia un nuevo chat para comenzar a comunicarte.</p>
                </div>
            )}

            {/* Modal de nuevo chat */}
            <Modal
                isOpen={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                title="Nuevo Chat"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar persona..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {filteredUsers.length === 0 ? (
                            <p className="text-center text-gray-500 py-4 text-sm">No se encontraron usuarios.</p>
                        ) : (
                            filteredUsers.map(user => (
                                <button
                                    key={user.id}
                                    onClick={() => startConversation(user.id)}
                                    disabled={creatingChat}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors overflow-hidden">
                                        {user.image ? (
                                            <Image
                                                src={user.image}
                                                alt={user.name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{user.name}</h4>
                                        <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal de confirmación de limpiar chat */}
            <Modal
                isOpen={showClearChatModal}
                onClose={() => setShowClearChatModal(false)}
                title="Limpiar Chat"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-500 text-sm">
                            Esta acción borrará todos los mensajes de esta conversación para ti. Los otros participantes seguirán viendo el historial.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowClearChatModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmClearChat}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                        >
                            Limpiar Chat
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function ArrowLeft({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
        </svg>
    )
}
