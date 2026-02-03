
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Briefcase, Calculator, Calendar, DollarSign, PieChart, TrendingUp } from 'lucide-react';

const Business = () => {
    // State for Calculator (Persisted)
    const [inputs, setInputs] = useLocalStorage('blueinvest_roi_inputs', {
        hectares: 10,
        variety: 'Biloxi',
        price: 5.5, // USD per kg
        investment: 45000, // USD per ha (setup)
        maintenance: 12000, // USD per ha (annual)
    });

    const [results, setResults] = useState(null);

    // Yield assumptions per variety (Mature High Tech)
    const yields = {
        'Biloxi': 15000, // kg/ha
        'Emerald': 18000,
        'Legacy': 22000,
        'Sekoya/Premium': 25000
    };

    const handleCalculate = () => {
        const yieldPerHa = yields[inputs.variety];
        const totalProduction = inputs.hectares * yieldPerHa;
        const grossRevenue = totalProduction * inputs.price;
        const totalInvestment = inputs.hectares * inputs.investment;
        const totalMaintenance = inputs.hectares * inputs.maintenance;

        // Simple Annual Profit at Maturity (Revenue - Maintenance)
        const annualProfit = grossRevenue - totalMaintenance;

        // Payback Period (Investment / Annual Profit)
        const payback = annualProfit > 0 ? (totalInvestment / annualProfit).toFixed(1) : 'N/A';

        // ROI (Annual Profit / Investment * 100)
        const roi = totalInvestment > 0 ? ((annualProfit / totalInvestment) * 100).toFixed(1) : 0;

        setResults({
            totalInvestment,
            grossRevenue,
            annualProfit,
            roi,
            payback,
            yieldPerHa
        });
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="container animate-fade-in">
            <h1 className="heading" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Gestión de Negocio</h1>

            <div className="grid-cols-2">
                {/* Calculator Section */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: '#fef3c7', padding: '0.5rem', borderRadius: '0.5rem', color: '#b45309' }}>
                            <Calculator size={24} />
                        </div>
                        <h2 className="heading">Simulador de Rentabilidad (ROI)</h2>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Hectáreas</label>
                            <input
                                type="number"
                                value={inputs.hectares}
                                onChange={(e) => setInputs({ ...inputs, hectares: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Variedad</label>
                            <select
                                value={inputs.variety}
                                onChange={(e) => setInputs({ ...inputs, variety: e.target.value })}
                            >
                                {Object.keys(yields).map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Precio Est. (USD/kg)</label>
                            <input
                                type="number" step="0.1"
                                value={inputs.price}
                                onChange={(e) => setInputs({ ...inputs, price: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Inversión Inicial ($/ha)</label>
                            <input
                                type="number"
                                value={inputs.investment}
                                onChange={(e) => setInputs({ ...inputs, investment: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleCalculate}>
                        Calcular Proyección
                    </button>

                    {results && (
                        <div className="results animate-fade-in">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary-dark)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                Resultados (Anualidad Madura)
                            </h3>
                            <div className="result-item">
                                <span><DollarSign size={16} /> Inversión Total:</span>
                                <strong>{formatMoney(results.totalInvestment)}</strong>
                            </div>
                            <div className="result-item">
                                <span><TrendingUp size={16} /> Ingreso Bruto:</span>
                                <strong style={{ color: 'var(--secondary)' }}>{formatMoney(results.grossRevenue)}</strong>
                            </div>
                            <div className="result-item">
                                <span><Briefcase size={16} /> Utilidad Operativa:</span>
                                <strong style={{ color: 'var(--primary)' }}>{formatMoney(results.annualProfit)}</strong>
                            </div>
                            <div className="result-grid">
                                <div className="metric">
                                    <span className="label">ROI Anual</span>
                                    <span className="value">{results.roi}%</span>
                                </div>
                                <div className="metric">
                                    <span className="label">Payback</span>
                                    <span className="value">{results.payback} años</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Calendar / Events */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#e0e7ff', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                            <Calendar size={24} />
                        </div>
                        <h2 className="heading">Eventos del Sector</h2>
                    </div>

                    <ul className="event-list">
                        <li className="event-item">
                            <div className="date-badge">
                                <span>FEB</span>
                                <strong>08</strong>
                            </div>
                            <div>
                                <div className="event-title">Fruit Logistica Berlin</div>
                                <div className="event-loc">Berlin, Alemania</div>
                            </div>
                        </li>
                        <li className="event-item">
                            <div className="date-badge">
                                <span>ABR</span>
                                <strong>18</strong>
                            </div>
                            <div>
                                <div className="event-title">Blueberry Summit 2026</div>
                                <div className="event-loc">Santiago, Chile</div>
                            </div>
                        </li>
                        <li className="event-item">
                            <div className="date-badge">
                                <span>AGO</span>
                                <strong>25</strong>
                            </div>
                            <div>
                                <div className="event-title">Seminario Internacional Blueberries</div>
                                <div className="event-loc">Lima, Perú</div>
                            </div>
                        </li>
                    </ul>
                    <button className="btn btn-outline" style={{ width: '100%', marginTop: '1.5rem' }}>Sincronizar Calendario</button>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f1f5f9', borderRadius: '0.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            <PieChart size={16} /> Market Share Objetivo
                        </h4>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Para lograr un 5% de cuota en el nicho premium, se requiere expandir a 50ha con variedades patentadas para 2028.
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: var(--text-muted); }
                .form-group input, .form-group select { 
                    width: 100%; padding: 0.5rem; border: 1px solid var(--border); 
                    borderRadius: 0.375rem; outline: none; transition: border 0.2s;
                }
                .form-group input:focus, .form-group select:focus { border-color: var(--primary); }
                
                .results { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--border); }
                .result-item { display: flex; justify-content: space-between; margin-bottom: 0.75rem; align-items: center; }
                .result-item span { display: flex; alignItems: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.95rem; }
                
                .result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
                .metric { background: #f8fafc; padding: 0.75rem; border-radius: 0.5rem; text-align: center; border: 1px solid var(--border); }
                .metric .label { display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600; }
                .metric .value { display: block; font-size: 1.25rem; font-weight: 700; color: var(--primary-dark); }
                
                .event-list { list-style: none; }
                .event-item { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border); }
                .event-item:last-child { border-bottom: none; }
                .date-badge { 
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #eff6ff; color: var(--primary); width: 50px; height: 50px; 
                    border-radius: 0.5rem; font-size: 0.75rem; border: 1px solid #dbeafe;
                }
                .date-badge strong { font-size: 1.1rem; line-height: 1; }
                .event-title { font-weight: 600; color: var(--text-main); }
                .event-loc { font-size: 0.85rem; color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default Business;
