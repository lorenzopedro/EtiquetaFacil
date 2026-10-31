import React from 'react';

interface ExcelLabelBoxProps {
  codigo: string;
  descricao: string;
  validade: string;
  quantidade: string;
  grayBackground?: boolean;
  showBorder?: boolean;
  fontSizeScale?: number;
  className?: string;
}

/**
 * Renderiza uma etiqueta fiel ao modelo Excel de fábrica (image_af65a410.png):
 * - Fonte: Consolas (com zero cortado)
 * - Código do produto: tamanho 120pt em negrito, centralizado e bem grande no topo
 * - Descrição (DESC:): tamanho 28pt (prefixo regular, valor em negrito)
 * - Validade (VAL:) e Quantidade (QTD:): tamanho 28pt (prefixo regular, valor em negrito),
 *   com os dois-pontos de VAL: alinhados com DESC: e QTD: alinhado na coluna da direita (~63%).
 */
export const ExcelLabelBox: React.FC<ExcelLabelBoxProps> = ({
  codigo,
  descricao,
  validade,
  quantidade,
  grayBackground = true,
  showBorder = false,
  fontSizeScale = 1.0,
  className = '',
}) => {
  // Coordenadas baseadas na proporção exata de cada faixa na folha A4 Paisagem (880 x 196 -> 1100 x 245)
  // Proporção das fontes no Excel: Código = 120pt (negrito) | DESC, VAL, QTD = 28pt (120 / 28 = 4.2857x)
  const codeFontSize = Math.round(166 * fontSizeScale);
  const metaFontSize = Math.round(38.7 * fontSizeScale);

  const displayCode = codigo ? codigo.trim() : '------';
  const displayDesc = (descricao ? descricao.trim() : '------------------------').toUpperCase();
  const displayVal = validade ? validade.trim() : '--/----';
  const displayQtd = quantidade ? quantidade.trim() : '--';

  const bgColor = grayBackground ? '#e2e2e2' : '#ffffff';

  return (
    <div
      className={`w-full select-none overflow-hidden ${
        showBorder ? 'border-2 border-black' : ''
      } ${className}`}
      style={{
        backgroundColor: bgColor,
        aspectRatio: '1100 / 245',
      }}
    >
      <svg
        viewBox="0 0 1100 245"
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Fundo da Etiqueta */}
        <rect width="1100" height="245" fill={bgColor} />

        {/* 1. CÓDIGO DO PRODUTO: Tamanho 120pt no Excel, Negrito, Centralizado */}
        <text
          x="550"
          y="134"
          textAnchor="middle"
          fill={codigo ? '#000000' : '#dc2626'}
          fontFamily="Consolas, 'Cascadia Mono', 'Source Code Pro', 'Courier New', monospace"
          fontWeight="700"
          fontSize={codeFontSize}
          style={{
            fontVariantNumeric: 'slashed-zero',
            fontFeatureSettings: '"zero" 1',
            letterSpacing: '-1px',
          }}
        >
          {displayCode}
        </text>

        {/* 2. DESCRIÇÃO: Tamanho 28pt no Excel (DESC: normal + Valor em Negrito) */}
        <text
          x="18"
          y="186"
          textAnchor="start"
          fill="#000000"
          fontFamily="Consolas, 'Cascadia Mono', 'Source Code Pro', 'Courier New', monospace"
          fontSize={metaFontSize}
          style={{
            fontVariantNumeric: 'slashed-zero',
            fontFeatureSettings: '"zero" 1',
          }}
        >
          <tspan fontWeight="400">DESC: </tspan>
          <tspan fontWeight="700">{displayDesc}</tspan>
        </text>

        {/* 3. VALIDADE: Tamanho 28pt no Excel (alinhado pelos dois-pontos com DESC:) */}
        <text
          x="18"
          y="231"
          textAnchor="start"
          fill="#000000"
          fontFamily="Consolas, 'Cascadia Mono', 'Source Code Pro', 'Courier New', monospace"
          fontSize={metaFontSize}
           xmlSpace="preserve"
          style={{
            fontVariantNumeric: 'slashed-zero',
            fontFeatureSettings: '"zero" 1',
          }}
        >
          <tspan fontWeight="400">{'\u00A0'}VAL: </tspan>
          <tspan fontWeight="700">{displayVal}</tspan>
        </text>

        {/* 4. QUANTIDADE: Tamanho 28pt no Excel (posicionado na coluna direita como na planilha) */}
        <text
          x="678"
          y="231"
          textAnchor="start"
          fill="#000000"
          fontFamily="Consolas, 'Cascadia Mono', 'Source Code Pro', 'Courier New', monospace"
          fontSize={metaFontSize}
          style={{
            fontVariantNumeric: 'slashed-zero',
            fontFeatureSettings: '"zero" 1',
          }}
        >
          <tspan fontWeight="400">QTD: </tspan>
          <tspan fontWeight="700">{displayQtd}</tspan>
        </text>
      </svg>
    </div>
  );
};
