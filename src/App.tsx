import React, { useState, useEffect } from 'react';
import { 
  Webhook, 
  Activity, 
  FileText, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  Database, 
  Key, 
  Search, 
  Shield, 
  ArrowUpRight, 
  Layers,
  X
} from 'lucide-react';

interface Endpoint {
  id: string;
  name: string;
  targetUrl: string;
  apiKey: string;
  createdAt: string;
}

interface WebhookLog {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  receivedAt: string;
  forwardedTo: string;
  forwardStatus: number | null;
  forwardResponse: string;
  forwardError: string;
  latencyMs: number;
}

interface Stats {
  totalEndpoints: number;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgLatencyMs: number;
  methodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  recentTraffic: Array<{ date: string; requests: number; success: number; error: number }>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'endpoints' | 'logs'>('dashboard');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingActive, setPollingActive] = useState(true);
  
  // Search / Filters
  const [logFilterEndpoint, setLogFilterEndpoint] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentEndpointId, setCurrentEndpointId] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    targetUrl: '',
    apiKey: ''
  });

  // Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [endpointsRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/endpoints'),
        fetch('/api/stats'),
        fetch('/api/logs')
      ]);

      if (!endpointsRes.ok || !statsRes.ok || !logsRes.ok) {
        throw new Error('Falha ao sincronizar dados com o servidor.');
      }

      const endpointsData = await endpointsRes.json();
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();

      setEndpoints(endpointsData);
      setStats(statsData);
      setLogs(logsData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Polling loop
  useEffect(() => {
    if (!pollingActive) return;
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [pollingActive]);

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) {
      showToast('O ID do endpoint é obrigatório.');
      return;
    }

    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao criar endpoint.');
      }

      showToast('Endpoint criado com sucesso!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleUpdateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/endpoints/${currentEndpointId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          targetUrl: formData.targetUrl,
          apiKey: formData.apiKey
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao atualizar endpoint.');
      }

      showToast('Endpoint atualizado com sucesso!');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o endpoint '${id}'? Todos os logs relacionados serão apagados.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/endpoints/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir o endpoint.');
      }

      showToast('Endpoint excluído.');
      fetchData();
      if (selectedLog && selectedLog.endpointId === id) {
        setSelectedLog(null);
      }
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const handleClearLogs = async () => {
    const filterText = logFilterEndpoint === 'all' ? 'todos os logs' : `todos os logs do endpoint '${logFilterEndpoint}'`;
    if (!window.confirm(`Tem certeza que deseja limpar ${filterText}?`)) {
      return;
    }

    try {
      const url = logFilterEndpoint === 'all' ? '/api/logs' : `/api/logs?endpointId=${logFilterEndpoint}`;
      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erro ao limpar logs.');
      }

      showToast('Logs limpos.');
      setSelectedLog(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      id: '',
      name: '',
      targetUrl: '',
      apiKey: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
    });
    setIsModalOpen(true);
  };

  const openEditModal = (endpoint: Endpoint) => {
    setModalMode('edit');
    setCurrentEndpointId(endpoint.id);
    setFormData({
      id: endpoint.id,
      name: endpoint.name,
      targetUrl: endpoint.targetUrl,
      apiKey: endpoint.apiKey
    });
    setIsModalOpen(true);
  };

  // Helper to format timestamps
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString();
  };

  // Filter logs based on search and selected filter
  const filteredLogs = logs.filter(log => {
    const matchEndpoint = logFilterEndpoint === 'all' || log.endpointId === logFilterEndpoint;
    const matchSearch = logSearchQuery === '' || 
      log.endpointId.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      (log.forwardStatus && String(log.forwardStatus).includes(logSearchQuery)) ||
      (log.body && JSON.stringify(log.body).toLowerCase().includes(logSearchQuery.toLowerCase())) ||
      (log.forwardResponse && log.forwardResponse.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
      (log.forwardError && log.forwardError.toLowerCase().includes(logSearchQuery.toLowerCase()));

    return matchEndpoint && matchSearch;
  });

  // Render traffic charts custom SVG
  const renderSVGChart = () => {
    if (!stats || !stats.recentTraffic || stats.recentTraffic.length === 0) return null;
    
    const maxVal = Math.max(...stats.recentTraffic.map(t => t.requests), 5); // Fallback to 5 to avoid flat charts
    const chartHeight = 160;
    const chartWidth = 500;
    const padding = 20;

    const points = stats.recentTraffic.map((t, index) => {
      const x = padding + (index / (stats.recentTraffic.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (t.requests / maxVal) * (chartHeight - padding * 2);
      return { x, y, ...t };
    });

    const pathD = points.reduce((acc, p, i) => {
      return acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
    }, '');

    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
      : '';

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(263, 90%, 60%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(263, 90%, 60%)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = padding + ratio * (chartHeight - padding * 2);
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={idx}>
              <line 
                x1={padding} 
                y1={y} 
                x2={chartWidth - padding} 
                y2={y} 
                stroke="rgba(255,255,255,0.05)" 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding - 5} 
                y={y + 4} 
                fill="rgba(255,255,255,0.4)" 
                fontSize="9" 
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Gradient Area */}
        {areaD && <path d={areaD} fill="url(#chartGradient)" />}

        {/* Path Line */}
        {pathD && <path d={pathD} fill="none" stroke="hsl(263, 90%, 60%)" strokeWidth="2.5" strokeLinecap="round" />}

        {/* Dots */}
        {points.map((p, idx) => (
          <circle 
            key={idx} 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="hsl(222, 47%, 11%)" 
            stroke="hsl(263, 90%, 60%)" 
            strokeWidth="2" 
          />
        ))}

        {/* X Axis labels */}
        {points.map((p, idx) => {
          // Parse string date to clean day format
          const cleanDate = p.date.split('/')[0] + '/' + p.date.split('/')[1];
          return (
            <text 
              key={idx} 
              x={p.x} 
              y={chartHeight - 4} 
              fill="rgba(255,255,255,0.5)" 
              fontSize="9" 
              textAnchor="middle"
            >
              {cleanDate}
            </text>
          );
        })}
      </svg>
    );
  };

  // Host URL detection for display
  const webhookBaseUrl = `${window.location.protocol}//${window.location.host}/webhook/`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-fade-in">
          <Check className="text-emerald-500 w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-800 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600/20 p-2 rounded-xl border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <Webhook className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-display text-white" style={{ margin: 0, fontSize: '1.25rem' }}>
              Anexe
            </h1>
            <p className="text-xs text-slate-400 font-medium">Webhook Gateway & API Controller</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'endpoints' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Endpoints
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'logs' 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Request Logs
          </button>
        </nav>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPollingActive(!pollingActive)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              pollingActive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${pollingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            {pollingActive ? 'Auto-Sync ON (5s)' : 'Sync Paused'}
          </button>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-fade-in">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">Erro de conexão</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Carregando painel...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                {/* Stats Cards */}
                <div className="glow-card p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Requisições</span>
                    <h2 className="text-3xl font-bold font-display text-white mt-1">{stats.totalRequests}</h2>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                    <Database className="w-6 h-6 text-blue-400" />
                  </div>
                </div>

                <div className="glow-card p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Taxa de Sucesso</span>
                    <h2 className="text-3xl font-bold font-display text-emerald-400 mt-1">
                      {stats.totalRequests > 0 
                        ? `${Math.round((stats.successCount / stats.totalRequests) * 1000) / 10}%` 
                        : '100%'}
                    </h2>
                  </div>
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                <div className="glow-card p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Latência Média</span>
                    <h2 className="text-3xl font-bold font-display text-amber-400 mt-1">
                      {stats.avgLatencyMs} <span className="text-sm font-normal text-slate-400">ms</span>
                    </h2>
                  </div>
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    <Clock className="w-6 h-6 text-amber-400" />
                  </div>
                </div>

                <div className="glow-card p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Endpoints Ativos</span>
                    <h2 className="text-3xl font-bold font-display text-purple-400 mt-1">{stats.totalEndpoints}</h2>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                    <Layers className="w-6 h-6 text-purple-400" />
                  </div>
                </div>

                {/* Dashboard layout main body */}
                <div className="md:col-span-3 glow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Fluxo de Requisições</h3>
                      <p className="text-xs text-slate-400">Volume de tráfego nos últimos 7 dias</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
                        Webhooks Recebidos
                      </span>
                    </div>
                  </div>
                  <div className="h-44 flex items-end justify-center">
                    {stats.recentTraffic && stats.recentTraffic.length > 0 ? (
                      renderSVGChart()
                    ) : (
                      <p className="text-slate-500 text-sm">Sem tráfego nos últimos 7 dias</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1 flex flex-col gap-5">
                  <div className="glow-card p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white mb-3">Autenticação</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Cada endpoint pode ser protegido individualmente por uma <strong>API Key</strong>.
                        O gateway rejeita qualquer requisição não autorizada antes de salvar os logs ou tentar repassar para o Lovable.
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <div className="text-xs font-semibold text-slate-300">
                        Autenticação do Lovable
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Table */}
                <div className="md:col-span-4 glow-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Requisições Recentes</h3>
                      <p className="text-xs text-slate-400">Últimos eventos interceptados pelo proxy</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('logs')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                    >
                      Ver todos os logs <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Endpoint</th>
                          <th>Método</th>
                          <th>Status Proxy</th>
                          <th>Latência</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.slice(0, 5).map(log => (
                          <tr key={log.id}>
                            <td className="text-slate-300 whitespace-nowrap text-xs">{formatTime(log.receivedAt)}</td>
                            <td>
                              <span className="font-mono text-purple-400 font-semibold">{log.endpointId}</span>
                            </td>
                            <td>
                              <span className="font-bold text-xs bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-300">
                                {log.method}
                              </span>
                            </td>
                            <td>
                              {log.forwardStatus ? (
                                <span className={`badge ${log.forwardStatus >= 200 && log.forwardStatus < 300 ? 'badge-success' : 'badge-error'}`}>
                                  {log.forwardStatus}
                                </span>
                              ) : (
                                <span className="badge badge-warning">Pendente</span>
                              )}
                            </td>
                            <td className="text-slate-400 text-xs font-mono">{log.latencyMs}ms</td>
                            <td>
                              <button 
                                onClick={() => {
                                  setSelectedLog(log);
                                  setActiveTab('logs');
                                }}
                                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                              >
                                Inspecionar <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {logs.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center text-slate-500 py-6 text-sm">
                              Nenhuma requisição recebida ainda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ENDPOINTS VIEW */}
            {activeTab === 'endpoints' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Endpoints Gerenciados</h2>
                    <p className="text-xs text-slate-400">Configure as rotas de webhook que enviarão payloads para o Lovable</p>
                  </div>
                  <button 
                    onClick={openCreateModal}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Endpoint
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {endpoints.map(endpoint => (
                    <div key={endpoint.id} className="glow-card p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-white text-lg font-display">{endpoint.name}</h3>
                            <span className="text-xs font-mono text-purple-400">ID: {endpoint.id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => openEditModal(endpoint)}
                              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEndpoint(endpoint.id)}
                              className="p-1.5 hover:bg-red-950/30 rounded text-slate-400 hover:text-red-400 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Public webhook URL */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">URL do Webhook (Copie para o WhatsApp API)</span>
                          <div className="flex items-center justify-between gap-3 mt-1.5">
                            <code className="text-xs font-mono text-slate-300 break-all select-all">
                              {webhookBaseUrl}{endpoint.id}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(`${webhookBaseUrl}${endpoint.id}`, `url-${endpoint.id}`)}
                              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                            >
                              {copiedId === `url-${endpoint.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Forward target URL */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Repassar Payload Para (Lovable / Backend)</span>
                          <div className="flex items-center justify-between gap-3 mt-1.5">
                            <code className="text-xs font-mono text-slate-300 break-all">
                              {endpoint.targetUrl || <span className="text-slate-500 italic">Nenhum alvo configurado (apenas logs)</span>}
                            </code>
                            {endpoint.targetUrl && (
                              <button 
                                onClick={() => copyToClipboard(endpoint.targetUrl, `target-${endpoint.id}`)}
                                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                              >
                                {copiedId === `target-${endpoint.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* API Key */}
                        {endpoint.apiKey && (
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Chave de API (`x-api-key`)</span>
                            <div className="flex items-center justify-between gap-3 mt-1.5">
                              <code className="text-xs font-mono text-slate-300 select-all">
                                {endpoint.apiKey}
                              </code>
                              <button 
                                onClick={() => copyToClipboard(endpoint.apiKey, `key-${endpoint.id}`)}
                                className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                              >
                                {copiedId === `key-${endpoint.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Criado em {new Date(endpoint.createdAt).toLocaleDateString()}</span>
                        <button 
                          onClick={() => {
                            setLogFilterEndpoint(endpoint.id);
                            setActiveTab('logs');
                          }}
                          className="text-purple-400 hover:text-purple-300 font-semibold"
                        >
                          Ver Logs deste Endpoint
                        </button>
                      </div>
                    </div>
                  ))}

                  {endpoints.length === 0 && (
                    <div className="md:col-span-2 glow-card p-10 text-center flex flex-col items-center justify-center gap-3">
                      <Webhook className="w-12 h-12 text-slate-600 animate-pulse" />
                      <div>
                        <h3 className="font-bold text-white text-lg">Nenhum Webhook Configurado</h3>
                        <p className="text-sm text-slate-400 max-w-md mt-1">
                          Crie seu primeiro endpoint para começar a capturar e rotear eventos da API do WhatsApp ou outros serviços.
                        </p>
                      </div>
                      <button 
                        onClick={openCreateModal}
                        className="btn-primary mt-3"
                      >
                        <Plus className="w-4 h-4" />
                        Criar Endpoint
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. LOGS VIEW */}
            {activeTab === 'logs' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Logs de Interceptação</h2>
                    <p className="text-xs text-slate-400">Inspecione cabeçalhos e payloads recebidos em tempo real</p>
                  </div>
                  
                  {/* Filters / Tools */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
                      <Search className="w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Buscar log por texto..." 
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-slate-200 text-xs w-48 placeholder-slate-500"
                      />
                      {logSearchQuery && (
                        <button onClick={() => setLogSearchQuery('')} className="text-slate-400 hover:text-white">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <select 
                      value={logFilterEndpoint}
                      onChange={(e) => setLogFilterEndpoint(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none font-semibold cursor-pointer"
                    >
                      <option value="all">Todos Endpoints</option>
                      {endpoints.map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                      ))}
                    </select>

                    <button 
                      onClick={handleClearLogs}
                      className="text-xs font-semibold px-4 py-2 bg-red-950/20 text-red-400 border border-red-900/30 rounded-xl hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar Logs
                    </button>
                  </div>
                </div>

                {/* Log View Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Logs List */}
                  <div className="lg:col-span-1 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1.5">
                    {filteredLogs.map(log => (
                      <div 
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedLog?.id === log.id 
                            ? 'bg-purple-600/10 border-purple-500 shadow-md' 
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold font-mono text-purple-400">{log.endpointId}</span>
                          <span className="text-[10px] text-slate-500">{formatTime(log.receivedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                              {log.method}
                            </span>
                            <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
                              {log.body && typeof log.body === 'object' 
                                ? (log.body.message || log.body.event || 'JSON Payload')
                                : 'No payload'}
                            </span>
                          </div>
                          {log.forwardStatus ? (
                            <span className={`badge text-[9px] py-0.5 px-2 ${log.forwardStatus >= 200 && log.forwardStatus < 300 ? 'badge-success' : 'badge-error'}`}>
                              {log.forwardStatus}
                            </span>
                          ) : (
                            <span className="badge badge-warning text-[9px]">Erro</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredLogs.length === 0 && (
                      <div className="bg-slate-900/20 border border-slate-800/50 rounded-xl p-8 text-center text-slate-500 text-sm">
                        Nenhum log encontrado para os filtros selecionados.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Log Inspector Detail */}
                  <div className="lg:col-span-2">
                    {selectedLog ? (
                      <div className="glow-card p-6 flex flex-col h-full max-h-[600px] overflow-y-auto">
                        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                          <div>
                            <h3 className="font-bold text-white text-lg font-display">Log Inspector</h3>
                            <p className="text-xs text-slate-400">ID do Log: {selectedLog.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-medium">Latência de Proxy:</span>
                            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                              {selectedLog.latencyMs}ms
                            </span>
                          </div>
                        </div>

                        {/* General Routing Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Detalhes da Entrada</span>
                            <div className="mt-1.5 text-xs flex flex-col gap-1">
                              <div><span className="text-slate-400 font-semibold">Endpoint:</span> <span className="font-mono text-purple-400">{selectedLog.endpointId}</span></div>
                              <div><span className="text-slate-400 font-semibold">Método:</span> <span className="font-bold text-slate-200">{selectedLog.method}</span></div>
                              <div><span className="text-slate-400 font-semibold">Recebido em:</span> <span className="text-slate-300">{new Date(selectedLog.receivedAt).toLocaleString()}</span></div>
                            </div>
                          </div>
                          <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Detalhes da Saída (Lovable Roteamento)</span>
                            <div className="mt-1.5 text-xs flex flex-col gap-1">
                              <div className="truncate"><span className="text-slate-400 font-semibold">Destino:</span> <span className="font-mono text-slate-300" title={selectedLog.forwardedTo}>{selectedLog.forwardedTo || 'Nenhum'}</span></div>
                              <div>
                                <span className="text-slate-400 font-semibold">Status de Envio:</span>{' '}
                                {selectedLog.forwardStatus ? (
                                  <span className={`badge text-[9px] py-0.5 px-2 ${selectedLog.forwardStatus >= 200 && selectedLog.forwardStatus < 300 ? 'badge-success' : 'badge-error'}`}>
                                    {selectedLog.forwardStatus}
                                  </span>
                                ) : (
                                  <span className="text-red-400">Falhou</span>
                                )}
                              </div>
                              {selectedLog.forwardError && (
                                <div className="text-red-400 truncate"><span className="text-slate-400 font-semibold">Erro:</span> {selectedLog.forwardError}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Payload Inspection Tabs */}
                        <div className="flex-1 flex flex-col gap-4">
                          {/* Request Body */}
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Request Body (Dados do WhatsApp)</span>
                            <pre className="bg-slate-950 border border-slate-900 rounded-lg p-4 font-mono text-xs text-purple-200 overflow-x-auto max-h-[160px] whitespace-pre-wrap">
                              {selectedLog.body ? JSON.stringify(selectedLog.body, null, 2) : 'Empty Body'}
                            </pre>
                          </div>

                          {/* Request Headers */}
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Request Headers</span>
                            <pre className="bg-slate-950 border border-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 overflow-x-auto max-h-[120px]">
                              {JSON.stringify(selectedLog.headers, null, 2)}
                            </pre>
                          </div>

                          {/* Forward Response */}
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Response do Alvo (Lovable Retorno)</span>
                            <pre className={`border rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-[120px] whitespace-pre-wrap ${
                              selectedLog.forwardStatus && selectedLog.forwardStatus >= 200 && selectedLog.forwardStatus < 300
                                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300'
                                : 'bg-red-950/20 border-red-900/30 text-red-300'
                            }`}>
                              {selectedLog.forwardResponse || 'Sem resposta de retorno.'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="glow-card p-10 text-center flex flex-col items-center justify-center gap-3 h-full min-h-[300px]">
                        <Search className="w-10 h-10 text-slate-700 animate-pulse" />
                        <div>
                          <h3 className="font-bold text-white text-base">Inspecione um Log</h3>
                          <p className="text-xs text-slate-400 max-w-sm mt-1">
                            Selecione uma requisição recebida na coluna da esquerda para ver as cabeçalhas, payloads e detalhes do roteamento.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <div>
          Anexe Webhook Router &copy; {new Date().getFullYear()} - Integrado com Lovable & Supabase API
        </div>
      </footer>

      {/* CREATE/EDIT ENDPOINT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white font-display">
                {modalMode === 'create' ? 'Criar Novo Endpoint' : 'Editar Endpoint'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={modalMode === 'create' ? handleCreateEndpoint : handleUpdateEndpoint} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  ID do Endpoint (slug da URL)
                </label>
                <input 
                  type="text" 
                  placeholder="ex: whatsapp-webhook"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={modalMode === 'edit'}
                  required
                  className="input-field disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                {modalMode === 'create' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    A URL será: <span className="font-mono text-purple-400">{webhookBaseUrl}{formData.id || 'id'}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nome Amigável
                </label>
                <input 
                  type="text" 
                  placeholder="ex: Webhook de Entrada WhatsApp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  URL de Destino (Lovable / Backend Target)
                </label>
                <input 
                  type="url" 
                  placeholder="ex: https://lovable.app/api/webhooks/xxxx"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  className="input-field font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Se deixado em branco, a requisição apenas gerará logs sem fazer repasse.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Chave de API (`x-api-key`)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Chave de segurança..."
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="input-field font-mono text-xs"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      apiKey: Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10) 
                    })}
                    className="bg-slate-900 border border-slate-800 text-slate-300 px-3 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Gerar
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  O remetente precisará passar este valor no cabeçalho `x-api-key` ou como parâmetro de query.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary text-xs"
                >
                  {modalMode === 'create' ? 'Criar Endpoint' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
