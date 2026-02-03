
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import appContent from '../data/app_content.json';
import { TrendingUp, Globe, AlertOctagon } from 'lucide-react';

const Market = () => {
    const [data, setData] = useState({ trends: '', demand: '', risks: '' });

    useEffect(() => {
        try {
            const trends = JSON.parse(appContent.market_trends).answer;
            const demand = JSON.parse(appContent.market_demand).answer;
            const risks = JSON.parse(appContent.market_risks).answer;
            setData({ trends, demand, risks });
        } catch (e) {
            console.error("Error parsing content", e);
        }
    }, []);

    return (
        <div className="container animate-fade-in">
            <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Inteligencia de Mercado</h1>

            <div className="grid-cols-2">
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#dbeafe', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <h2 className="heading">Tendencias y Precios 2025-2026</h2>
                    </div>
                    <div className="markdown-content">
                        <ReactMarkdown>{data.trends}</ReactMarkdown>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#dcfce7', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--secondary)' }}>
                            <Globe size={24} />
                        </div>
                        <h2 className="heading">Demanda Global y Mercados</h2>
                    </div>
                    <div className="markdown-content">
                        <ReactMarkdown>{data.demand}</ReactMarkdown>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', color: '#dc2626' }}>
                            <AlertOctagon size={24} />
                        </div>
                        <h2 className="heading">Riesgos y Logística</h2>
                    </div>
                    <div className="markdown-content">
                        <ReactMarkdown>{data.risks}</ReactMarkdown>
                    </div>
                </div>
            </div>
            <style>{`
                .markdown-content { color: var(--text-main); line-height: 1.7; }
                .markdown-content h3 { font-size: 1.25rem; color: var(--primary-dark); margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .markdown-content h4 { font-size: 1.1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                .markdown-content p { margin-bottom: 1rem; color: #334155; }
                .markdown-content ul { padding-left: 1.5rem; margin-bottom: 1rem; }
                .markdown-content li { margin-bottom: 0.5rem; }
                .markdown-content strong { color: var(--primary-dark); font-weight: 600; }
            `}</style>
        </div>
    );
};

export default Market;
