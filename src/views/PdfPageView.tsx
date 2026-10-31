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
import { ExcelLabelBox } from '../components/ExcelLabelBox';

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
      showBorder: false,
      grayBackground: true,
      fontSizeScale: 1.0,
      marginTop: 6,
      marginX: 7.5,
      gapY: 5.5,
    });
  };

  // Convert mm settings to percentages for responsive A4 preview container
  const marginTopMm = settings.marginTop ?? 6;
  const marginXMm = settings.marginX ?? 7.5;
  const gapYMm = settings.gapY ?? 5.5;

  const marginTopPct = (marginTopMm / 210) * 100;
  const marginXPct = (marginXMm / 297) * 100;
  const gapYPct = (gapYMm / 210) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full animate-fade-in pb-8">
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
      <div className="rounded-3xl bg-[#002242]/80 border-2 border-[#00325f] p-3 sm:p-6 shadow-2xl flex flex-col items-center space-y-4">
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
        <div className="w-full relative bg-gray-400 p-2 sm:p-3.5 rounded-2xl border-4 border-gray-600 shadow-[0_15px_30px_rgba(0,0,0,0.6)] overflow-hidden">
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
                }}
              >
                {/* Render Grid based on layoutMode */}
                {settings.layoutMode === '3-per-page' && (
                  <div
                    className="w-full h-full grid grid-rows-3"
                    style={{ rowGap: `${gapYPct}%` }}
                  >
                    {[0, 1, 2].map((slotIdx) => {
                      const item = pageLabels[slotIdx];
                      if (!item) {
                        return <div key={`empty-${slotIdx}`} className="w-full h-full" />;
                      }
                      return (
                        <div key={`${item.id}-${slotIdx}`} className="w-full h-full flex items-center justify-center overflow-hidden">
                          <ExcelLabelBox
                            codigo={item.codigo}
                            descricao={item.descricao}
                            validade={item.validade}
                            quantidade={item.quantidade}
                            grayBackground={settings.grayBackground}
                            showBorder={settings.showBorder}
                            fontSizeScale={settings.fontSizeScale}
                            className="w-full h-full !aspect-auto"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {settings.layoutMode === '6-per-page' && (
                  <div
                    className="w-full h-full grid grid-cols-2 grid-rows-3"
                    style={{ gap: `${gapYPct}%` }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                      const item = pageLabels[slotIdx];
                      if (!item) {
                        return <div key={`empty-6-${slotIdx}`} className="w-full h-full" />;
                      }
                      return (
                        <div key={`${item.id}-${slotIdx}`} className="w-full h-full flex items-center justify-center overflow-hidden">
                          <ExcelLabelBox
                            codigo={item.codigo}
                            descricao={item.descricao}
                            validade={item.validade}
                            quantidade={item.quantidade}
                            grayBackground={settings.grayBackground}
                            showBorder={settings.showBorder}
                            fontSizeScale={settings.fontSizeScale}
                            className="w-full h-full !aspect-auto"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {settings.layoutMode === '1-per-page' && pageLabels.length > 0 && (
                  <div className="w-full h-full flex items-center justify-center overflow-hidden">
                    <ExcelLabelBox
                      codigo={pageLabels[0].codigo}
                      descricao={pageLabels[0].descricao}
                      validade={pageLabels[0].validade}
                      quantidade={pageLabels[0].quantidade}
                      grayBackground={settings.grayBackground}
                      showBorder={settings.showBorder}
                      fontSizeScale={settings.fontSizeScale}
                      className="w-full h-full !aspect-auto"
                    />
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
              <span className="text-[10px] opacity-75 font-normal">Modelo Excel (120pt)</span>
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
            {[0.8, 1.0, 1.15].map((scale) => (
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
