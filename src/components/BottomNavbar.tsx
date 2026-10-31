import React from 'react';
import { Home, Plus, ArrowDownToLine } from 'lucide-react';
import { motion } from 'motion/react';

export type NavTabId = 'inicio' | 'anexar' | 'download';

interface BottomNavbarProps {
  activeTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  labelsCount: number;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  onTabChange,
  labelsCount,
}) => {
  return (
    <div
      className="fixed bottom-4 sm:bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <nav
        id="bottom-navbar"
        aria-label="Navegação inferior flutuante"
        className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-3 p-1.5 rounded-full bg-[#00172e]/95 border border-[#00325f] backdrop-blur-xl shadow-[0_14px_40px_rgba(0,0,0,0.65)] ring-1 ring-[#38bdf8]/20"
      >
        {/* Left: Início */}
        <button
          onClick={() => onTabChange('inicio')}
          className="relative flex items-center justify-center py-2.5 px-6 sm:px-7 rounded-full transition-colors active:scale-95 focus:outline-hidden min-w-[104px] sm:min-w-[118px]"
          title="Início"
          aria-label="Página Início"
          aria-current={activeTab === 'inicio' ? 'page' : undefined}
        >
          {activeTab === 'inicio' && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.25)]"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          )}

          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'inicio' ? 'text-[#011e38] font-bold' : 'text-[#e6f0ff]/80 hover:text-white'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5" />
              {labelsCount > 0 && activeTab !== 'inicio' && (
                <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 bg-[#0284c7] text-white text-[10px] font-bold rounded-full border border-[#011e38]">
                  {labelsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold tracking-tight mt-0.5">
              Início
            </span>
          </div>
        </button>

        {/* Center: Botão + Centralizado no meio da barra flutuante */}
        <button
          onClick={() => onTabChange('anexar')}
          className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full transition-all active:scale-92 focus:outline-hidden shrink-0"
          title="Tirar foto ou anexar"
          aria-label="Anexar etiqueta"
          aria-current={activeTab === 'anexar' ? 'page' : undefined}
        >
          {activeTab === 'anexar' ? (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.35)]"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#00325f] hover:bg-[#02437e] rounded-full border border-[#38bdf8]/40 shadow-md transition-colors" />
          )}

          <div
            className={`relative z-10 flex items-center justify-center transition-colors duration-200 ${
              activeTab === 'anexar' ? 'text-[#011e38]' : 'text-white'
            }`}
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.8]" />
          </div>
        </button>

        {/* Right: Download */}
        <button
          onClick={() => onTabChange('download')}
          className="relative flex items-center justify-center py-2.5 px-6 sm:px-7 rounded-full transition-colors active:scale-95 focus:outline-hidden min-w-[104px] sm:min-w-[118px]"
          title="Download PDF"
          aria-label="Página de Download"
          aria-current={activeTab === 'download' ? 'page' : undefined}
        >
          {activeTab === 'download' && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.25)]"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          )}

          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'download' ? 'text-[#011e38] font-bold' : 'text-[#e6f0ff]/80 hover:text-white'
            }`}
          >
            <ArrowDownToLine className="w-5 h-5" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-tight mt-0.5">
              Download
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
};
