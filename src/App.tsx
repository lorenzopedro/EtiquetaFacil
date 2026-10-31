/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  AlertCircle,
  Layers,
  Search,
  RefreshCw,
  Check,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LabelItem, PrintSettings } from './types/label';
import { LabelCard } from './components/LabelCard';
import { MissingDataModal } from './components/MissingDataModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ManualLabelModal } from './components/ManualLabelModal';
import { BottomNavbar, NavTabId } from './components/BottomNavbar';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AttachPageView } from './views/AttachPageView';
import { PdfPageView } from './views/PdfPageView';
import { firebaseService } from './services/firebase';

export default function App() {
  // Navigation tab state: 'inicio' | 'anexar' | 'download'
  const [activeTab, setActiveTab] = useState<NavTabId>('inicio');

  // Labels synchronized with Firebase Firestore
  const [labels, setLabels] = useState<LabelItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState<string>('');
  const [currentImagePreview, setCurrentImagePreview] = useState<string>('');

  // Modals state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelItem | null>(null);
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);
  const [labelForMissingData, setLabelForMissingData] = useState<LabelItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queue of labels that need manual review for missing data
  const [pendingMissingQueue, setPendingMissingQueue] = useState<LabelItem[]>([]);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'complete'>('all');

  // PDF settings matching Excel reference (no black border, gray background, 120pt/28pt Consolas)
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    layoutMode: '3-per-page',
    showBorder: false,
    grayBackground: true,
    fontSizeScale: 1.0,
    marginTop: 6,
    marginX: 7.5,
    gapY: 5.5,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Subscribe to real-time Firestore database updates
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeLabels(
      (firestoreLabels) => {
        setLabels(firestoreLabels || []);
      },
      (error) => {
        console.warn('Firestore subscription fallback:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper to normalize & compress large smartphone photos to clean JPEG max 1600px
  const normalizeImageToJpeg = (rawDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  };

  // Process image for label extraction via Server API and save to Firestore
  const processImageForLabels = async (rawImageBase64: string, filename = 'foto_etiqueta.jpg') => {
    setIsAnalyzing(true);
    setCurrentImagePreview(rawImageBase64);
    setAnalyzingStatus('Otimizando imagem e analisando etiqueta com IA...');

    try {
      const imageBase64 = await normalizeImageToJpeg(rawImageBase64);

      const response = await fetch('/api/extract-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      const detectedLabels: LabelItem[] = (data.etiquetas || []).map((item: any) => ({
        ...item,
        imagePreviewUrl: imageBase64,
        createdAt: Date.now(),
        copias: 1,
      }));

      if (detectedLabels.length === 0) {
        const fallbackLabel: LabelItem = {
          id: `label-${Date.now()}`,
          codigo: '',
          descricao: '',
          quantidade: '',
          validade: '',
          tipoOrigem: 'manuscrita',
          missingFields: ['codigo', 'descricao', 'quantidade', 'validade'],
          needsManualReview: true,
          createdAt: Date.now(),
          imagePreviewUrl: imageBase64,
          copias: 1,
        };
        detectedLabels.push(fallbackLabel);
      }

      // Persist detected labels into Firestore
      for (const lbl of detectedLabels) {
        await firebaseService.addOrUpdateLabel(lbl);
      }
      showToast(
        `${detectedLabels.length} etiqueta(s) lida(s) (${data.usedModel || 'IA'}) e salva(s)!`
      );

      // Check for missing data
      const missingList = detectedLabels.filter(
        (l) => l.missingFields && l.missingFields.length > 0
      );
      if (missingList.length > 0) {
        setPendingMissingQueue(missingList.slice(1));
        setLabelForMissingData(missingList[0]);
        setIsMissingModalOpen(true);
      } else {
        setActiveTab('inicio');
      }
    } catch (err: any) {
      console.error('Failed to extract labels:', err);
      showToast(err?.message || 'Limite da IA atingido. Preencha manualmente.');
      const fallbackLabel: LabelItem = {
        id: `label-offline-${Date.now()}`,
        codigo: '',
        descricao: '',
        quantidade: '',
        validade: '',
        tipoOrigem: 'manuscrita',
        observacoes: 'Inserção assistida (foto anexada)',
        missingFields: ['codigo', 'descricao', 'quantidade', 'validade'],
        needsManualReview: true,
        createdAt: Date.now(),
        imagePreviewUrl: rawImageBase64,
        copias: 1,
      };

      await firebaseService.addOrUpdateLabel(fallbackLabel);
      setLabelForMissingData(fallbackLabel);
      setIsMissingModalOpen(true);
    } finally {
      setIsAnalyzing(false);
      setAnalyzingStatus('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          processImageForLabels(base64, file.name);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleSaveMissingData = async (updatedLabel: LabelItem) => {
    await firebaseService.addOrUpdateLabel(updatedLabel);
    setIsMissingModalOpen(false);
    setLabelForMissingData(null);
    showToast('Etiqueta atualizada no banco!');

    if (pendingMissingQueue.length > 0) {
      const [next, ...rest] = pendingMissingQueue;
      setPendingMissingQueue(rest);
      setLabelForMissingData(next);
      setIsMissingModalOpen(true);
    } else {
      setActiveTab('inicio');
    }
  };

  const handleDiscardMissingLabel = async (id: string) => {
    await firebaseService.deleteLabel(id);
    setLabels((prev) => prev.filter((item) => item.id !== id));
    setPendingMissingQueue((prev) => prev.filter((item) => item.id !== id));
    setIsMissingModalOpen(false);
    setLabelForMissingData(null);
    showToast('Etiqueta descartada e esquecida');

    if (pendingMissingQueue.length > 0) {
      const [next, ...rest] = pendingMissingQueue;
      setPendingMissingQueue(rest);
      setLabelForMissingData(next);
      setIsMissingModalOpen(true);
    }
  };

  const handleDiscardAllPending = async () => {
    const pendingLabels = labels.filter((l) => l.missingFields && l.missingFields.length > 0);
    if (pendingLabels.length === 0) return;

    for (const l of pendingLabels) {
      await firebaseService.deleteLabel(l.id);
    }
    setLabels((prev) => prev.filter((l) => !l.missingFields || l.missingFields.length === 0));
    setPendingMissingQueue([]);
    setIsMissingModalOpen(false);
    setLabelForMissingData(null);
    showToast(`${pendingLabels.length} etiqueta(s) pendente(s) descartada(s)`);
  };

  const handleDeleteLabel = async (id: string) => {
    await firebaseService.deleteLabel(id);
    showToast('Etiqueta removida');
  };

  const handleDuplicateLabel = async (item: LabelItem) => {
    const duplicate: LabelItem = {
      ...item,
      id: `label-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    await firebaseService.addOrUpdateLabel(duplicate);
    showToast('Etiqueta duplicada');
  };

  const handleUpdateCopies = async (id: string, copies: number) => {
    const target = labels.find((l) => l.id === id);
    if (!target) return;
    await firebaseService.addOrUpdateLabel({ ...target, copias: copies });
  };

  const handleSaveManualLabel = async (label: LabelItem) => {
    await firebaseService.addOrUpdateLabel(label);
    if (editingLabel) {
      setEditingLabel(null);
      showToast('Etiqueta atualizada no Firestore!');
    } else {
      showToast('Nova etiqueta salva no Firestore!');
      setActiveTab('inicio');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Deseja realmente apagar todas as etiquetas do banco de dados?')) {
      for (const l of labels) {
        await firebaseService.deleteLabel(l.id);
      }
      showToast('Todas as etiquetas foram apagadas');
    }
  };

  const filteredLabels = labels.filter((label) => {
    const matchesSearch =
      (label.codigo && label.codigo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (label.descricao && label.descricao.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'pending') {
      return label.missingFields && label.missingFields.length > 0;
    }
    if (filterType === 'complete') {
      return !label.missingFields || label.missingFields.length === 0;
    }
    return true;
  });

  const pendingCount = labels.filter((l) => l.missingFields && l.missingFields.length > 0).length;

  return (
    <div className="min-h-screen bg-[#011e38] text-[#e6f0ff] flex flex-col font-sans select-none pb-28">
      {/* Offline Status */}
      <OfflineIndicator />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#00325f] text-white px-4 py-2 rounded-2xl border border-[#38bdf8]/40 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Requested Top Header: Android article_24 drawable on the left, + icon on the right */}
      <header
        id="app-header"
        className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-[#00325f]/95 border-b border-[#00325f] backdrop-blur-md shadow-lg"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: App Logo with Android @drawable/article_24 vector */}
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-xl bg-[#011e38] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shadow-inner"
              title="article_24"
            >
              {/* Android @drawable/article_24 vector icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
          </div>

          {/* Right: + Button to attach or take photo & PWA Install */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              onClick={() => setActiveTab('anexar')}
              className={`w-11 h-11 rounded-full border shadow-lg flex items-center justify-center transition-all active:scale-90 ${
                activeTab === 'anexar'
                  ? 'bg-white text-[#011e38] border-white ring-4 ring-white/20'
                  : 'bg-[#002242] hover:bg-[#02437e] text-white border-[#38bdf8]/50 shadow-black/30'
              }`}
              title="Tirar foto ou anexar etiqueta"
              aria-label="Tirar foto ou anexar"
            >
              <Plus
                className={`w-5 h-5 stroke-[2.8] ${
                  activeTab === 'anexar' ? 'text-[#011e38]' : 'text-[#38bdf8]'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Page Slide Transitions */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 flex-1 flex flex-col gap-5">
        {/* Loading / AI Processing State */}
        {isAnalyzing && (
          <div className="rounded-2xl bg-[#00325f]/70 border border-[#38bdf8]/50 p-4 shadow-xl flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Processando imagem da etiqueta...</h4>
              <p className="text-xs text-[#e6f0ff]/80 mt-0.5">{analyzingStatus}</p>
            </div>
          </div>
        )}

        {/* Missing Fields Notice Alert with Cancel/Forget Button */}
        {pendingCount > 0 && activeTab === 'inicio' && (
          <div className="rounded-2xl bg-amber-950/40 border border-amber-500/50 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  {pendingCount} {pendingCount === 1 ? 'etiqueta possui' : 'etiquetas possuem'} dados faltantes na foto
                </h4>
                <p className="text-xs text-amber-300/80">
                  Preencha os dados ou simplesmente cancele e esqueça para remover o aviso.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              <button
                onClick={handleDiscardAllPending}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/70 text-red-200 border border-red-500/40 font-semibold text-xs transition active:scale-95"
                title="Cancelar e esquecer todas as etiquetas com dados faltantes"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Cancelar e Esquecer</span>
              </button>
              <button
                onClick={() => {
                  const firstPending = labels.find((l) => l.missingFields && l.missingFields.length > 0);
                  if (firstPending) {
                    setLabelForMissingData(firstPending);
                    setIsMissingModalOpen(true);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition active:scale-95 shrink-0"
              >
                Completar Dados
              </button>
            </div>
          </div>
        )}

        {/* Animated Page Views */}
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-col gap-4 w-full"
            >
              {/* Toolbar & Filter Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#00325f]/40 p-3 rounded-2xl border border-[#00325f]">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-[#e6f0ff]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por código ou descrição..."
                      className="w-full rounded-xl bg-[#011e38] border border-[#00325f] pl-9 pr-3 py-2 text-xs text-white placeholder-[#e6f0ff]/40 focus:outline-hidden focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end text-xs">
                  {/* Filter Tabs */}
                  <div className="flex bg-[#011e38] rounded-xl p-1 border border-[#00325f]">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 rounded-lg transition ${
                        filterType === 'all'
                          ? 'bg-[#00325f] text-white font-semibold'
                          : 'text-[#e6f0ff]/70 hover:text-white'
                      }`}
                    >
                      Todas ({labels.length})
                    </button>
                    <button
                      onClick={() => setFilterType('pending')}
                      className={`px-3 py-1 rounded-lg transition ${
                        filterType === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                          : 'text-[#e6f0ff]/70 hover:text-white'
                      }`}
                    >
                      Pendentes ({pendingCount})
                    </button>
                    <button
                      onClick={() => setFilterType('complete')}
                      className={`px-3 py-1 rounded-lg transition ${
                        filterType === 'complete'
                          ? 'bg-[#00325f] text-white font-semibold'
                          : 'text-[#e6f0ff]/70 hover:text-white'
                      }`}
                    >
                      Completas ({labels.length - pendingCount})
                    </button>
                  </div>

                  {labels.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="p-2 rounded-xl text-[#e6f0ff]/60 hover:text-red-400 hover:bg-[#011e38] transition"
                      title="Limpar todas as etiquetas do banco"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Labels List Grid */}
              {filteredLabels.length === 0 ? (
                <div className="rounded-3xl bg-[#00325f]/20 border-2 border-dashed border-[#00325f] p-12 text-center flex flex-col items-center justify-center my-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#00325f] flex items-center justify-center mb-3 text-[#38bdf8]">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Nenhuma etiqueta no banco</h3>
                  <p className="text-xs text-[#e6f0ff]/70 max-w-sm mt-1">
                    Toque no botão <strong>+</strong> para tirar foto ou carregar etiquetas de caixas salvas no Firestore.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => setActiveTab('anexar')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#e6f0ff] text-[#011e38] font-bold text-xs shadow-lg transition active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Anexar Etiqueta Agora</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLabels.map((label) => (
                    <LabelCard
                      key={label.id}
                      label={label}
                      onEdit={(item) => {
                        setEditingLabel(item);
                        setIsManualModalOpen(true);
                      }}
                      onDelete={handleDeleteLabel}
                      onDuplicate={handleDuplicateLabel}
                      onFixMissing={(item) => {
                        setLabelForMissingData(item);
                        setIsMissingModalOpen(true);
                      }}
                      onUpdateCopies={handleUpdateCopies}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'anexar' && (
            <motion.div
              key="anexar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              <AttachPageView
                onOpenCamera={() => setIsCameraOpen(true)}
                onSelectFile={handleFileChange}
                onOpenManual={() => {
                  setEditingLabel(null);
                  setIsManualModalOpen(true);
                }}
                isAnalyzing={isAnalyzing}
                analyzingStatus={analyzingStatus}
              />
            </motion.div>
          )}

          {activeTab === 'download' && (
            <motion.div
              key="download"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="w-full"
            >
              <PdfPageView
                labels={labels}
                settings={printSettings}
                onUpdateSettings={setPrintSettings}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </main>

      {/* Requested Bottom Navbar with 3 tabs and sliding white pill animation */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        labelsCount={labels.length}
      />

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(base64) => {
          setIsCameraOpen(false);
          processImageForLabels(base64, 'captura_camera.jpg');
        }}
        onSelectFromFile={() => {
          setIsCameraOpen(false);
          fileInputRef.current?.click();
        }}
      />

      {/* Missing Data Modal (Assisted Prompt for missing fields) */}
      <MissingDataModal
        isOpen={isMissingModalOpen}
        onClose={() => {
          setIsMissingModalOpen(false);
          setLabelForMissingData(null);
        }}
        label={labelForMissingData}
        onSave={handleSaveMissingData}
        onDiscard={handleDiscardMissingLabel}
        imagePreviewUrl={labelForMissingData?.imagePreviewUrl || currentImagePreview}
      />

      {/* Manual Label Creation & Editing Modal */}
      <ManualLabelModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setEditingLabel(null);
        }}
        onSave={handleSaveManualLabel}
        initialLabel={editingLabel}
      />
    </div>
  );
}
