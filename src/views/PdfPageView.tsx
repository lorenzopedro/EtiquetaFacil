import React, { useState } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sliders,
  RotateCcw,
  Layers,
  ZoomIn,
} from 'lucide-react';
import { LabelItem, PrintSettings } from '../types/label';
import { generateLabelsPDF } from '../services/pdfGenerator';
import { exportLabelsToCSV } from '../services/csvExport';

interface PdfPageViewProps {
  labels: LabelItem[];
  settings: PrintSettings;
  onUpdateSettings: (settings: PrintSettings) => void;
}

export const PdfPageView: React.FC<PdfPageViewProps> = ({
  labels,
  settings,
  onUpdateSettings,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Flatten copies
  const expandedLabels: LabelItem[] = [];
  labels.forEach((item) => {
    const count = item.copias && item.copias > 0 ? item.copias : 1;
    for (let i = 0; i < count; i++) {
      expandedLabels.push(item);
    }
  });

  const totalCopies = expandedLabels.length;
  const labelsPerPage =
    settings.layoutMode === '3-per-page' ? 3 : settings.layoutMode === '6-per-page' ? 6 : 1;
  const totalSheets = Math.ceil(totalCopies / labelsPerPage) || 1;

  // Ensure current page index is valid
  const safePageIndex = Math.min(currentPageIndex, Math.max(0, totalSheets - 1));

  // Get labels for current preview page
  const pageLabels = expandedLabels.slice(
    safePageIndex * labelsPerPage,
    (safePageIndex + 1) * labelsPerPage
  );

  const handleDownload = () => {
    generateLabelsPDF(labels, settings);
  };

  const handleExportCSV = () => {
    exportLabelsToCSV(labels);
  };

  const handleResetSettings = () => {
    onUpdateSettings({
      layoutMode: '3-per-page',
      showBorder: true,
      grayBackground: true,
      fontSizeScale: 1.0,
      marginTop: 9,
      marginX: 10,
      gapY: 5.5,
    });
  };

  // Convert mm settings to percentages for responsive A4 preview container
  const marginTopMm = settings.marginTop ?? 9;
  const marginXMm = settings.marginX ?? 10;
  const gapYMm = settings.gapY ?? 5.5;

  const marginTopPct = (marginTopMm / 210) * 100;
  const marginXPct = (marginXMm / 297) * 100;
  const gapYPct = (gapYMm / 210) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-fade-in pb-8">
      {/* Banner */}
      <div className="rounded-3xl bg-radial from-[#00325f] to-[#011e38] border-2 border-[#00325f] p-5 sm:p-6 shadow-xl space-y-2 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#011e38] text-[#38bdf8] text-xs font-mono font-semibold border border-[#38bdf8]/30">
          <Printer className="w-3.5 h-3.5" />
          Pré-visualização Física A4 Paisagem
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Ajuste de Margens & Impressão A4
        </h2>
        <p className="text-xs sm:text-sm text-[#e6f0ff]/80">
          Visualize a folha física A4 Paisagem com fonte <strong>Consolas</strong>. Ajuste as margens superiores, laterais e espaçamento em tempo real antes de baixar o PDF.
        </p>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#002242] border border-[#00325f] p-3.5 text-center shadow-md">
          <span className="text-xl sm:text-2xl font-black text-white font-mono">{labels.length}</span>
          <span className="text-[11px] text-[#e6f0ff]/70 block mt-0.5">Modelos Únicos</span>
        </div>
        <div className="rounded-2xl bg-[#002242] border border-[#00325f] p-3.5 text-center shadow-md">
          <span className="text-xl sm:text-2xl font-black text-[#38bdf8] font-mono">{totalCopies}</span>
          <span className="text-[11px] text-[#e6f0ff]/70 block mt-0.5">Total de Etiquetas</span>
        </div>
        <div className="rounded-2xl bg-[#002242] border border-[#00325f] p-3.5 text-center shadow-md">
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{totalSheets}</span>
          <span className="text-[11px] text-[#e6f0ff]/70 block mt-0.5">Folhas A4</span>
        </div>
      </div>

      {/* Interactive A4 Physical Page Preview */}
      <div className="rounded-3xl bg-[#002242]/80 border-2 border-[#00325f] p-4 sm:p-6 shadow-2xl flex flex-col items-center space-y-4">
        {/* Preview Header & Controls */}
        <div className="w-full flex items-center justify-between text-xs font-semibold text-white px-1">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-[#38bdf8]" />
            <span>Simulador de Folha Física A4 (297mm x 210mm)</span>
          </div>

          {/* Page Pagination Controls */}
          {totalSheets > 1 && (
            <div className="flex items-center gap-2 bg-[#011e38] px-3 py-1 rounded-xl border border-[#00325f]">
              <button
                onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
                disabled={safePageIndex === 0}
                className="p-1 hover:text-[#38bdf8] disabled:opacity-30 transition"
                title="Página Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px]">
                Página {safePageIndex + 1} de {totalSheets}
              </span>
              <button
                onClick={() => setCurrentPageIndex((prev) => Math.min(totalSheets - 1, prev + 1))}
                disabled={safePageIndex >= totalSheets - 1}
                className="p-1 hover:text-[#38bdf8] disabled:opacity-30 transition"
                title="Próxima Página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Physical A4 Sheet Aspect Ratio Preview */}
        <div className="w-full relative bg-gray-400 p-2 sm:p-4 rounded-2xl border-4 border-gray-600 shadow-[0_15px_30px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Paper Sheet Container (297 x 210 aspect ratio) */}
          <div
            className="w-full relative bg-white rounded-xs shadow-xl overflow-hidden transition-all duration-200"
            style={{ aspectRatio: '297 / 210' }}
          >
            {labels.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-gray-500 bg-gray-100">
                <Layers className="w-12 h-12 text-gray-400 mb-2" />
                <p className="font-bold text-sm text-gray-700">Nenhuma etiqueta cadastrada no banco</p>
                <p className="text-xs text-gray-500 mt-1">
                  Adicione ou tire fotos de etiquetas para visualizar a folha A4 pronta.
                </p>
              </div>
            ) : (
              /* Printable Margins Boundary Box */
              <div
                className="absolute inset-0 flex flex-col transition-all duration-150"
                style={{
                  paddingTop: `${marginTopPct}%`,
                  paddingBottom: `${marginTopPct}%`,
                  paddingLeft: `${marginXPct}%`,
                  paddingRight: `${marginXPct}%`,
                  rowGap: `${gapYPct}%`,
                }}
              >
                {/* Render Grid based on layoutMode */}
                {settings.layoutMode === '3-per-page' && (
                  <div
                    className="w-full h-full flex flex-col"
                    style={{ rowGap: `${gapYPct}%` }}
                  >
                    {pageLabels.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`flex-1 rounded-xs flex flex-col justify-between p-2 font-consolas transition-all ${
                          settings.grayBackground ? 'bg-[#e9ebee]' : 'bg-white'
                        } ${settings.showBorder ? 'border-2 border-black' : 'border border-dashed border-gray-300'}`}
                        style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
                      >
                        {/* Large Code */}
                        <div className="text-center font-black tracking-tight text-black text-[clamp(14px,3.2vw,32px)] leading-none my-auto">
                          {item.codigo || '------'}
                        </div>
                        {/* Desc */}
                        <div className="font-bold text-black text-[clamp(8px,1.4vw,14px)] truncate uppercase tracking-tight">
                          DESC: {item.descricao || '------------------------'}
                        </div>
                        {/* Val & Qtd */}
                        <div className="flex items-center justify-between font-bold text-black text-[clamp(8px,1.4vw,14px)]">
                          <span>VAL: {item.validade || '--/----'}</span>
                          <span>QTD: {item.quantidade || '0'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {settings.layoutMode === '6-per-page' && (
                  <div
                    className="w-full h-full grid grid-cols-2 grid-rows-3 gap-2"
                    style={{ gap: `${gapYPct}%` }}
                  >
                    {pageLabels.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`rounded-xs flex flex-col justify-between p-1.5 font-consolas ${
                          settings.grayBackground ? 'bg-[#e9ebee]' : 'bg-white'
                        } ${settings.showBorder ? 'border-2 border-black' : 'border border-dashed border-gray-300'}`}
                        style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
                      >
                        <div className="text-center font-black tracking-tight text-black text-[clamp(10px,2vw,20px)] leading-none my-auto">
                          {item.codigo || '------'}
                        </div>
                        <div className="font-bold text-black text-[clamp(6px,1vw,10px)] truncate uppercase">
                          DESC: {item.descricao || '------------------------'}
                        </div>
                        <div className="flex items-center justify-between font-bold text-black text-[clamp(6px,1vw,10px)]">
                          <span>VAL: {item.validade || '--/----'}</span>
                          <span>QTD: {item.quantidade || '0'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {settings.layoutMode === '1-per-page' && pageLabels.length > 0 && (
                  <div
                    className={`w-full h-full rounded-xs flex flex-col justify-between p-6 font-consolas ${
                      settings.grayBackground ? 'bg-[#e9ebee]' : 'bg-white'
                    } ${settings.showBorder ? 'border-4 border-black' : 'border border-dashed border-gray-300'}`}
                    style={{ fontFamily: "Consolas, 'Courier New', monospace" }}
                  >
                    <div className="text-center font-black tracking-tight text-black text-[clamp(28px,7vw,64px)] leading-none my-auto">
                      {pageLabels[0].codigo || '------'}
                    </div>
                    <div className="font-bold text-black text-[clamp(12px,2.2vw,24px)] truncate uppercase">
                      DESC: {pageLabels[0].descricao || '------------------------'}
                    </div>
                    <div className="flex items-center justify-between font-bold text-black text-[clamp(12px,2.2vw,24px)]">
                      <span>VAL: {pageLabels[0].validade || '--/----'}</span>
                      <span>QTD: {pageLabels[0].quantidade || '0'}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings & Margin Control Panel */}
      <div className="rounded-3xl bg-[#00325f]/50 border-2 border-[#00325f] p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#00325f] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#38bdf8]" />
            <h3 className="text-base font-bold text-white">Configurações de Layout & Margens</h3>
          </div>
          <button
            onClick={handleResetSettings}
            className="flex items-center gap-1 text-xs text-[#38bdf8] hover:underline"
            title="Restaurar padrões de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>
        </div>

        {/* Layout Selection */}
        <div>
          <label className="text-xs font-bold text-[#e6f0ff] block mb-2">
            Disposição na Folha A4:
          </label>
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <button
              onClick={() => onUpdateSettings({ ...settings, layoutMode: '3-per-page' })}
              className={`p-3 rounded-2xl font-bold transition text-center flex flex-col items-center gap-1 ${
                settings.layoutMode === '3-per-page'
                  ? 'bg-white text-[#011e38] shadow-lg ring-2 ring-[#38bdf8]'
                  : 'bg-[#011e38] text-[#e6f0ff]/80 hover:text-white border border-[#00325f]'
              }`}
            >
              <span>Padrão (3 / folha)</span>
              <span className="text-[10px] opacity-75 font-normal">Ideal para caixas</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, layoutMode: '6-per-page' })}
              className={`p-3 rounded-2xl font-bold transition text-center flex flex-col items-center gap-1 ${
                settings.layoutMode === '6-per-page'
                  ? 'bg-white text-[#011e38] shadow-lg ring-2 ring-[#38bdf8]'
                  : 'bg-[#011e38] text-[#e6f0ff]/80 hover:text-white border border-[#00325f]'
              }`}
            >
              <span>Compacto (6 / folha)</span>
              <span className="text-[10px] opacity-75 font-normal">Economia de papel</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, layoutMode: '1-per-page' })}
              className={`p-3 rounded-2xl font-bold transition text-center flex flex-col items-center gap-1 ${
                settings.layoutMode === '1-per-page'
                  ? 'bg-white text-[#011e38] shadow-lg ring-2 ring-[#38bdf8]'
                  : 'bg-[#011e38] text-[#e6f0ff]/80 hover:text-white border border-[#00325f]'
              }`}
            >
              <span>Master (1 / folha)</span>
              <span className="text-[10px] opacity-75 font-normal">Gigante para caixas</span>
            </button>
          </div>
        </div>

        {/* Sliders for Margin Adjustments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Margem Superior */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Margem Superior</span>
              <span className="font-mono text-[#38bdf8]">{marginTopMm} mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={marginTopMm}
              onChange={(e) =>
                onUpdateSettings({ ...settings, marginTop: parseFloat(e.target.value) })
              }
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
          </div>

          {/* Margem Lateral */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Margem Lateral</span>
              <span className="font-mono text-[#38bdf8]">{marginXMm} mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={marginXMm}
              onChange={(e) =>
                onUpdateSettings({ ...settings, marginX: parseFloat(e.target.value) })
              }
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
          </div>

          {/* Espaçamento / Gap Vertical */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span>Espaçamento Entre Etiquetas</span>
              <span className="font-mono text-[#38bdf8]">{gapYMm} mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={0.5}
              value={gapYMm}
              onChange={(e) =>
                onUpdateSettings({ ...settings, gapY: parseFloat(e.target.value) })
              }
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
          </div>
        </div>

        {/* Font Scale & Options */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[#00325f]">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-white">Escala da Fonte:</span>
            {[0.8, 1.0, 1.2].map((scale) => (
              <button
                key={scale}
                onClick={() => onUpdateSettings({ ...settings, fontSizeScale: scale })}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition ${
                  settings.fontSizeScale === scale
                    ? 'bg-[#38bdf8] text-[#011e38]'
                    : 'bg-[#011e38] text-[#e6f0ff]/70 hover:text-white border border-[#00325f]'
                }`}
              >
                {scale}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-[#e6f0ff]">
              <input
                type="checkbox"
                checked={settings.grayBackground}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, grayBackground: e.target.checked })
                }
                className="rounded border-[#00325f] text-[#38bdf8] focus:ring-0"
              />
              <span>Fundo cinza</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#e6f0ff]">
              <input
                type="checkbox"
                checked={settings.showBorder}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showBorder: e.target.checked })
                }
                className="rounded border-[#00325f] text-[#38bdf8] focus:ring-0"
              />
              <span>Borda preta</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Download Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          disabled={labels.length === 0}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-xl shadow-[#0284c7]/25 transition active:scale-98 disabled:opacity-40"
        >
          <FileDown className="w-5 h-5" />
          <span>Baixar Arquivo PDF (A4 Paisagem)</span>
        </button>

        <button
          onClick={handleExportCSV}
          disabled={labels.length === 0}
          className="flex items-center justify-center gap-2 py-4 px-5 rounded-2xl bg-[#00325f] hover:bg-[#02437e] text-white font-semibold text-xs border border-[#00325f] transition active:scale-98 disabled:opacity-40"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Exportar Planilha CSV</span>
        </button>
      </div>
    </div>
  );
};
