
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import appContent from '../data/app_content.json';
import { Sprout, BookOpen, Bug } from 'lucide-react';

const Technical = () => {
    const [data, setData] = useState({ guide: '', varieties: '', pests: '' });

    useEffect(() => {
        try {
            const guide = JSON.parse(appContent.cultivation_guide).answer;
            const varieties = JSON.parse(appContent.varieties).answer;
            const pests = JSON.parse(appContent.pest_management).answer;
            setData({ guide, varieties, pests });
        } catch (e) {
            console.error("Error parsing content", e);
        }
    }, []);

    const [activeTab, setActiveTab] = useState('guide');

    const tabs = [
        { id: 'guide', label: 'Ciclo de Cultivo', icon: <Sprout size={18} /> },
        { id: 'varieties', label: 'Variedades', icon: <BookOpen size={18} /> },
        { id: 'pests', label: 'Plagas y Enfermedades', icon: <Bug size={18} /> }
    ];

    return (
        <div className="container animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="heading" style={{ fontSize: '2rem' }}>Guía Técnica Integral</h1>
            </header>

            <div className="tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="card content-area">
                <div className="markdown-content">
                    {activeTab === 'guide' && <ReactMarkdown>{data.guide}</ReactMarkdown>}
                    {activeTab === 'varieties' && <ReactMarkdown>{data.varieties}</ReactMarkdown>}
                    {activeTab === 'pests' && <ReactMarkdown>{data.pests}</ReactMarkdown>}
                </div>
            </div>

            <style>{`
                .tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
                .tab-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: 1px solid var(--border);
                    background: white;
                    border-radius: var(--radius);
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-muted);
                    transition: all 0.2s;
                }
                .tab-btn:hover { background: var(--background); color: var(--primary); }
                .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
                
                .markdown-content { color: var(--text-main); line-height: 1.7; }
                .markdown-content h3 { font-size: 1.4rem; color: var(--primary-dark); margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
                .markdown-content h4 { font-size: 1.15rem; font-weight: 600; color: var(--secondary); margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .markdown-content p { margin-bottom: 1rem; color: #334155; }
                .markdown-content ul { padding-left: 1.5rem; margin-bottom: 1rem; }
                .markdown-content li { margin-bottom: 0.5rem; }
                .markdown-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; }
                .markdown-content th { background: #f1f5f9; padding: 0.75rem; text-align: left; border: 1px solid var(--border); color: var(--primary-dark); }
                .markdown-content td { padding: 0.75rem; border: 1px solid var(--border); }
             `}</style>
        </div>
    );
};

export default Technical;
