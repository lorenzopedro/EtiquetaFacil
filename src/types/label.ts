export type MissingFieldType = 'codigo' | 'descricao' | 'quantidade' | 'validade';

export interface LabelItem {
  id: string;
  codigo: string;
  descricao: string;
  quantidade: string;
  validade: string;
  tipoOrigem?: 'fabrica' | 'manuscrita';
  observacoes?: string;
  missingFields: MissingFieldType[];
  needsManualReview: boolean;
  createdAt: number;
  imagePreviewUrl?: string;
  copias?: number;
}

export type LayoutMode = '3-per-page' | '6-per-page' | '1-per-page';

export interface PrintSettings {
  layoutMode: LayoutMode;
  showBorder: boolean;
  grayBackground: boolean;
  fontSizeScale: number; // 0.8 to 1.3
  marginTop: number; // mm (default 9)
  marginX: number; // mm (default 10)
  gapY: number; // mm (default 5.5)
}
