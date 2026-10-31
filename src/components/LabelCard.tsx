import React from 'react';
import { AlertCircle, Edit3, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { LabelItem } from '../types/label';
import { ExcelLabelBox } from './ExcelLabelBox';

interface LabelCardProps {
  label: LabelItem;
  onEdit: (label: LabelItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (label: LabelItem) => void;
  onFixMissing: (label: LabelItem) => void;
  onUpdateCopies: (id: string, copies: number) => void;
}

export const LabelCard: React.FC<LabelCardProps> = ({
  label,
  onEdit,
  onDelete,
  onDuplicate,
  onFixMissing,
  onUpdateCopies,
}) => {
  const hasMissing = label.missingFields && label.missingFields.length > 0;
  const copies = label.copias || 1;

  const getMissingLabel = (field: string) => {
    switch (field) {
      case 'codigo':
        return 'Código';
      case 'descricao':
        return 'Descrição';
      case 'quantidade':
        return 'Quantidade';
      case 'validade':
        return 'Validade';
      default:
        return field;
    }
  };

  return (
    <div className="flex flex-col rounded-2xl bg-[#00325f]/50 border border-[#00325f] overflow-hidden shadow-lg transition-all hover:border-[#38bdf8]/50">
      {/* Card Header Status Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#00325f] text-xs">
        <div className="flex items-center gap-2">
          {hasMissing ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium text-[11px] border border-amber-500/40">
              <AlertCircle className="w-3.5 h-3.5" />
              Dados pendentes ({label.missingFields.length})
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completa
            </span>
          )}

          {label.tipoOrigem && (
            <span className="text-[#e6f0ff]/60 text-[11px] font-mono capitalize">
              • {label.tipoOrigem === 'manuscrita' ? '✍️ Manuscrita' : '🏭 Fábrica'}
            </span>
          )}
        </div>

        {/* Copies Counter and Actions */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#011e38] rounded-lg px-1.5 py-0.5 border border-[#00325f]">
            <button
              onClick={() => onUpdateCopies(label.id, Math.max(1, copies - 1))}
              className="text-xs px-1 text-[#e6f0ff]/70 hover:text-white"
              title="Diminuir cópias"
            >
              -
            </button>
            <span className="text-[11px] font-mono px-1.5 font-bold text-[#e6f0ff]">
              {copies}x
            </span>
            <button
              onClick={() => onUpdateCopies(label.id, copies + 1)}
              className="text-xs px-1 text-[#e6f0ff]/70 hover:text-white"
              title="Aumentar cópias"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onDuplicate(label)}
            className="p-1 rounded-lg text-[#e6f0ff]/70 hover:text-white hover:bg-[#011e38] transition"
            title="Duplicar etiqueta"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(label)}
            className="p-1 rounded-lg text-[#e6f0ff]/70 hover:text-[#38bdf8] hover:bg-[#011e38] transition"
            title="Editar dados"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(label.id)}
            className="p-1 rounded-lg text-[#e6f0ff]/70 hover:text-red-400 hover:bg-[#011e38] transition"
            title="Excluir etiqueta"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Missing Fields Warning Banner */}
      {hasMissing && (
        <div className="bg-amber-950/40 border-b border-amber-600/30 px-3.5 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-amber-300">Falta:</span>
            {label.missingFields.map((f) => (
              <span
                key={f}
                className="bg-amber-500/30 text-amber-100 px-1.5 py-0.5 rounded text-[10px] font-mono"
              >
                {getMissingLabel(f)}
              </span>
            ))}
          </div>
          <button
            onClick={() => onFixMissing(label)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-[11px] px-2.5 py-1 rounded-md shadow-xs transition active:scale-95 shrink-0"
          >
            Completar agora
          </button>
        </div>
      )}

      {/* Exact Visual Label Representation (Padrão Excel Consolas 120pt / 28pt) */}
      <div className="p-3 bg-white/95 m-2.5 rounded-sm shadow-inner">
        <ExcelLabelBox
          codigo={label.codigo}
          descricao={label.descricao}
          validade={label.validade}
          quantidade={label.quantidade}
          grayBackground={true}
          showBorder={false}
        />
      </div>
    </div>
  );
};
