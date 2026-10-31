import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Check, X, Eye, Trash2 } from 'lucide-react';
import { LabelItem, MissingFieldType } from '../types/label';
import { ExcelLabelBox } from './ExcelLabelBox';

interface MissingDataModalProps {
  label: LabelItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLabel: LabelItem) => void;
  onDiscard: (labelId: string) => void;
  imagePreviewUrl?: string;
}

export const MissingDataModal: React.FC<MissingDataModalProps> = ({
  label,
  isOpen,
  onClose,
  onSave,
  onDiscard,
  imagePreviewUrl,
}) => {
  if (!isOpen || !label) return null;

  const [codigo, setCodigo] = useState(label.codigo || '');
  const [descricao, setDescricao] = useState(label.descricao || '');
  const [quantidade, setQuantidade] = useState(label.quantidade || '');
  const [validade, setValidade] = useState(label.validade || '');
  const [showPhotoPreview, setShowPhotoPreview] = useState(true);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (label) {
      setCodigo(label.codigo || '');
      setDescricao(label.descricao || '');
      setQuantidade(label.quantidade || '');
      setValidade(label.validade || '');

      // Focus the first empty field after modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [label]);

  const isFieldMissing = (field: MissingFieldType) => {
    if (!label) return false;
    return label.missingFields.includes(field) || !label[field];
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const missing: MissingFieldType[] = [];
    if (!codigo.trim()) missing.push('codigo');
    if (!descricao.trim()) missing.push('descricao');
    if (!quantidade.trim()) missing.push('quantidade');
    if (!validade.trim()) missing.push('validade');

    const updated: LabelItem = {
      ...label,
      codigo: codigo.trim(),
      descricao: descricao.trim(),
      quantidade: quantidade.trim(),
      validade: validade.trim(),
      missingFields: missing,
      needsManualReview: missing.length > 0,
    };

    onSave(updated);
  };

  const handleDiscardClick = () => {
    if (label) {
      onDiscard(label.id);
    }
  };

  const quickQuantities = ['1', '6', '7', '12', '24', '30', '48', '50', '100'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-[#011e38] border-2 border-[#38bdf8]/40 shadow-2xl text-[#e6f0ff] flex flex-col my-auto max-h-[92vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#00325f] border-b border-[#00325f]/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Informações Faltantes na Foto
              </h3>
              <p className="text-xs text-[#e6f0ff]/80">
                Preencha os campos abaixo ou cancele e descarte se não desejar usá-la.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#e6f0ff]/70 hover:text-white hover:bg-[#011e38] transition"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Optional Photo Reference Toggle */}
          {(imagePreviewUrl || label.imagePreviewUrl) && (
            <div className="rounded-xl bg-[#00325f]/40 border border-[#00325f] p-2.5">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-[#e6f0ff]/90 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Foto Original da Caixa / Etiqueta:
                </span>
                <button
                  type="button"
                  onClick={() => setShowPhotoPreview(!showPhotoPreview)}
                  className="text-[11px] text-[#38bdf8] hover:underline"
                >
                  {showPhotoPreview ? 'Ocultar foto' : 'Exibir foto'}
                </button>
              </div>

              {showPhotoPreview && (
                <div className="relative max-h-44 overflow-hidden rounded-lg border border-[#00325f] bg-black/40 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl || label.imagePreviewUrl}
                    alt="Foto da etiqueta anexada"
                    className="max-h-44 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          )}

          {/* Field 1: Código do Produto */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#e6f0ff] flex items-center gap-1.5">
                <span>Código do Produto</span>
                {isFieldMissing('codigo') && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono">
                    ⚠️ Ausente na foto
                  </span>
                )}
              </label>
              <span className="text-[10px] text-[#e6f0ff]/60">Ex: 53501, 90808</span>
            </div>
            <input
              ref={isFieldMissing('codigo') ? firstInputRef : undefined}
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Digite o código (ex: 53501)"
              className={`w-full rounded-xl bg-[#002242] border px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#e6f0ff]/30 focus:outline-hidden ${
                isFieldMissing('codigo')
                  ? 'border-amber-400 focus:border-amber-300 ring-2 ring-amber-400/20'
                  : 'border-[#00325f] focus:border-[#38bdf8]'
              }`}
              required
            />
          </div>

          {/* Field 2: Descrição do Produto */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#e6f0ff] flex items-center gap-1.5">
                <span>Descrição do Produto</span>
                {isFieldMissing('descricao') && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono">
                    ⚠️ Ausente na foto
                  </span>
                )}
              </label>
              <span className="text-[10px] text-[#e6f0ff]/60">Ex: SIAGE COND ACELERA</span>
            </div>
            <input
              ref={!isFieldMissing('codigo') && isFieldMissing('descricao') ? firstInputRef : undefined}
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite o nome ou descrição do produto"
              className={`w-full rounded-xl bg-[#002242] border px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#e6f0ff]/30 focus:outline-hidden ${
                isFieldMissing('descricao')
                  ? 'border-amber-400 focus:border-amber-300 ring-2 ring-amber-400/20'
                  : 'border-[#00325f] focus:border-[#38bdf8]'
              }`}
              required
            />
          </div>

          {/* Field 3: Quantidade & Field 4: Validade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantidade */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#e6f0ff] flex items-center gap-1.5">
                  <span>Quantidade (QTD)</span>
                  {isFieldMissing('quantidade') && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono">
                      ⚠️ Ausente
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-[#e6f0ff]/60">Ex: 48</span>
              </div>
              <input
                ref={
                  !isFieldMissing('codigo') &&
                  !isFieldMissing('descricao') &&
                  isFieldMissing('quantidade')
                    ? firstInputRef
                    : undefined
                }
                type="text"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 48"
                className={`w-full rounded-xl bg-[#002242] border px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#e6f0ff]/30 focus:outline-hidden ${
                  isFieldMissing('quantidade')
                    ? 'border-amber-400 focus:border-amber-300 ring-2 ring-amber-400/20'
                    : 'border-[#00325f] focus:border-[#38bdf8]'
                }`}
                required
              />
              {/* Quick Quantities Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {quickQuantities.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuantidade(q)}
                    className="px-2 py-0.5 rounded-md bg-[#00325f] hover:bg-[#0284c7] text-[#e6f0ff] text-[10px] font-mono border border-[#00325f] transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Validade */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#e6f0ff] flex items-center gap-1.5">
                  <span>Validade (VAL)</span>
                  {isFieldMissing('validade') && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-mono">
                      ⚠️ Ausente
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-[#e6f0ff]/60">Ex: 09/2029</span>
              </div>
              <input
                ref={
                  !isFieldMissing('codigo') &&
                  !isFieldMissing('descricao') &&
                  !isFieldMissing('quantidade') &&
                  isFieldMissing('validade')
                    ? firstInputRef
                    : undefined
                }
                type="text"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                placeholder="MM/AAAA ou DD/MM/AAAA"
                className={`w-full rounded-xl bg-[#002242] border px-3.5 py-2.5 text-sm font-mono text-white placeholder-[#e6f0ff]/30 focus:outline-hidden ${
                  isFieldMissing('validade')
                    ? 'border-amber-400 focus:border-amber-300 ring-2 ring-amber-400/20'
                    : 'border-[#00325f] focus:border-[#38bdf8]'
                }`}
                required
              />
              {/* Quick Validade format helper */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['12/2028', '06/2029', '08/2029', '09/2029', '12/2029'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValidade(v)}
                    className="px-1.5 py-0.5 rounded-md bg-[#00325f] hover:bg-[#0284c7] text-[#e6f0ff] text-[10px] font-mono border border-[#00325f] transition"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Consolas Preview inside modal */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-[#e6f0ff]/80 block mb-1.5">
              Prévia da Etiqueta (Consolas 120pt / 28pt):
            </span>
            <div className="bg-white p-2 rounded-xs shadow-inner">
              <ExcelLabelBox
                codigo={codigo}
                descricao={descricao}
                validade={validade}
                quantidade={quantidade}
                grayBackground={true}
                showBorder={false}
              />
            </div>
          </div>

          {/* Action Buttons: Cancelar & Esquecer vs Salvar */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#00325f]">
            <button
              type="button"
              onClick={handleDiscardClick}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-500/40 text-xs font-bold transition active:scale-95 shadow-md"
              title="Cancelar e esquecer esta etiqueta com dados faltantes"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Cancelar e Esquecer Etiqueta</span>
            </button>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-[#00325f]/60 hover:bg-[#00325f] text-xs font-semibold text-[#e6f0ff] transition"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-bold text-white border border-[#38bdf8]/60 shadow-lg transition active:scale-95"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Salvar e Concluir</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
