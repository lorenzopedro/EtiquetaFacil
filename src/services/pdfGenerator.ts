import { jsPDF } from 'jspdf';
import { LabelItem, PrintSettings } from '../types/label';

/**
 * Renderiza uma única etiqueta em um Canvas de alta definição (2200x490px = ~300 DPI)
 * seguindo fielmente o modelo Excel da foto de referência:
 * - Código: Fonte 120pt em Negrito (Consolas) centralizado no topo
 * - Descrição, Validade e Quantidade: Fonte 28pt (prefixos regulares + valores em Negrito)
 */
function renderExcelLabelToCanvas(
  label: LabelItem,
  settings: PrintSettings
): string | null {
  if (typeof document === 'undefined') return null;

  const width = 2200;
  const height = 490;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const scale = settings.fontSizeScale || 1.0;
  const fontStack = "Consolas, 'Cascadia Mono', 'Source Code Pro', 'Courier New', monospace";

  // 1. Background
  ctx.fillStyle = settings.grayBackground ? '#e2e2e2' : '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Optional Border
  if (settings.showBorder) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);
  }

  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'alphabetic';

  // 3. Código do Produto (120pt equivalente = 332px na escala 2200x490, Negrito, Centralizado)
  const codeFontSize = Math.round(332 * scale);
  ctx.font = `bold ${codeFontSize}px ${fontStack}`;
  ctx.textAlign = 'center';
  const codeText = (label.codigo || '------').trim();
  ctx.fillText(codeText, width / 2, 268);

  // 4. Descrição (28pt equivalente = 77.5px na escala 2200x490: "DESC: " normal + Valor em Negrito)
  const metaFontSize = Math.round(77.5 * scale);
  ctx.textAlign = 'left';
  const descPrefix = 'DESC: ';
  const descValue = (label.descricao || '------------------------').trim().toUpperCase();

  ctx.font = `normal ${metaFontSize}px ${fontStack}`;
  ctx.fillText(descPrefix, 36, 372);
  const descPrefixWidth = ctx.measureText(descPrefix).width;

  ctx.font = `bold ${metaFontSize}px ${fontStack}`;
  ctx.fillText(descValue, 36 + descPrefixWidth, 372, width - 72 - descPrefixWidth);

  // 5. Validade (28pt equivalente: " VAL: " alinhado pelos dois-pontos com "DESC: ")
  const valPrefix = ' VAL: ';
  const valValue = (label.validade || '--/----').trim();

  ctx.font = `normal ${metaFontSize}px ${fontStack}`;
  ctx.fillText(valPrefix, 36, 462);
  const valPrefixWidth = ctx.measureText(valPrefix).width;

  ctx.font = `bold ${metaFontSize}px ${fontStack}`;
  ctx.fillText(valValue, 36 + valPrefixWidth, 462);

  // 6. Quantidade (28pt equivalente: posicionado na coluna direita ~62% como no Excel)
  const qtdX = 1356;
  const qtdPrefix = 'QTD: ';
  const qtdValue = (label.quantidade || '0').trim();

  ctx.font = `normal ${metaFontSize}px ${fontStack}`;
  ctx.fillText(qtdPrefix, qtdX, 462);
  const qtdPrefixWidth = ctx.measureText(qtdPrefix).width;

  ctx.font = `bold ${metaFontSize}px ${fontStack}`;
  ctx.fillText(qtdValue, qtdX + qtdPrefixWidth, 462);

  return canvas.toDataURL('image/png');
}

export function generateLabelsPDF(
  labels: LabelItem[],
  settings: PrintSettings = {
    layoutMode: '3-per-page',
    showBorder: false,
    grayBackground: true,
    fontSizeScale: 1.0,
    marginTop: 6,
    marginX: 7.5,
    gapY: 5.5,
  },
  filename = 'etiquetas_caixas_a4_paisagem.pdf'
): void {
  if (!labels || labels.length === 0) return;

  // Flatten copies if specified
  const expandedLabels: LabelItem[] = [];
  labels.forEach((item) => {
    const count = item.copias && item.copias > 0 ? item.copias : 1;
    for (let i = 0; i < count; i++) {
      expandedLabels.push(item);
    }
  });

  // A4 Landscape is 297mm wide x 210mm high
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  const marginX = settings.marginX ?? 7.5;
  const marginTop = settings.marginTop ?? 6;
  const gapY = settings.gapY ?? 5.5;

  if (settings.layoutMode === '3-per-page') {
    const labelsPerPage = 3;
    const labelWidth = pageWidth - marginX * 2;
    const labelHeight = Math.max(35, (pageHeight - marginTop * 2 - gapY * 2) / 3);

    expandedLabels.forEach((label, index) => {
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage('a4', 'landscape');
      }

      const positionInPage = index % labelsPerPage;
      const x = marginX;
      const y = marginTop + positionInPage * (labelHeight + gapY);

      const imgData = renderExcelLabelToCanvas(label, settings);
      if (imgData) {
        doc.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight, undefined, 'FAST');
      } else {
        // Vector fallback when running outside browser DOM
        if (settings.grayBackground) {
          doc.setFillColor(226, 226, 226);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(x, y, labelWidth, labelHeight, settings.showBorder ? 'FD' : 'F');
        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(120 * settings.fontSizeScale);
        doc.text(label.codigo || '------', x + labelWidth / 2, y + labelHeight * 0.55, { align: 'center' });
        doc.setFontSize(28 * settings.fontSizeScale);
        doc.text(`DESC: ${(label.descricao || '').toUpperCase()}`, x + 5, y + labelHeight * 0.76);
        doc.text(` VAL: ${label.validade || '--/----'}`, x + 5, y + labelHeight * 0.94);
        doc.text(`QTD: ${label.quantidade || '0'}`, x + labelWidth * 0.62, y + labelHeight * 0.94);
      }
    });
  } else if (settings.layoutMode === '6-per-page') {
    const gapX = 5;
    const cols = 2;
    const rows = 3;
    const labelsPerPage = cols * rows; // 6
    const labelWidth = (pageWidth - marginX * 2 - gapX) / 2;
    const labelHeight = Math.max(30, (pageHeight - marginTop * 2 - gapY * 2) / 3);

    expandedLabels.forEach((label, index) => {
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage('a4', 'landscape');
      }

      const positionInPage = index % labelsPerPage;
      const col = positionInPage % cols;
      const row = Math.floor(positionInPage / cols);

      const x = marginX + col * (labelWidth + gapX);
      const y = marginTop + row * (labelHeight + gapY);

      const imgData = renderExcelLabelToCanvas(label, settings);
      if (imgData) {
        doc.addImage(imgData, 'PNG', x, y, labelWidth, labelHeight, undefined, 'FAST');
      }
    });
  } else {
    // 1-per-page (Master Box Label)
    const labelWidth = pageWidth - marginX * 2;
    const labelHeight = pageHeight - marginTop * 2;

    expandedLabels.forEach((label, index) => {
      if (index > 0) doc.addPage('a4', 'landscape');

      const imgData = renderExcelLabelToCanvas(label, settings);
      if (imgData) {
        doc.addImage(imgData, 'PNG', marginX, marginTop, labelWidth, labelHeight, undefined, 'FAST');
      }
    });
  }

  doc.save(filename);
}
