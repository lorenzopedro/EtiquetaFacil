import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-[#00325f] hover:bg-[#02437e] border border-[#38bdf8]/40 px-3.5 py-2 text-xs font-semibold text-[#e6f0ff] shadow-md transition-all active:scale-95"
        title="Instalar no celular Android ou computador"
      >
        <Smartphone className="w-4 h-4 text-[#38bdf8]" />
        <span>Instalar App Android</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl bg-[#00325f] hover:bg-[#02437e] border border-[#38bdf8]/40 px-3 py-1.5 text-xs font-semibold text-[#e6f0ff] shadow-md transition-all"
        >
          <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Instalar no Celular</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-[#011e38] border border-[#00325f] p-5 shadow-2xl text-[#e6f0ff]">
              <div className="flex items-center justify-between pb-3 border-b border-[#00325f]">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#38bdf8]" />
                  Instalar no Aparelho
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-[#e6f0ff]/70 hover:text-white hover:bg-[#00325f]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#e6f0ff]/90">
                1. Toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta para cima).<br />
                2. Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.<br />
                3. O app funcionará em tela cheia com acesso direto e suporte offline!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-[#00325f] hover:bg-[#02437e] py-2.5 text-xs font-semibold text-white transition border border-[#38bdf8]/30"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
