'use client';

import { useAuthStore } from '@/app/store';
import { Channel, Message } from '@/types/types';
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !params?.id) return;

    let cancelled = false;
    setChannelsLoading(true);
    setError(null);

    const fetchChannels = async () => {
      try {
        const result = await fetch(
          `https://3j20j2tc-5000.uks1.devtunnels.ms/api/channels/${params.id}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        const res = await result.json();
        if (cancelled) return;
        if (res.message) {
          setError(res.message);
          setChannels([]);
        } else {
          setChannels(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load channels');
          setChannels([]);
        }
      } finally {
        if (!cancelled) setChannelsLoading(false);
      }
    };

    fetchChannels();
    return () => { cancelled = true; };
  }, [user, params?.id]);

  useEffect(() => {
    if (!selectedChannel) return;
    const handler = ({ userId, status }: { userId: string; status: 'online' | 'offline' }) => {
      setSelectedChannel((prev) => {
        if (!prev?.workspace?.members) return prev;
        return {
          ...prev,
          workspace: {
            ...prev.workspace,
            members: prev.workspace.members.map((m) =>
              m._id === userId ? { ...m, status } : m
            ) as Channel['workspace']['members'],
          },
        };
      });
    };
    socket.on('status_update', handler);
    return () => { socket.off('status_update', handler); };
  }, [selectedChannel]);

  useEffect(() => {
    socket.on('receive_message', (newM: Message) => {
      setMessages((prev) => [...prev, newM]);
      setTypingUser('');
    });
    return () => { socket.off('receive_message'); };
  }, [messages]);

  useEffect(() => {
    const handler = (name: string) => {
      if (name === user?.name) return;
      setTypingUser(name);
      setTimeout(() => setTypingUser(''), 2000);
    };
    socket.on('user_typing', handler);
    return () => { socket.off('user_typing', handler); };
  }, [user?.name]);

  const handleChannelChange = useCallback(async (c: Channel) => {
    setSelectedChannel(c);
    setMessages([]);
    setMessage('');
    setMessagesLoading(true);
    setError(null);
    socket.emit('join_channel', {channelId: c._id, userId: user?._id});

    try {
      const result = await fetch(`https://3j20j2tc-5000.uks1.devtunnels.ms/api/messages/${c._id}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );
      const res = await result.json();
      if (res.message) {
        setError(res.message);
        setMessages([]);
      } else {
        setMessages(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!selectedChannel || !message.trim()) return;
    // setSendLoading(true);
    setError(null);
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
      await handleChannelChange(selectedChannel!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } 
  };

  const memberCount = selectedChannel?.workspace?.members?.length ?? 0;

  return (
    <div className="grid md:flex h-full">
      {/* Channel list */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-surface p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Channels
        </h2>
        {channelsLoading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : error && channels.length === 0 ? (
          <p className="mt-3 text-sm text-error">{error}</p>
        ) : channels.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No channels yet.</p>
        ) : (
          <nav className="mt-3 space-y-1">
            {channels.map((c) => (
              <button
                key={c._id}
                onClick={() => handleChannelChange(c)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  selectedChannel?._id === c._id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-surface-muted'
                }`}
              >
                {c.name}
              </button>
            ))}
          </nav>
        )}
      </aside>

      {/* Main chat */}
      <section className="flex min-w-0 flex-1 flex-col bg-surface">
        {selectedChannel ? (
          <>
            <header className="shrink-0 border-b border-border px-5 py-3.5">
              <h1 className="text-lg font-semibold text-foreground">
                {selectedChannel.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
                {typingUser && (
                  <span className="ml-2 text-typing animate-pulse">
                    · {typingUser} typing…
                  </span>
                )}
              </p>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
              {error && (
                <div className="mb-4 rounded-lg border border-error/30 bg-error-muted px-4 py-2.5 text-sm text-error">
                  {error}
                </div>
              )}
{
              messages.length === 0 ? (
                <EmptyState
                  title="No messages yet"
                  description="Send a message to start the conversation."
                />
              ) : (
                <div className="space-y-4 overflow-y-auto pr-2 pb-1">
                  {messages.map((m) => (
                    <div
                      key={m._id}
                      className={`flex items-end gap-2.5 ${m.sender._id === user?._id ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                          <path
                            fillRule="evenodd"
                            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                          />
                        </svg>
                      </div>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                          m.sender._id === user?._id
                            ? 'rounded-br-md bg-primary text-primary-foreground'
                            : 'rounded-bl-md bg-surface-muted text-foreground'
                        }`}
                      >
                        <p className={`text-xs font-semibold ${m.sender._id === user?._id ? 'opacity-90' : 'text-primary'}`}>
                          {m.sender.name}
                        </p>
                        <p className="text-sm mt-0.5">{m.content}</p>
                      </div>
                      <span
                        className="text-xs text-muted-foreground shrink-0"
                        title={m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                      >
                        {formatMessageTime(m.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex shrink-0 gap-2.5">
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState
              title="Select a channel"
              description="Choose a channel from the list to view and send messages."
            />
          </div>
        )}
      </section>

      {/* Members panel */}
      <aside className="w-64 shrink-0 border-l border-border bg-surface flex flex-col">
        {selectedChannel && (
          <div className="flex flex-col overflow-hidden p-4">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted text-primary text-xl font-semibold">
                {selectedChannel.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="mt-3 font-semibold text-foreground truncate px-1">
                {selectedChannel.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="mt-5 flex-1 overflow-y-auto border-t border-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Members
              </h4>
              <ul className="mt-3 space-y-2.5">
                {selectedChannel.workspace?.members?.map((m) => (
                  <li
                    key={m._id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`block h-2 w-2 shrink-0 rounded-full ${
                          m.status === 'online' ? 'bg-online' : 'bg-offline'
                        }`}
                        title={m.status}
                      />
                      <span className="truncate font-medium text-foreground">
                        {m.name}
                        {user?._id === m._id && (
                          <span className="ml-1 text-muted-foreground">(you)</span>
                        )}
                      </span>
                    </div>
                    {m.role === 'admin' && (
                      <span className="shrink-0 text-xs text-muted-foreground">
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
