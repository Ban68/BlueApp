
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import appContent from '../data/app_content.json';
import useLocalStorage from '../hooks/useLocalStorage';
import { ClipboardList, CheckSquare, Save, Eye, MessageCircle, FileText, Sprout, Tractor, Citrus } from 'lucide-react';

const FarmVisit = () => {
    const [checklistItems, setChecklistItems] = useState([]);
    const [productionTips, setProductionTips] = useState('');
    const [productionQuestions, setProductionQuestions] = useState('');
    const [growingTips, setGrowingTips] = useState('');

    // Tab State
    const [activeTab, setActiveTab] = useState('production'); // production, growing, planting

    // Notes State (Persisted)
    const [notes, setNotes] = useLocalStorage('blueinvest_visit_notes', '');
    const [evaluations, setEvaluations] = useLocalStorage('blueinvest_visit_evals', {
        fruitQuality: null, // good, bad
        plantHealth: null,
        harvestHygiene: null
    });

    useEffect(() => {
        try {
            // Load content
            if (appContent.farm_checklist) {
                const rawText = JSON.parse(appContent.farm_checklist).answer;
                const lines = rawText.split('\n');
                const items = [];
                let currentCategory = 'General';
                lines.forEach(line => {
                    if (line.startsWith('###')) {
                        currentCategory = line.replace('###', '').trim();
                    } else if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                        const text = line.replace(/^\s*[\*\-]\s*/, '').trim().replace(/\*\*/g, '');
                        if (cleanText(text)) items.push({ category: currentCategory, text: cleanText(text), id: items.length });
                    }
                });
                setChecklistItems(items);
            }

            if (appContent.production_visit_tips) setProductionTips(JSON.parse(appContent.production_visit_tips).answer);
            if (appContent.production_questions) setProductionQuestions(JSON.parse(appContent.production_questions).answer);
            if (appContent.growing_visit_tips) setGrowingTips(JSON.parse(appContent.growing_visit_tips).answer);

        } catch (e) {
            console.error("Error parsing content", e);
        }
    }, []);

    const cleanText = (text) => text.replace(/\*\*/g, '').trim();

    const handleEvaluation = (key, value) => {
        setEvaluations(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
    };

    const tabs = [
        { id: 'production', label: 'Producción (Cosecha)', icon: <Citrus size={18} /> },
        { id: 'growing', label: 'Crecimiento', icon: <Sprout size={18} /> },
        { id: 'planting', label: 'Siembra/Prep.', icon: <Tractor size={18} /> },
    ];

    return (
        <div className="container animate-fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="heading" style={{ fontSize: '2rem' }}>Visita a Finca</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Guía interactiva para recorrido de campo.</p>
                </div>
                <button className="btn btn-primary">
                    <Save size={18} /> Guardar Informe
                </button>
            </header>

            {/* Tabs */}
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

            {/* PRODUCTION TAB CONTENT */}
            {activeTab === 'production' && (
                <div className="animate-fade-in">
                    <div className="grid-cols-2">
                        {/* LEFT: Guided Tour */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="card guide-card">
                                <div className="card-header">
                                    <div className="icon-box" style={{ background: '#dbeafe', color: 'var(--primary)' }}>
                                        <Eye size={24} />
                                    </div>
                                    <h3 className="heading">Qué Mirar Visualmente</h3>
                                </div>
                                <div className="markdown-mini">
                                    <ReactMarkdown>{productionTips}</ReactMarkdown>
                                </div>
                            </div>

                            <div className="card guide-card">
                                <div className="card-header">
                                    <div className="icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
                                        <MessageCircle size={24} />
                                    </div>
                                    <h3 className="heading">Preguntas Clave al Técnico</h3>
                                </div>
                                <div className="markdown-mini">
                                    <ReactMarkdown>{productionQuestions}</ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Notes & Evaluation */}
                        <div className="card sticky-card">
                            <h3 className="heading" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={20} /> Mis Notas de Visita
                            </h3>

                            <div className="eval-section">
                                <label>Calidad Aparente de Fruta</label>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${evaluations.fruitQuality === 'good' ? 'positive' : ''}`}
                                        onClick={() => handleEvaluation('fruitQuality', 'good')}
                                    >👍 Buena</button>
                                    <button
                                        className={`toggle-btn ${evaluations.fruitQuality === 'bad' ? 'negative' : ''}`}
                                        onClick={() => handleEvaluation('fruitQuality', 'bad')}
                                    >👎 Deficiente</button>
                                </div>
                            </div>

                            <div className="eval-section">
                                <label>Higiene en Cosecha</label>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${evaluations.harvestHygiene === 'good' ? 'positive' : ''}`}
                                        onClick={() => handleEvaluation('harvestHygiene', 'good')}
                                    >👍 Adecuada</button>
                                    <button
                                        className={`toggle-btn ${evaluations.harvestHygiene === 'bad' ? 'negative' : ''}`}
                                        onClick={() => handleEvaluation('harvestHygiene', 'bad')}
                                    >👎 Riesgosa</button>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Observaciones Libres</label>
                                <textarea
                                    className="notes-area"
                                    placeholder="Registra aquí respuestas del agrónomo, detalles visuales o inquietudes..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OTHER TABS PLACEHOLDERS */}
            {activeTab === 'growing' && (
                <div className="card animate-fade-in">
                    <h3 className="heading" style={{ marginBottom: '1rem' }}>Inspección en Etapa Vegetativa</h3>
                    <div className="markdown-content">
                        <ReactMarkdown>{growingTips}</ReactMarkdown>
                    </div>
                </div>
            )}

            {activeTab === 'planting' && (
                <div className="card animate-fade-in">
                    <h3 className="heading" style={{ marginBottom: '1rem' }}>Checklist de Preparación y Siembra</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Utilice el checklist completo para evaluar la idoneidad del terreno antes de plantar.</p>
                    <div className="checklist-container" style={{ marginTop: '1.5rem' }}>
                        {/* We reuse the old checklist logic here for Due Diligence */}
                        {checklistItems.slice(0, 5).map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '20px', height: '20px', border: '2px solid #cbd5e1', borderRadius: '4px' }}></div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.text}</p>
                            </div>
                        ))}
                        <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>Ver Checklist Completo (Due Diligence)</button>
                    </div>
                </div>
            )}

            <style>{`
                .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0px; }
                .tab-btn {
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-weight: 600;
                    color: var(--text-muted);
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }
                .tab-btn:hover { color: var(--primary); }
                .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

                .guide-card { border-left: 4px solid var(--primary); }
                .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
                .icon-box { padding: 0.5rem; borderRadius: 0.5rem; display: flex; align-items: center; justify-content: center; }
                
                .markdown-mini p { font-size: 0.95rem; color: #334155; margin-bottom: 0.75rem; }
                .markdown-mini ul { padding-left: 1.25rem; font-size: 0.95rem; margin-bottom: 1rem; }
                .markdown-mini li { margin-bottom: 0.4rem; color: #475569; }
                .markdown-mini strong { color: var(--primary-dark); }

                .sticky-card { position: sticky; top: 2rem; height: fit-content; }
                .eval-section { margin-bottom: 1rem; }
                .eval-section label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; }
                .toggle-group { display: flex; gap: 0.5rem; }
                .toggle-btn {
                    flex: 1; padding: 0.5rem; border: 1px solid var(--border); border-radius: 0.5rem;
                    background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;
                }
                .toggle-btn:hover { border-color: var(--primary); }
                .toggle-btn.positive { background: #dcfce7; color: #166534; border-color: #166534; }
                .toggle-btn.negative { background: #fee2e2; color: #991b1b; border-color: #991b1b; }

                .notes-area {
                    width: 100%; height: 200px; padding: 0.75rem;
                    border: 1px solid var(--border); border-radius: 0.5rem;
                    resize: vertical; font-family: inherit; font-size: 0.95rem;
                    outline: none;
                }
                .notes-area:focus { border-color: var(--primary); }
            `}</style>
        </div>
    );
};

export default FarmVisit;
