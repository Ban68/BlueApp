
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Sprout, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    return (
        <div className="container animate-fade-in">
            <header style={{ marginBottom: '2rem' }}>
                <h1 className="heading" style={{ fontSize: '2rem' }}>Blueberry Investor Companion</h1>
                <p style={{ color: 'var(--text-muted)' }}>Bienvenido a su centro de inteligencia para el negocio de arándanos.</p>
            </header>

            <div className="grid-cols-3">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#dbeafe', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="heading">Mercado Actual</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Análisis en tiempo real de tendencias, precios y oportunidades de exportación.
                    </p>
                    <div className="badge" style={{ background: '#dcfce7', color: '#166534' }}>Datos 2026 Disp.</div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#dcfce7', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--secondary)' }}>
                            <Sprout size={24} />
                        </div>
                        <h3 className="heading">Guía Técnica</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Recursos completos sobre cultivo, variedades y manejo fitosanitario.
                    </p>
                    <div className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Actualizado</div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '0.5rem', color: '#dc2626' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="heading">Riesgos & Alertas</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Monitoreo de riesgos comerciales y climáticos para su inversión.
                    </p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '2rem' }}>
                <h2 className="heading" style={{ marginBottom: '1rem' }}>Acciones Rápidas</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => navigate('/visit')}>Iniciar Nueva Visita a Finca</button>
                    <button className="btn btn-outline" onClick={() => navigate('/business')}>Simular ROI</button>
                    <button className="btn btn-outline" onClick={() => navigate('/market')}>Ver Reporte Completo</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
