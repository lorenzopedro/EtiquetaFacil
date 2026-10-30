import { jsPDF } from 'jspdf';
import { LabelItem, PrintSettings } from '../types/label';

export function generateLabelsPDF(
  labels: LabelItem[],
  settings: PrintSettings = {
    layoutMode: '3-per-page',
    showBorder: true,
    grayBackground: true,
    fontSizeScale: 1.0,
    marginTop: 9,
    marginX: 10,
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

  if (settings.layoutMode === '3-per-page') {
    // Exact layout matching the reference photo: 3 stacked labels
    const marginX = settings.marginX ?? 10;
    const marginTop = settings.marginTop ?? 9;
    const gapY = settings.gapY ?? 5.5;
    const labelWidth = pageWidth - marginX * 2; // 277mm
    const labelHeight = Math.max(35, (pageHeight - marginTop * 2 - gapY * 2) / 3);
    const labelsPerPage = 3;

    expandedLabels.forEach((label, index) => {
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage('a4', 'landscape');
      }

      const positionInPage = index % labelsPerPage;
      const x = marginX;
      const y = marginTop + positionInPage * (labelHeight + gapY);

      // Background
      if (settings.grayBackground) {
        doc.setFillColor(233, 235, 238); // Crisp light gray background like in photo
      } else {
        doc.setFillColor(255, 255, 255);
      }

      // Border
      if (settings.showBorder) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(x, y, labelWidth, labelHeight, 'FD');
      } else {
        doc.rect(x, y, labelWidth, labelHeight, 'F');
      }

      // Consolas / Monospace styling
      doc.setFont('courier', 'bold');
      doc.setTextColor(0, 0, 0);

      // 1. Massive bold Product Code (Centered)
      const codeFontSize = 46 * settings.fontSizeScale;
      doc.setFontSize(codeFontSize);
      const codeText = label.codigo || '------';
      doc.text(codeText, x + labelWidth / 2, y + 25, { align: 'center' });

      // 2. Middle Row: DESC: [DESCRICAO]
      const metaFontSize = 14 * settings.fontSizeScale;
      doc.setFontSize(metaFontSize);
      const descText = `DESC: ${(label.descricao || '').toUpperCase()}`;
      // Truncate if too long to prevent spillover
      const safeDesc = doc.splitTextToSize(descText, labelWidth - 14)[0];
      doc.text(safeDesc, x + 7, y + 39);

      // 3. Bottom Row: VAL: [VALIDADE] (left) and QTD: [QUANTIDADE] (right)
      const valText = `VAL: ${label.validade || '--/----'}`;
      const qtdText = `QTD: ${label.quantidade || '0'}`;

      doc.text(valText, x + 7, y + 51);
      doc.text(qtdText, x + labelWidth - 7, y + 51, { align: 'right' });
    });
  } else if (settings.layoutMode === '6-per-page') {
    // 2 columns x 3 rows grid
    const marginX = 8;
    const marginTop = 8;
    const gapX = 6;
    const gapY = 5;
    const cols = 2;
    const rows = 3;
    const labelsPerPage = cols * rows; // 6
    const labelWidth = (pageWidth - marginX * 2 - gapX) / 2; // ~137.5mm
    const labelHeight = (pageHeight - marginTop * 2 - gapY * 2) / 3; // ~61mm

    expandedLabels.forEach((label, index) => {
      if (index > 0 && index % labelsPerPage === 0) {
        doc.addPage('a4', 'landscape');
      }

      const positionInPage = index % labelsPerPage;
      const col = positionInPage % cols;
      const row = Math.floor(positionInPage / cols);

      const x = marginX + col * (labelWidth + gapX);
      const y = marginTop + row * (labelHeight + gapY);

      if (settings.grayBackground) {
        doc.setFillColor(233, 235, 238);
      } else {
        doc.setFillColor(255, 255, 255);
      }

      if (settings.showBorder) {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.6);
        doc.rect(x, y, labelWidth, labelHeight, 'FD');
      } else {
        doc.rect(x, y, labelWidth, labelHeight, 'F');
      }

      doc.setFont('courier', 'bold');
      doc.setTextColor(0, 0, 0);

      // Large code
      doc.setFontSize(30 * settings.fontSizeScale);
      doc.text(label.codigo || '------', x + labelWidth / 2, y + 22, { align: 'center' });

      // Description
      doc.setFontSize(10 * settings.fontSizeScale);
      const descText = `DESC: ${(label.descricao || '').toUpperCase()}`;
      const safeDesc = doc.splitTextToSize(descText, labelWidth - 8)[0];
      doc.text(safeDesc, x + 5, y + 36);

      // Val & Qtd
      doc.setFontSize(11 * settings.fontSizeScale);
      doc.text(`VAL: ${label.validade || '--/----'}`, x + 5, y + 49);
      doc.text(`QTD: ${label.quantidade || '0'}`, x + labelWidth - 5, y + 49, { align: 'right' });
    });
  } else {
    // 1-per-page (Giant Master Box Label)
    const marginX = 12;
    const marginTop = 12;
    const labelWidth = pageWidth - marginX * 2;
    const labelHeight = pageHeight - marginTop * 2;

    expandedLabels.forEach((label, index) => {
      if (index > 0) doc.addPage('a4', 'landscape');

      if (settings.grayBackground) {
        doc.setFillColor(233, 235, 238);
      } else {
        doc.setFillColor(255, 255, 255);
      }

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1.0);
      doc.rect(marginX, marginTop, labelWidth, labelHeight, 'FD');

      doc.setFont('courier', 'bold');
      doc.setTextColor(0, 0, 0);

      // Enormous code
      doc.setFontSize(90 * settings.fontSizeScale);
      doc.text(label.codigo || '------', marginX + labelWidth / 2, marginTop + 75, { align: 'center' });

      // Description
      doc.setFontSize(28 * settings.fontSizeScale);
      const descText = `DESC: ${(label.descricao || '').toUpperCase()}`;
      doc.text(descText, marginX + 16, marginTop + 125);

      // Val & Qtd
      doc.setFontSize(32 * settings.fontSizeScale);
      doc.text(`VAL: ${label.validade || '--/----'}`, marginX + 16, marginTop + 165);
      doc.text(`QTD: ${label.quantidade || '0'}`, marginX + labelWidth - 16, marginTop + 165, { align: 'right' });
    });
  }

  // Save the PDF
  doc.save(filename);
}
