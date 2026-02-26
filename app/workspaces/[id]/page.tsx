'use client'
import { useAuthStore, useWorkspaceStore } from '@/app/store';
import { Channel, Message } from '@/types/types';
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
import Image from 'next/image';

import { io } from 'socket.io-client';

const socket = io("https://3j20j2tc-5000.uks1.devtunnels.ms")

const Workspace = () => {

    const user = useAuthStore((state) => state.user);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [typingUser, setTypingUser] = useState('');
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);


    // live user status update
    useEffect(() => {
        if(!selectedChannel) return;
        
        socket.on("status_update", ({ userId, status }) => {
            setSelectedChannel((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    workspace: {
                        ...prev.workspace,
                        members: prev.workspace.members.map((member) =>
                            member._id === userId
                                ? { ...member, status }
                                : member
                        )
                    }
            };
        });
        return () => {
            socket.off("user_typing");
        };
        })
    
    }, [selectedChannel]);


    // live message update
    useEffect(() => {
        socket.on("receive_message", (newM) => {
            setMessages((prev) => [...prev, newM]);

            setTimeout(() => {
                setTypingUser('');
            }, 2000);
        });

        return () => {
            socket.off("receive_message");
        };
    }, []);


    // live user typing status
    useEffect(() => {
        socket.on("user_typing", (name) => {

            if(name === user?.name) return;
            setTypingUser(name);
            console.log('typing username: ', typingUser);

            // console.log('user typing name: ', name)
            setTimeout(() => {
                setTypingUser('');
            }, 2000);
        });
        return () => {
            socket.off("user_typing");
        };
    });
    

    const handleChannelChange = async (c: Channel) => {
        setSelectedChannel(c);
        setMessages([]);

        socket.emit("join_channel", c._id);
        
        try {
            const result = await fetch(`https://3j20j2tc-5000.uks1.devtunnels.ms/api/messages/${c._id}`,
                {   method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }
            )
            const res = await result.json();
            setMessages(res);
            return;
        } catch(error) {
            alert(error)
        }
    }

    const handleSendMessage = async () => {
        setLoading(true);
        try {
            await fetch(`https://3j20j2tc-5000.uks1.devtunnels.ms/api/messages/send`,
                {   method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        channel: selectedChannel?._id,
                        sender: user?._id,
                        content: message
                    })
                }
            )
            setMessage('');
            setLoading(false);
            await handleChannelChange(selectedChannel!);

            return;
        } catch(error) {
            alert(error);
            setLoading(false);
        }
    }

  return (
    <div>
        <div className='flex py-10 px-5 mt-10 space-x-10'>
            <div className='w-92 h-full'>
                <h3 className='text-xl font-semibold'>Groups</h3>
                <div className='space-y-3 py-3'>
                    {channels?.map((c) => (
                        <div key={c._id}>
                            <button 
                                onClick={() => handleChannelChange(c)} 
                                style={{backgroundColor: selectedChannel?._id === c._id ? '#A71A15' : '#ffffff', color: selectedChannel?._id === c._id ? '#ffffff' : '#000000'}}
                                className={`w-full rounded-full text-start px-4 py-2 cursor-pointer`}>
                                {c.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
           { selectedChannel ? ( 
            <>
                <div className='h-screen relative border border-black/5 rounded-md w-full shadow'>
                    <div className='border-b-2 border-black/5 py-3 px-5'>
                        <h3 className='text-xl font-semibold bg-[A71A15] '>{selectedChannel?.name}</h3>
                        {typingUser ? <h3 className='py-2 text-black/50 animate-pulse'>{typingUser} is typing...</h3> : <p>7 members</p>}
                    </div>
                    <div className='py-5 px-4 min-h-full flex flex-col'>
                        {messages ? (
                            <div className='space-y-3'>
                                {messages.map((m) => (
                                    <div key={m._id} className={`flex items-end space-x-3 ${m.sender._id === user?._id ? 'flex-row-reverse' : 'flex'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-person-circle" viewBox="0 0 16 16">
                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                        </svg>
                                        <div 
                                            key={m._id} 
                                            className={`${user?._id === m.sender._id ? 'bg-[#f2cdcc]' : 'bg-[#F2E8E9]'} px-4 py-2 rounded-t-full rounded-br-full w-fit`}>
                                            <p className='text-[0.8em] text-[#A71A15] font-bold'>{m.sender.name}</p>
                                            <h3 className='w-fit'>{m.content}</h3>
                                        </div>
                                        <h5 className='text-end text-black/50'>12:30</h5>
                                    </div>
                                ))}

                                
                            </div>
                        ) : (<p className='text-center text-black/50'>No messages. Be the first one to send a messsage.</p>)}
                        <div className='w-full bg-white'>
                            <div className='md:w-1/2 fixed mx-auto bottom-8 bg-white'>
                                <div className='flex items-center w-full h-fit'>
                                    <input
                                        type='text'
                                        value={message}
                                        placeholder='Enter your message'
                                        onChange={(e) => {
                                            setMessage(e.target.value);
                                            socket.emit("typing", {
                                                channelId: selectedChannel._id,
                                                userName: user?.name
                                            })
                                        }}
                                        className='border border-gray-200 w-full rounded-l-full px-5 py-2 bottom-0'
                                    />
                                    <button 
                                        onClick={() => handleSendMessage()}
                                        className='bg-[#A71A15] text-white rounded-r-full px-3 w-28 py-2 h-full cursor-pointer'>
                                        {loading ? 'sending' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className='h-screen w-fit relative border border-black/5 rounded-md shadow'>
                    {selectedChannel && (<div className='px-5 py-8'>
                        <div className='text-center'>
                            <Image
                                src='/image2.jpg'
                                alt='channel image'
                                width={20}
                                height={20}
                                objectFit='cover'
                                className='rounded-full w-32 h-32 mx-auto'
                            />
                            <h3 className='text-2xl font-bold mt-5'>{selectedChannel?.name}</h3>
                            <p className='text-black/50'>{selectedChannel?.workspace.members.length} Members</p>
                        </div>
                        
                        <div className='border-b-2 border-black/5 py-5 flex space-x-5'>
                            <h3 className=' text-[#A71A15]'>Members</h3> <h3>Medias</h3> <h3>Files</h3> <h3>Voice</h3>
                        </div>
                        <div className='grid gap-3 py-3 overflow-y-hidden'>
                            {selectedChannel?.workspace.members?.map((m) => (

                                <div key={m._id} className='w-full flex items-start justify-between'>
                                    <div>
                                        <h3>{m.name}</h3>
                                        <p className={`text-sm ${m.status === "online" ? 'text-green-300' : 'text-black/50'}`}>{m.status}</p>
                                    </div>
                                    <div>
                                        <p className='text-sm'>{user?._id === m._id ? 'Me' : ''} </p>
                                        <p className='text-sm'>{m.role === "admin" ? 'Admin' : ''} </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> )}

                </div>
            </>
            ) : <p className='text-black/50 text-center'>No groups selected.</p>}


        </div>
    </div>
  )
}

export default Workspace