import React, { useContext, useState, useEffect } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

const Sidebar = () => {
    const [extended, setExtended] = useState(false);
    const { onSent, prevPrompts, setRecentPrompt, newChat, userId } = useContext(Context);
    
    const [chatHistory, setChatHistory] = useState(() => {
        // Load initial chat history from local storage, if available
        const savedHistory = localStorage.getItem('chatHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    const loadPrompt = async (prompt) => {
        await onSent(prompt);
        setRecentPrompt(prompt);
    };

    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/chat/history/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setChatHistory(data);
                // Save chat history to local storage
                localStorage.setItem('chatHistory', JSON.stringify(data));
            } else {
                console.error('Failed to fetch chat history:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchChatHistory();
        } else {
            // Optionally clear the chat history if no userId is available
            setChatHistory([]); 
        }
    }, [userId]);

    return (
        <div className='sidebar'>
            <div className="top">
                <img src={assets.menu_icon} alt="" className="menu" onClick={() => setExtended(prev => !prev)} />
                <div onClick={() => newChat()} className="new-chat">
                    <img src={assets.plus_icon} alt="" />
                    {extended ? <p>New Chat</p> : null}
                </div>
                {extended
                    ? <div className="recent">
                        <p className='recent-title'>Recent</p>
                        {prevPrompts.map((item, index) => (
                            <div key={index} onClick={() => loadPrompt(item)} className="recent-entry">
                                <img src={assets.message_icon} alt="" />
                                <p>{item.slice(0, 18)}{"..."}</p>
                            </div>
                        ))}
                        <p className='recent-title'>Chat History</p>
                        {chatHistory.map((chat, index) => (
                            <div key={index} className="recent-entry" onClick={() => loadPrompt(chat.messages[0].userMessage)}>
                                <img src={assets.message_icon} alt="" />
                                <p>{chat.messages[0].userMessage.slice(0, 18)}{"..."}</p>
                            </div>
                        ))}
                    </div>
                    : null}
            </div>
            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="" />
                    {extended ? <p>Help</p> : null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="" />
                    {extended ? <p>Activity</p> : null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="" />
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;
