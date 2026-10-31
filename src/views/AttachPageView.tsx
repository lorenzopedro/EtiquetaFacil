import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Upload,
  PlusCircle,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Activity,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ModelQuotaItem {
  model: string;
  status: 'available' | 'exhausted' | 'unknown';
  retryAfterText?: string;
  lastError?: string;
}

interface QuotaStatusResponse {
  hasApiKey: boolean;
  availableCount: number;
  totalModels: number;
  models: ModelQuotaItem[];
  dashboardUrl: string;
}

interface AttachPageViewProps {
  onOpenCamera: () => void;
  onSelectFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenManual: () => void;
  isAnalyzing: boolean;
  analyzingStatus: string;
}

export const AttachPageView: React.FC<AttachPageViewProps> = ({
  onOpenCamera,
  onSelectFile,
  onOpenManual,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quotaData, setQuotaData] = useState<QuotaStatusResponse | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);

  const fetchQuotaStatus = async () => {
    try {
      const res = await fetch('/api/quota-status');
      if (res.ok) {
        const data = await res.json();
        setQuotaData(data);
      }
    } catch {
      // Ignore network errors when offline
    }
  };

  const runLiveQuotaCheck = async () => {
    setIsCheckingQuota(true);
    try {
      const res = await fetch('/api/quota-status/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setQuotaData(data);
      }
    } catch {
      // Ignore offline errors
    } finally {
      setIsCheckingQuota(false);
    }
  };

  useEffect(() => {
    fetchQuotaStatus();
  }, []);

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full animate-fade-in">
      {/* Main Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Live Camera */}
        <button
          onClick={onOpenCamera}
          className="flex flex-col items-start justify-between p-5 rounded-3xl bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xl shadow-[#0284c7]/20 transition-all active:scale-98 border border-[#38bdf8]/40 text-left min-h-[140px] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Tirar Foto da Caixa</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Câmera com mira de alinhamento
            </p>
          </div>
        </button>

        {/* Card 2: Gallery Picker */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-start justify-between p-5 rounded-3xl bg-[#00325f] hover:bg-[#02437e] text-white shadow-xl transition-all active:scale-98 border border-[#38bdf8]/40 text-left min-h-[140px] group"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#011e38] flex items-center justify-center text-[#38bdf8] group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Anexar Fotos da Galeria</h3>
            <p className="text-xs text-[#e6f0ff]/70 mt-0.5">
              Selecione uma ou mais fotos do aparelho
            </p>
          </div>
        </button>

        {/* Card 3: Manual Entry (Spans 2 columns on sm screens for balanced UI) */}
        <button
          onClick={onOpenManual}
          className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-3xl bg-[#002242] hover:bg-[#002d57] text-[#e6f0ff] transition-all active:scale-98 border border-[#00325f] text-left gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00325f] flex items-center justify-center text-[#e6f0ff] group-hover:scale-110 transition-transform shrink-0">
              <PlusCircle className="w-6 h-6 text-[#38bdf8]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Preenchimento Manual</h3>
              <p className="text-xs text-[#e6f0ff]/70 mt-0.5">
                Inserir código, descrição, quantidade e validade sem foto
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onSelectFile}
      />

      {/* AI Credits & Quota Status Panel */}
      <div className="rounded-2xl bg-[#002242] border border-[#00325f] p-4 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#00325f] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#38bdf8]" />
            <h4 className="font-bold text-white text-xs sm:text-sm">
              Status de Créditos / Cota Gratuita de IA
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={runLiveQuotaCheck}
              disabled={isCheckingQuota}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00325f] hover:bg-[#02437e] text-white text-xs font-semibold border border-[#38bdf8]/40 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#38bdf8] ${isCheckingQuota ? 'animate-spin' : ''}`} />
              <span>{isCheckingQuota ? 'Testando modelos...' : 'Verificar Créditos Agora'}</span>
            </button>
            <a
              href="https://ai.dev/rate-limit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#011e38] hover:bg-[#00325f] text-[#38bdf8] text-xs font-mono border border-[#00325f] transition"
              title="Abrir painel oficial de limites do Google AI"
            >
              <span>Painel Google</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <p className="text-[11px] text-[#e6f0ff]/80 leading-relaxed">
          No plano gratuito do Google Gemini, cada modelo possui uma cota independente de <strong>20 análises por dia</strong>. Quando um modelo atinge o limite diário (Erro 429), o sistema troca automaticamente para os outros modelos disponíveis abaixo:
        </p>

        {quotaData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {quotaData.models.map((m) => {
              const isAvailable = m.status === 'available';
              return (
                <div
                  key={m.model}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs ${
                    isAvailable
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isAvailable ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="font-mono text-[11px] font-bold truncate">{m.model}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/30 shrink-0 ml-2">
                    {isAvailable
                      ? 'Disponível'
                      : m.retryAfterText
                      ? `Esgotado (renova em ${m.retryAfterText})`
                      : 'Cota 20/dia atingida'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Checklist / Requirement Tips */}
      <div className="rounded-2xl bg-[#00325f]/40 border border-[#00325f] p-4 text-xs space-y-2 text-[#e6f0ff]/90">
        <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
          <Info className="w-4 h-4 text-[#38bdf8]" />
          Informações Reconhecidas na Foto:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="bg-[#011e38]/70 p-2.5 rounded-xl border border-[#00325f] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Código do Produto</span>
          </div>
          <div className="bg-[#011e38]/70 p-2.5 rounded-xl border border-[#00325f] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Descrição do Produto</span>
          </div>
          <div className="bg-[#011e38]/70 p-2.5 rounded-xl border border-[#00325f] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Quantidade (QTD)</span>
          </div>
          <div className="bg-[#011e38]/70 p-2.5 rounded-xl border border-[#00325f] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Data de Validade (VAL)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
