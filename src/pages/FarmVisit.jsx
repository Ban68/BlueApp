import React, { useState } from 'react';
import {
    ClipboardList, CheckSquare, Save, Eye, MessageCircle, FileText,
    Sprout, Tractor, Citrus, Droplets, Bug, ThermometerSun,
    ArrowRight, ChevronDown, ChevronUp, Play
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const FarmVisit = () => {
    // === STATE ===
    const [visitState, setVisitState] = useState('idle'); // idle, active, summary
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState(null);

    const [visitData, setVisitData] = useState({
        meta: { farm: '', date: new Date().toISOString().split('T')[0], weather: '' },
        crop: { stage: '', vigor: 3, notes: '' },
        irrigation: { moisture: '', ph: '', ec: '', notes: '' },
        pests: { observed: false, description: '' },
        harvest: { quality: '', sugar: '', notes: '' },
        generalNotes: ''
    });

    // === HANDLERS ===
    const updateMeta = (field, value) => {
        setVisitData(prev => ({ ...prev, meta: { ...prev.meta, [field]: value } }));
    };

    const updateSection = (section, field, value) => {
        setVisitData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    };

    const startVisit = () => {
        if (!visitData.meta.farm) return alert("Por favor ingresa el nombre de la finca.");
        setVisitState('active');
    };

    const generateReport = async () => {
        setIsLoading(true);
        try {
            // Construct the prompt for the AI
            const prompt = `
                ACTÚA COMO UN INGENIERO AGRÓNOMO SENIOR EXPERTO EN ARÁNDANOS.
                Genera un "Reporte Técnico de Visita" profesional basado en los siguientes datos crudos recolectados en campo:

                - Finca: ${visitData.meta.farm}
                - Fecha: ${visitData.meta.date}
                - Clima: ${visitData.meta.weather}
                
                [CULTIVO]
                - Etapa: ${visitData.crop.stage}
                - Vigor (1-5): ${visitData.crop.vigor}
                - Notas: ${visitData.crop.notes}

                [RIEGO Y SUELO]
                - Humedad: ${visitData.irrigation.moisture}
                - pH: ${visitData.irrigation.ph} | CE: ${visitData.irrigation.ec}
                - Notas: ${visitData.irrigation.notes}

                [SANIDAD]
                - Problemas observados: ${visitData.pests.observed ? 'SÍ' : 'No reportados'}
                - Detalle: ${visitData.pests.description}

                [COSECHA/CALIDAD]
                - Calidad aparente: ${visitData.harvest.quality}
                - Brix estimados: ${visitData.harvest.sugar}
                - Notas: ${visitData.harvest.notes}

                [OBSERVACIONES GENERALES]
                ${visitData.generalNotes}

                FORMATO DEL REPORTE:
                1. **Resumen Ejecutivo**: 2-3 líneas sobre el estado general.
                2. **Semáforo de Estado**: Indica si la finca está en VERDE (Bien), AMARILLO (Atención) o ROJO (Crítico) y por qué.
                3. **Hallazgos Clave**: Puntos positivos y negativos detallados.
                4. **Recomendaciones Técnicas**: Acciones inmediatas sugeridas para el productor (riego, nutrición, sanidad).
                
                Usa formato Markdown limpio, listas y negritas. Sé técnico pero claro.
            `;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (!response.ok) throw new Error("Error generando reporte");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulatedText += decoder.decode(value, { stream: true });
                setReport(accumulatedText); // Stream update (optional, usually set at end helps avoid flicker but streaming is cool)
            }
            // Ensure final flush
            setReport(accumulatedText);
            setVisitState('summary');

        } catch (error) {
            console.error(error);
            alert("Hubo un error generando el reporte. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper for star ratings
    const renderStars = (current, onChange) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`star-btn ${star <= current ? 'active' : ''}`}
                    >★</button>
                ))}
            </div>
        );
    };

    // === RENDER ===
    return (
        <div className="container animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="heading text-2xl">Visita Técnica</h1>
                    <p className="text-muted">Asistente inteligente para recorridos de campo.</p>
                </div>
                {visitState === 'idle' && (
                    <div className="icon-badge">
                        <Tractor size={24} color="var(--primary)" />
                    </div>
                )}
            </header>

            {/* STATE: IDLE (Start Screen) */}
            {visitState === 'idle' && (
                <div className="card start-card animate-fade-in-up">
                    <h2 className="text-xl font-bold mb-4">Iniciar Nueva Visita</h2>
                    <div className="form-group mb-4">
                        <label>Nombre de la Finca / Lote</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Ej. Lote 3 - Sector Norte"
                            value={visitData.meta.farm}
                            onChange={(e) => updateMeta('farm', e.target.value)}
                        />
                    </div>
                    <div className="grid-2 mb-6">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                className="input-field"
                                value={visitData.meta.date}
                                onChange={(e) => updateMeta('date', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Clima Actual</label>
                            <select
                                className="input-field"
                                value={visitData.meta.weather}
                                onChange={(e) => updateMeta('weather', e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                <option value="Soleado">Soleado ☀️</option>
                                <option value="Nublado">Nublado ☁️</option>
                                <option value="Lluvia">Lluvia 🌧️</option>
                                <option value="Viento Fuerte">Viento Fuerte 💨</option>
                            </select>
                        </div>
                    </div>
                    <button onClick={startVisit} className="btn btn-primary w-full py-3 flex-center mt-6">
                        Comenzar Recorrido <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* STATE: ACTIVE (Data Entry) */}
            {visitState === 'active' && (
                <div className="visit-flow animate-fade-in">
                    <div className="flow-header mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-blue-900">{visitData.meta.farm}</h3>
                            <p className="text-sm text-blue-700">{visitData.meta.date} • {visitData.meta.weather || 'Clima no especificado'}</p>
                        </div>
                        <button onClick={() => setVisitState('idle')} className="text-sm text-blue-600 underline">Cancelar</button>
                    </div>

                    <div className="accordion-container flex flex-col gap-4">

                        {/* Section 1: CULTIVO */}
                        <AccordionItem title="Estado del Cultivo" icon={<Sprout size={20} color="#16a34a" />}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Etapa Fenológica</label>
                                    <select
                                        className="input-field"
                                        value={visitData.crop.stage}
                                        onChange={(e) => updateSection('crop', 'stage', e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Dormancia">Dormancia</option>
                                        <option value="Brotación">Brotación</option>
                                        <option value="Floración">Floración</option>
                                        <option value="Cuajado">Cuajado de Fruto</option>
                                        <option value="Llenado">Llenado de Fruto</option>
                                        <option value="Cosecha">Cosecha</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vigor de Planta (1-5)</label>
                                    {renderStars(visitData.crop.vigor, (val) => updateSection('crop', 'vigor', val))}
                                </div>
                                <div className="form-group col-span-2">
                                    <label>Notas de Desarrollo</label>
                                    <textarea
                                        className="input-area"
                                        placeholder="Uniformidad, color de hoja..."
                                        value={visitData.crop.notes}
                                        onChange={(e) => updateSection('crop', 'notes', e.target.value)}
                                    />
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Section 2: RIEGO */}
                        <AccordionItem title="Riego y Suelo" icon={<Droplets size={20} color="#2563eb" />}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Humedad al Tacto</label>
                                    <select
                                        className="input-field"
                                        value={visitData.irrigation.moisture}
                                        onChange={(e) => updateSection('irrigation', 'moisture', e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Seco">Seco (Polvo)</option>
                                        <option value="Óptimo">Óptimo (Húmedo)</option>
                                        <option value="Saturado">Saturado (Barro)</option>
                                    </select>
                                </div>
                                <div className="grid-2 col-span-2 gap-4">
                                    <div className="form-group">
                                        <label>pH (Opcional)</label>
                                        <input type="text" className="input-field" placeholder="Ej. 5.5"
                                            value={visitData.irrigation.ph}
                                            onChange={(e) => updateSection('irrigation', 'ph', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CE (dS/m)</label>
                                        <input type="text" className="input-field" placeholder="Ej. 1.2"
                                            value={visitData.irrigation.ec}
                                            onChange={(e) => updateSection('irrigation', 'ec', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AccordionItem>

                        {/* Section 3: SANIDAD */}
                        <AccordionItem title="Sanidad (Plagas/Enfermedades)" icon={<Bug size={20} color="#dc2626" />}>
                            <div className="form-group mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={visitData.pests.observed}
                                        onChange={(e) => updateSection('pests', 'observed', e.target.checked)}
                                        className="w-5 h-5 accent-red-600"
                                    />
                                    <span className="font-semibold">¿Se observan problemas fitosanitarios?</span>
                                </label>
                            </div>
                            {visitData.pests.observed && (
                                <div className="form-group animate-fade-in">
                                    <label>Descripción del Problema</label>
                                    <textarea
                                        className="input-area"
                                        placeholder="Ej. Presencia de Botrytis en flor, larvas en hojas..."
                                        value={visitData.pests.description}
                                        onChange={(e) => updateSection('pests', 'description', e.target.value)}
                                    />
                                </div>
                            )}
                        </AccordionItem>

                        {/* Section 4: COSECHA */}
                        <AccordionItem title="Calidad de Fruta / Cosecha" icon={<Citrus size={20} color="#f59e0b" />}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Calidad Visual</label>
                                    <select
                                        className="input-field"
                                        value={visitData.harvest.quality}
                                        onChange={(e) => updateSection('harvest', 'quality', e.target.value)}
                                    >
                                        <option value="">N/A (No hay fruta)</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Estándar">Estándar</option>
                                        <option value="Descarte">Alta Tasa de Descarte</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Grados Brix (Estimado)</label>
                                    <input type="text" className="input-field" placeholder="Ej. 12"
                                        value={visitData.harvest.sugar}
                                        onChange={(e) => updateSection('harvest', 'sugar', e.target.value)}
                                    />
                                </div>
                            </div>
                        </AccordionItem>

                        <div className="form-group mt-4">
                            <label>Notas Finales / Pendientes</label>
                            <textarea
                                className="input-area h-32"
                                placeholder="Cualquier otra observación importante..."
                                value={visitData.generalNotes}
                                onChange={(e) => setVisitData(prev => ({ ...prev, generalNotes: e.target.value }))}
                            />
                        </div>

                    </div>

                    <div className="actions mt-8 pb-8">
                        <button
                            onClick={generateReport}
                            disabled={isLoading}
                            className="btn btn-primary w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
                        >
                            {isLoading ? 'Analizando con IA...' : 'Generar Reporte de Visita ✨'}
                            {!isLoading && <ArrowRight />}
                        </button>
                        {isLoading && <p className="text-center text-sm text-muted mt-2">Esto puede tomar unos segundos...</p>}
                    </div>
                </div>
            )}

            {/* STATE: SUMMARY (Report) */}
            {visitState === 'summary' && report && (
                <div className="report-view animate-fade-in">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex justify-between items-center">
                        <span className="text-green-800 font-semibold flex items-center gap-2">
                            <CheckSquare size={20} /> Reporte Generado Exitosamente
                        </span>
                        <button onClick={() => setVisitState('active')} className="text-sm text-green-700 underline">Editar Datos</button>
                    </div>

                    <div className="card report-card print:shadow-none print:border-none">
                        <div className="report-header border-b pb-4 mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Reporte de Visita Técnica</h2>
                            <p className="text-gray-500">{visitData.meta.farm} • {visitData.meta.date}</p>
                        </div>
                        <div className="markdown-content">
                            <ReactMarkdown>{report}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="btn btn-outline flex-1 flex justify-center gap-2"
                        >
                            <Save size={18} /> Guardar / Imprimir
                        </button>
                        <button
                            onClick={() => {
                                setVisitState('idle');
                                setReport(null);
                                setVisitData({ meta: { ...visitData.meta }, crop: {}, irrigation: {}, pests: {}, harvest: {}, generalNotes: '' });
                            }}
                            className="btn btn-secondary flex-1"
                        >
                            Nueva Visita
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .start-card { max-width: 500px; margin: 2rem auto; padding: 2rem; }
                .input-field { 
                    width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; 
                    font-size: 1rem; outline: none; transition: border-color 0.2s; 
                }
                .input-field:focus { border-color: var(--primary); }
                .input-area { 
                    width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; 
                    font-size: 1rem; min-height: 80px; resize: vertical; outline: none;
                }
                .input-area:focus { border-color: var(--primary); }
                
                .form-group label { display: block; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; color: #475569; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                
                /* Spacing Utilities */
                .mb-4 { margin-bottom: 1rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .w-full { width: 100%; }
                .flex-center { display: flex; justify-content: center; align-items: center; gap: 0.5rem; }
                
                .star-btn { 
                    font-size: 1.5rem; color: #cbd5e1; background: none; border: none; cursor: pointer; transition: color 0.1s; 
                }
                .star-btn.active { color: #f59e0b; }

                .accordion-item { border: 1px solid #e2e8f0; border-radius: 0.75rem; background: white; overflow: hidden; }
                .accordion-header { 
                    width: 100%; padding: 1rem; background: white; border: none; 
                    display: flex; justify-content: space-between; items-center; cursor: pointer;
                }
                .accordion-header:hover { background: #f8fafc; }
                .accordion-content { padding: 1.5rem; border-top: 1px solid #f1f5f9; background: #fafafa; }

                .markdown-content h1, .markdown-content h2, .markdown-content h3 { color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 700; }
                .markdown-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                .markdown-content p { margin-bottom: 1rem; line-height: 1.6; color: #334155; }
                .markdown-content strong { color: #0f172a; }

                @media print {
                    .page-header, .btn, .icon-badge { display: none !important; }
                    .card { box-shadow: none; border: none; padding: 0; }
                    body { background: white; }
                }

                @media (max-width: 640px) {
                    .grid-2, .form-grid { grid-template-columns: 1fr; }
                    .start-card { padding: 1.25rem; margin: 1rem 0; width: 100%; }
                    .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .icon-badge { display: none; }
                }
            `}</style>
        </div>
    );
};

// Sub-component for Accordion
const AccordionItem = ({ title, icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="accordion-item shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="accordion-header"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span className="font-semibold text-lg text-slate-700">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </button>
            {isOpen && <div className="accordion-content animate-fade-in">{children}</div>}
        </div>
    );
};

export default FarmVisit;
