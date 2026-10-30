import React, { useRef } from 'react';
import {
  Camera,
  Upload,
  PlusCircle,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

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
  isAnalyzing,
  analyzingStatus,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full animate-fade-in">
      {/* Title & Banner */}
      <div className="rounded-3xl bg-radial from-[#00325f] to-[#011e38] border-2 border-[#00325f] p-5 sm:p-6 shadow-xl space-y-2 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011e38] text-[#38bdf8] text-xs font-mono font-semibold border border-[#38bdf8]/30">
          <Sparkles className="w-3.5 h-3.5" />
          Reconhecimento OCR • Fábrica & Manuscrito
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Anexar Fotos para Gerar Etiquetas
        </h2>
        <p className="text-xs sm:text-sm text-[#e6f0ff]/80">
          Tire uma foto ou selecione imagens de caixas. O sistema lê Código, Descrição, Quantidade e Validade. Se algo faltar na foto, você poderá preencher manualmente.
        </p>
      </div>

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

      {/* Checklist / Requirement Tips */}
      <div className="rounded-2xl bg-[#00325f]/40 border border-[#00325f] p-4 text-xs space-y-2 text-[#e6f0ff]/90">
        <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
          <Info className="w-4 h-4 text-[#38bdf8]" />
          Informações Reconhecidas na Foto:
        </h4>
        <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 bg-[#011e38] p-2 rounded-xl border border-[#00325f]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Código do Produto</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#011e38] p-2 rounded-xl border border-[#00325f]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descrição do Produto</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#011e38] p-2 rounded-xl border border-[#00325f]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quantidade (QTD)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#011e38] p-2 rounded-xl border border-[#00325f]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data de Validade (VAL)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
