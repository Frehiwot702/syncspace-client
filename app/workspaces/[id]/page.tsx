'use client';

import { useAuthStore } from '@/app/store';
import { useToastStore } from '@/app/toast-store';
import { Channel, Message } from '@/types/types';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { io } from 'socket.io-client';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

const socket = io('https://3j20j2tc-5000.uks1.devtunnels.ms');

function formatMessageTime(iso?: string): string {
  if (!iso) return 'Just now';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 60_000) return 'Just now';
    if (diffMs < 86400_000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Just now';
  }
}

export default function WorkspacePage() {
  const user = useAuthStore((state) => state.user);
  const toast = useToastStore((s) => s.add);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const refreshChannels = useCallback(async () => {
    // TODO: replace with actual API when available, e.g. GET /api/workspaces/:id/channels
    setChannelsLoading(true);
    try {
      // Placeholder: no API in codebase; channels stay [] until backend provides endpoint
      setChannels([]);
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  useEffect(() => {
    if (!selectedChannel) return;
    const handler = ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setSelectedChannel((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          workspace: {
            ...prev.workspace,
            members: prev.workspace.members.map((m) =>
              m._id === userId ? { ...m, status } : m
            ),
          },
        };
      });
    };
    socket.on('status_update', handler);
    return () => socket.off('status_update', handler);
  }, [selectedChannel]);

  useEffect(() => {
    socket.on('receive_message', (newM: Message) => {
      setMessages((prev) => [...prev, newM]);
      setTypingUser('');
    });
    return () => socket.off('receive_message');
  }, []);

  useEffect(() => {
    const handler = (name: string) => {
      if (name === user?.name) return;
      setTypingUser(name);
      setTimeout(() => setTypingUser(''), 2000);
    };
    socket.on('user_typing', handler);
    return () => socket.off('user_typing', handler);
  }, [user?.name]);

  const handleChannelChange = useCallback(
    async (c: Channel) => {
      setSelectedChannel(c);
      setMessages([]);
      setMessagesLoading(true);
      socket.emit('join_channel', c._id);
      try {
        const result = await fetch(
          `https://3j20j2tc-5000.uks1.devtunnels.ms/api/messages/${c._id}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        const res = await result.json();
        setMessages(Array.isArray(res) ? res : []);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load messages';
        toast('error', msg);
      } finally {
        setMessagesLoading(false);
      }
    },
    [toast]
  );

  const handleSendMessage = async () => {
    if (!selectedChannel || !message.trim()) return;
    setSendLoading(true);
    try {
      await fetch('https://3j20j2tc-5000.uks1.devtunnels.ms/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: selectedChannel._id,
          sender: user?._id,
          content: message.trim(),
        }),
      });
      setMessage('');
      await handleChannelChange(selectedChannel);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send';
      toast('error', msg);
    } finally {
      setSendLoading(false);
    }
  };

  const memberCount = selectedChannel?.workspace.members.length ?? 0;

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      {/* Channel list */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Channels
        </h2>
        {channelsLoading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : channels.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No channels in this workspace.
          </p>
        ) : (
          <nav className="mt-3 space-y-1">
            {channels.map((c) => (
              <button
                key={c._id}
                onClick={() => handleChannelChange(c)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selectedChannel?._id === c._id
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* Main chat */}
      <section className="flex min-w-0 flex-1 flex-col bg-[var(--surface)]">
        {selectedChannel ? (
          <>
            <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <div>
                <h1 className="text-lg font-semibold text-[var(--foreground)]">
                  {selectedChannel.name}
                </h1>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {memberCount} member{memberCount !== 1 ? 's' : ''}
                  {typingUser && (
                    <span className="ml-2 text-[var(--typing)] animate-pulse">
                      · {typingUser} typing…
                    </span>
                  )}
                </p>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
              {messagesLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-8 w-40" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  title="No messages yet"
                  description="Send a message to start the conversation."
                />
              ) : (
                <div className="space-y-4 overflow-y-auto">
                  {messages.map((m) => (
                    <div
                      key={m._id}
                      className={`flex items-end gap-2 ${
                        m.sender._id === user?._id ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted-foreground)]">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                          <path
                            fillRule="evenodd"
                            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                          />
                        </svg>
                      </div>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          m.sender._id === user?._id
                            ? 'rounded-br-md bg-[var(--primary)] text-[var(--primary-foreground)]'
                            : 'rounded-bl-md bg-[var(--surface-muted)] text-[var(--foreground)]'
                        }`}
                      >
                        <p className={`text-xs font-semibold ${m.sender._id === user?._id ? 'opacity-90' : 'text-[var(--primary)]'}`}>
                          {m.sender.name}
                        </p>
                        <p className="text-sm">{m.content}</p>
                      </div>
                      <span
                        className={`text-xs text-[var(--muted-foreground)] ${
                          m.sender._id === user?._id ? 'text-right' : ''
                        }`}
                        title={m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                      >
                        {formatMessageTime(m.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex shrink-0 gap-2">
                <input
                  type="text"
                  value={message}
                  placeholder="Type a message…"
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (selectedChannel && user?.name) {
                      socket.emit('typing', {
                        channelId: selectedChannel._id,
                        userName: user.name,
                      });
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <Button
                  variant="primary"
                  size="md"
                  loading={sendLoading}
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="Select a channel"
            description="Choose a channel from the list to view and send messages."
          />
        )}
      </section>

      {/* Members panel */}
      <aside className="hidden w-64 shrink-0 border-l border-[var(--border)] bg-[var(--surface)] lg:block">
        {selectedChannel && (
          <div className="p-4">
            <div className="text-center">
              <Image
                src="/image2.jpg"
                alt=""
                width={80}
                height={80}
                className="mx-auto h-20 w-20 rounded-full object-cover"
              />
              <h3 className="mt-3 font-semibold text-[var(--foreground)]">
                {selectedChannel.name}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Members
              </h4>
              <ul className="mt-2 space-y-3">
                {selectedChannel.workspace.members.map((m) => (
                  <li
                    key={m._id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`block h-2 w-2 shrink-0 rounded-full ${
                          m.status === 'online' ? 'bg-[var(--online)]' : 'bg-[var(--offline)]'
                        }`}
                        title={m.status}
                      />
                      <span className="truncate font-medium text-[var(--foreground)]">
                        {m.name}
                        {user?._id === m._id && (
                          <span className="ml-1 text-[var(--muted-foreground)]">(you)</span>
                        )}
                      </span>
                    </div>
                    {m.role === 'admin' && (
                      <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
                        Admin
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
