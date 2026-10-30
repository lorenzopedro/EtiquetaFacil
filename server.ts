import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Parse JSON payloads up to 50MB for high-resolution images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Label extraction endpoint
app.post('/api/extract-label', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida' });
    }

    // Clean base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9-+.]+;base64,/, '');

    const systemInstruction = `Você é um especialista em logística, conferência de estoque e OCR de alta precisão para embalagens e caixas industriais (Grupo Boticário, O Boticário, Eudora, Siàge, Lily, Floratta, etc.).
Sua função é analisar fotos de etiquetas de caixas e embalagens (tanto etiquetas impressas de fábrica quanto etiquetas manuscritas) e extrair os dados com máxima fidelidade.

ESTRUTURA DAS ETIQUETAS DE FÁBRICA:
1. codigo: É o NÚMERO EM MAIOR DESTAQUE / MAIOR TAMANHO DE FONTE (geralmente 4 a 6 dígitos, como "53501", "53504", "87896", "86809", "94489", "90808").
   - Fica posicionado logo abaixo dos códigos de barras EAN / DUN.
   - NÃO confunda com o número do código de barras EAN nem DUN. O código do produto é o número grande impresso logo acima da descrição.
2. descricao: A descrição do produto fica LOGO ABAIXO do código do produto.
   - Exemplo: "SIAGE COND ACELERA CRESC V3 200ml", "SIAGE SHAMP LIS INT V3 250ml", "FLORATTA EDP RED PASSION V2 75ml", "LILY CR ACET DES HID CPO LOR ELIXIR 200g".
   - Ignore pequenos marcadores de lote, colchetes ou códigos de área na frente (ex: se tiver "[5 " ou "C9 " ou "H4 ", extraia o nome do produto: "SIAGE COND ACELERA CRESC V3 200ml").
3. quantidade: Quantidade de unidades (QTD).
   - Fica situada logo abaixo ou ao lado da palavra "QUANTIDADE" ou "QTD". Exemplo: "48", "30", "24", "120", "7". Extraia somente os dígitos numéricos da quantidade.
4. validade: Data de validade (VAL).
   - Fica situada logo abaixo ou ao lado da palavra "VALIDADE" ou "VAL". Exemplo: "30-09-2029", "31.07.2029", "31-08-2029", "23.07.2030", "30/06/2029". Extraia a data exata encontrada.

REGRAS CRÍTICAS DE PRECISÃO:
- Apenas retorne string vazia ("") para um campo SE E SOMENTE SE o campo estiver borrado, rasgado, rascunhado ou completamente apagado/ilegível na etiqueta. Se o texto estiver impresso e visível na imagem, extraia-o integralmente.
- Se a foto contiver mais de uma etiqueta, retorne cada uma como um item separado na lista.
- Nunca invente dados que não existam na imagem.`;

    const promptText = `Analise com atenção a imagem da etiqueta de fábrica da caixa em anexo.
Identifique:
- Código do produto (número maior em destaque, como 53501, 87896, 86809, 53504, 94489)
- Descrição do produto (texto logo abaixo do código)
- Quantidade (número abaixo da palavra QUANTIDADE)
- Validade (data abaixo da palavra VALIDADE)

Retorne string vazia ("") somente se algum campo estiver fisicamente borrado ou apagado.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        etiquetas: {
          type: Type.ARRAY,
          description: 'Lista de etiquetas detectadas na imagem',
          items: {
            type: Type.OBJECT,
            properties: {
              codigo: {
                type: Type.STRING,
                description: 'Código numérico ou alfanumérico do produto (ex: 53501). String vazia se não encontrado.',
              },
              descricao: {
                type: Type.STRING,
                description: 'Descrição do produto. String vazia se não encontrada.',
              },
              quantidade: {
                type: Type.STRING,
                description: 'Quantidade de unidades. String vazia se não encontrada.',
              },
              validade: {
                type: Type.STRING,
                description: 'Data de validade. String vazia se não encontrada.',
              },
              tipoOrigem: {
                type: Type.STRING,
                description: 'Tipo detectado: "fabrica" ou "manuscrita"',
              },
              observacoes: {
                type: Type.STRING,
                description: 'Observação relevante sobre a leitura',
              },
            },
            required: ['codigo', 'descricao', 'quantidade', 'validade'],
          },
        },
      },
      required: ['etiquetas'],
    };

    // Helper with model fallback for 503 high demand spikes
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let responseText = '{}';
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType || 'image/jpeg',
                },
              },
              {
                text: promptText,
              },
            ],
          },
          config: {
            systemInstruction,
            temperature: 0.1, // Low temperature for factual OCR accuracy
            responseMimeType: 'application/json',
            responseSchema,
          },
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying fallback:`, err.message);
        lastError = err;
      }
    }

    let parsedData: { etiquetas?: any[] } = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Error parsing JSON from Gemini response:', parseErr, responseText);
      return res.status(500).json({ error: 'Falha ao interpretar resposta da IA', details: lastError?.message });
    }

    const etiquetas = (parsedData.etiquetas || []).map((item, index) => {
      const codigo = (item.codigo || '').trim();
      let descricao = (item.descricao || '').trim();
      // Remove leading bracket/area code artifacts like '[5 ', 'C9 ', 'H4 ', or 'DESC:'
      descricao = descricao.replace(/^(DESC\s*:\s*|\[\d+\s*|[A-Z]\d+\s+)/i, '').trim();

      const quantidade = (item.quantidade || '').toString().trim().replace(/^(QTD\s*:\s*|QUANT\s*:\s*)/i, '');

      let validade = (item.validade || '').trim().replace(/^(VAL\s*:\s*)/i, '');
      // Normalize DD-MM-YYYY, DD/MM/YYYY, or DD.MM.YYYY into MM/YYYY format
      const dmyMatch = validade.match(/^(\d{1,2})[-/. ](\d{2})[-/. ](\d{4})$/);
      if (dmyMatch) {
        validade = `${dmyMatch[2]}/${dmyMatch[3]}`;
      }

      const missing: string[] = [];
      if (!codigo) missing.push('codigo');
      if (!descricao) missing.push('descricao');
      if (!quantidade) missing.push('quantidade');
      if (!validade) missing.push('validade');

      return {
        id: `label-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
        codigo,
        descricao,
        quantidade,
        validade,
        tipoOrigem: item.tipoOrigem || 'fabrica',
        observacoes: item.observacoes || '',
        missingFields: missing,
        needsManualReview: missing.length > 0,
      };
    });

    return res.json({
      success: true,
      totalDetected: etiquetas.length,
      etiquetas,
    });
  } catch (error: any) {
    console.error('API /extract-label error:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao processar imagem da etiqueta',
    });
  }
});

// Setup Vite in development or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`EtiquetaFacil server running on http://0.0.0.0:${port}`);
  });
}

startServer();
