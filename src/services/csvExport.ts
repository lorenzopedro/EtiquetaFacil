import { LabelItem } from '../types/label';

export function exportLabelsToCSV(labels: LabelItem[], filename = 'etiquetas_caixas.csv'): void {
  if (!labels || labels.length === 0) return;

  const headers = [
    'Codigo_Produto',
    'Descricao_Produto',
    'Quantidade',
    'Data_Validade',
    'Tipo_Origem',
    'Observacoes',
    'Data_Registro',
  ];

  const escapeField = (text: string | number | undefined): string => {
    if (text === undefined || text === null) return '""';
    const str = String(text).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = labels.map((l) => [
    escapeField(l.codigo),
    escapeField(l.descricao),
    escapeField(l.quantidade),
    escapeField(l.validade),
    escapeField(l.tipoOrigem || 'fabrica'),
    escapeField(l.observacoes || ''),
    escapeField(new Date(l.createdAt).toLocaleString('pt-BR')),
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel compatibility
    [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
