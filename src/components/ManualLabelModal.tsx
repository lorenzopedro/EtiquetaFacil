import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, X, Check } from 'lucide-react';
import { LabelItem } from '../types/label';

interface ManualLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (label: LabelItem) => void;
  initialLabel?: LabelItem | null;
}

export const ManualLabelModal: React.FC<ManualLabelModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialLabel,
}) => {
  const [codigo, setCodigo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [validade, setValidade] = useState('');
  const [copias, setCopias] = useState(1);
  const [tipoOrigem, setTipoOrigem] = useState<'fabrica' | 'manuscrita'>('fabrica');

  useEffect(() => {
    if (initialLabel) {
      setCodigo(initialLabel.codigo || '');
      setDescricao(initialLabel.descricao || '');
      setQuantidade(initialLabel.quantidade || '');
      setValidade(initialLabel.validade || '');
      setCopias(initialLabel.copias || 1);
      setTipoOrigem(initialLabel.tipoOrigem || 'fabrica');
    } else {
      setCodigo('');
      setDescricao('');
      setQuantidade('');
      setValidade('');
      setCopias(1);
      setTipoOrigem('fabrica');
    }
  }, [initialLabel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missing: ('codigo' | 'descricao' | 'quantidade' | 'validade')[] = [];
    if (!codigo.trim()) missing.push('codigo');
    if (!descricao.trim()) missing.push('descricao');
    if (!quantidade.trim()) missing.push('quantidade');
    if (!validade.trim()) missing.push('validade');

    const label: LabelItem = {
      id: initialLabel ? initialLabel.id : `label-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      codigo: codigo.trim(),
      descricao: descricao.trim(),
      quantidade: quantidade.trim(),
      validade: validade.trim(),
      copias: Math.max(1, copias),
      tipoOrigem,
      missingFields: missing,
      needsManualReview: missing.length > 0,
      createdAt: initialLabel ? initialLabel.createdAt : Date.now(),
      imagePreviewUrl: initialLabel?.imagePreviewUrl,
    };

    onSave(label);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-[#011e38] border-2 border-[#00325f] shadow-2xl text-[#e6f0ff] overflow-hidden my-auto">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#00325f] border-b border-[#00325f]">
          <div className="flex items-center gap-2">
            {initialLabel ? (
              <Edit3 className="w-5 h-5 text-[#38bdf8]" />
            ) : (
              <PlusCircle className="w-5 h-5 text-[#38bdf8]" />
            )}
            <h3 className="text-base font-bold text-white">
              {initialLabel ? 'Editar Etiqueta' : 'Nova Etiqueta Manual'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#e6f0ff]/70 hover:text-white hover:bg-[#011e38]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-[#e6f0ff]">
              Código do Produto (SKU / Referência)
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex: 90808"
              className="w-full rounded-xl bg-[#002242] border border-[#00325f] px-3.5 py-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-[#38bdf8]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[#e6f0ff]">
              Descrição do Produto
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: ESTJ MALBEC CLUB REG/26"
              className="w-full rounded-xl bg-[#002242] border border-[#00325f] px-3.5 py-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-[#38bdf8]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#e6f0ff]">
                Quantidade (QTD)
              </label>
              <input
                type="text"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 7"
                className="w-full rounded-xl bg-[#002242] border border-[#00325f] px-3.5 py-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-[#38bdf8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#e6f0ff]">
                Validade (VAL)
              </label>
              <input
                type="text"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
                placeholder="MM/AAAA"
                className="w-full rounded-xl bg-[#002242] border border-[#00325f] px-3.5 py-2.5 text-sm font-mono text-white focus:outline-hidden focus:border-[#38bdf8]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#e6f0ff]">
                Cópias para impressão
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={copias}
                onChange={(e) => setCopias(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl bg-[#002242] border border-[#00325f] px-3.5 py-2 text-sm font-mono text-white focus:outline-hidden focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#e6f0ff]">
                Tipo de Origem
              </label>
              <select
                value={tipoOrigem}
                onChange={(e) => setTipoOrigem(e.target.value as any)}
                className="w-full rounded-xl bg-[#002242] border border-[#00325f] px-3.5 py-2 text-sm font-mono text-white focus:outline-hidden focus:border-[#38bdf8]"
              >
                <option value="fabrica">Fábrica (Impressa)</option>
                <option value="manuscrita">Manuscrita (À mão)</option>
              </select>
            </div>
          </div>

          {/* Consolas Preview */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-[#e6f0ff]/80 block mb-1">
              Padrão da Etiqueta:
            </span>
            <div
              className="bg-[#e5e7eb] text-black border-2 border-black rounded-xs p-2.5 font-consolas select-none"
              style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
            >
              <div className="text-center font-black text-2xl text-black">
                {codigo || '90808'}
              </div>
              <div className="text-xs font-bold truncate text-black mt-1">
                DESC: {(descricao || 'ESTJ MALBEC CLUB REG/26').toUpperCase()}
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-black mt-0.5">
                <span>VAL: {validade || '06/2029'}</span>
                <span>QTD: {quantidade || '7'}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#00325f]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#00325f]/60 hover:bg-[#00325f] text-xs font-semibold text-[#e6f0ff] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00325f] hover:bg-[#02437e] text-xs font-bold text-white border border-[#38bdf8]/60 shadow-lg transition"
            >
              <Check className="w-4 h-4 text-[#38bdf8]" />
              {initialLabel ? 'Atualizar Etiqueta' : 'Salvar Etiqueta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
