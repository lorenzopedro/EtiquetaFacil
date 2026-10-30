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
    <nav
      id="bottom-navbar"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#00172e]/95 border-t border-[#00325f] backdrop-blur-md px-4 sm:px-8 py-2 shadow-2xl transition-all select-none"
      style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
      aria-label="Navegação inferior"
    >
      <div className="max-w-md mx-auto flex items-center justify-between gap-4 relative">
        {/* Left: Início */}
        <button
          onClick={() => onTabChange('inicio')}
          className="relative flex items-center justify-center py-2 px-5 rounded-full transition-colors active:scale-95 focus:outline-hidden min-w-[90px]"
          title="Início"
          aria-label="Página Início"
          aria-current={activeTab === 'inicio' ? 'page' : undefined}
        >
          {activeTab === 'inicio' && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.22)] border border-white"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          )}

          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'inicio' ? 'text-[#011e38] font-bold' : 'text-[#e6f0ff]/75 hover:text-white'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              {labelsCount > 0 && activeTab !== 'inicio' && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#0284c7] text-white text-[9px] font-mono font-bold rounded-full border border-[#011e38]">
                  {labelsCount}
                </span>
              )}
            </div>
            <span className="text-[11px] sm:text-xs font-semibold tracking-tight mt-0.5">
              Início
            </span>
          </div>
        </button>

        {/* Center: Anexar (Redondo, somente ícone +, maior que os outros dois) */}
        <button
          onClick={() => onTabChange('anexar')}
          className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all active:scale-90 focus:outline-hidden shrink-0 -mt-4 shadow-xl"
          title="Tirar foto ou anexar"
          aria-label="Anexar etiqueta"
          aria-current={activeTab === 'anexar' ? 'page' : undefined}
        >
          {/* Active white round background with layoutId slide */}
          {activeTab === 'anexar' ? (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-[0_6px_24px_rgba(255,255,255,0.35)] border-2 border-white ring-4 ring-[#00172e]"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#00325f] hover:bg-[#02437e] rounded-full border-2 border-[#38bdf8]/50 shadow-lg ring-4 ring-[#00172e] transition-colors" />
          )}

          <div
            className={`relative z-10 flex items-center justify-center transition-colors duration-200 ${
              activeTab === 'anexar' ? 'text-[#011e38]' : 'text-[#38bdf8]'
            }`}
          >
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3]" />
          </div>
        </button>

        {/* Right: Download */}
        <button
          onClick={() => onTabChange('download')}
          className="relative flex items-center justify-center py-2 px-5 rounded-full transition-colors active:scale-95 focus:outline-hidden min-w-[90px]"
          title="Download PDF"
          aria-label="Página de Download"
          aria-current={activeTab === 'download' ? 'page' : undefined}
        >
          {activeTab === 'download' && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.22)] border border-white"
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 32,
              }}
            />
          )}

          <div
            className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-200 ${
              activeTab === 'download' ? 'text-[#011e38] font-bold' : 'text-[#e6f0ff]/75 hover:text-white'
            }`}
          >
            <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-[11px] sm:text-xs font-semibold tracking-tight mt-0.5">
              Download
            </span>
          </div>
        </button>
      </div>

      {/* Android bottom gesture pill bar indicator */}
      <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-1 sm:hidden pointer-events-none" />
    </nav>
  );
};
