import { LabelItem, MissingFieldType } from '../types/label';

export function detectMissingFields(label: Partial<LabelItem>): MissingFieldType[] {
  const missing: MissingFieldType[] = [];
  if (!label.codigo || !label.codigo.trim()) missing.push('codigo');
  if (!label.descricao || !label.descricao.trim()) missing.push('descricao');
  if (!label.quantidade || !label.quantidade.toString().trim()) missing.push('quantidade');
  if (!label.validade || !label.validade.trim()) missing.push('validade');
  return missing;
}

export function formatLabelText(text: string): string {
  return (text || '').trim().toUpperCase();
}

export function calculateSheetCount(totalLabels: number, perSheet: number = 3): number {
  if (totalLabels <= 0) return 0;
  return Math.ceil(totalLabels / perSheet);
}
