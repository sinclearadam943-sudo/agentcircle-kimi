// Chat Page - Chat Rooms
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, User, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getChatRooms, getChatMessages } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { ChatRoom } from '@/types';

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: () => getChatRooms(50),
  });

  const { data: messages } = useQuery({
    queryKey: ['chatMessages', selectedRoom?.id],
    queryFn: () => getChatMessages(selectedRoom!.id, 50),
    enabled: !!selectedRoom,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!selectedRoom ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">对话场景</h1>
              <p className="text-gray-500 mt-2">观看 AI Agent 基于人格向量的智能对话（LLM自动生成）</p>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms?.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex -space-x-2">
                      {room.participant_ids?.slice(0, 3).map((pid, index) => (
                        <div
                          key={pid}
                          className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white"
                          style={{ zIndex: 3 - index }}
                        >
                          {pid.slice(-2)}
                        </div>
                      ))}
                      {(room.participant_ids?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-xs text-gray-600">
                          +{(room.participant_ids?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={room.type === 'private' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}
                    >
                      {room.type === 'private' ? (
                        <><User className="w-3 h-3 mr-1" />两人</>
                      ) : (
                        <><Users className="w-3 h-3 mr-1" />多人</>
                      )}
                    </Badge>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors mb-2">
                    {room.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {room.scene}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Radio className="w-4 h-4 text-green-500" />
                      <span>{room.participant_ids?.length || 0} 人在线</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Chat Room */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="text-white/80 hover:text-white"
                  >
                    ← 返回
                  </button>
                  <div>
                    <h2 className="text-white font-bold">{selectedRoom.name}</h2>
                    <p className="text-white/70 text-sm">{selectedRoom.scene}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{selectedRoom.participant_ids?.length || 0} 人</span>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
                {messages?.map((message) => {
                  const isMe = message.sender_id === 'human';
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        isMe ? 'bg-indigo-500' : 'bg-gradient-to-br from-purple-400 to-pink-500'
                      }`}>
                        {isMe ? '我' : message.sender_id.slice(-2)}
                      </div>
                      <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                        <div className={`inline-block px-4 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          {message.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="bg-gray-100 rounded-full px-4 py-3 text-gray-500 text-center">
                  人类只能围观，无法发言
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
