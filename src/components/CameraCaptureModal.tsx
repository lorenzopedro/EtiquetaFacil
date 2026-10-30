import React, { useRef, useState, useEffect } from 'react';
import { Camera, SwitchCamera, X, Zap, RefreshCw, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageBase64: string) => void;
  onSelectFromFile: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onSelectFromFile,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setErrorMessage(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setHasPermission(false);
      setErrorMessage(
        'Não foi possível acessar a câmera do dispositivo. Verifique as permissões ou use o upload direto.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();
      onCapture(dataUrl);
    }
    setIsCapturing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 sm:p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl h-[88vh] sm:h-[80vh] rounded-3xl bg-[#011e38] border-2 border-[#00325f] flex flex-col overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#00325f]/90 border-b border-[#00325f] z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#38bdf8]" />
            <span className="font-bold text-sm text-white">Scanner de Etiquetas de Caixa</span>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#e6f0ff]/80 hover:text-white hover:bg-[#011e38] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {errorMessage ? (
            <div className="p-6 text-center text-white max-w-sm">
              <Camera className="w-12 h-12 mx-auto text-amber-400 mb-3" />
              <p className="text-sm font-medium mb-4 text-[#e6f0ff]">{errorMessage}</p>
              <div className="space-y-2">
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#00325f] hover:bg-[#02437e] text-xs font-semibold text-white transition border border-[#38bdf8]/40"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                    onSelectFromFile();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-xs font-bold text-white shadow-md transition"
                >
                  <Upload className="w-4 h-4" />
                  Abrir Galeria / Câmera do Sistema
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Overlay adapted for Vertical Factory Box Labels */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                <div className="relative w-[82%] max-w-[310px] aspect-3/4 rounded-2xl border-2 border-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.5)] flex flex-col items-center justify-between p-3.5 bg-black/15 backdrop-brightness-110">
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-md -mt-1 -ml-1" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-md -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-md -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-md -mb-1 -mr-1" />

                  {/* Horizontal internal guidelines for Code / Description / Dates */}
                  <div className="absolute inset-x-3 top-[38%] border-t border-dashed border-[#38bdf8]/60" />
                  <div className="absolute inset-x-3 top-[68%] border-t border-dashed border-[#38bdf8]/60" />

                  {/* Laser line scanning animation */}
                  <div className="absolute inset-x-2 top-1/2 h-0.5 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8] animate-pulse" />

                  <span className="text-[11px] font-mono font-bold bg-[#011e38]/90 text-[#38bdf8] px-3 py-1 rounded-full border border-[#38bdf8]/50 shadow-md">
                    Enquadre a etiqueta de fábrica na vertical
                  </span>

                  <div className="flex flex-col items-center gap-0.5 text-center">
                    <span className="text-[10px] text-white/90 font-mono bg-black/70 px-2.5 py-0.5 rounded border border-white/20">
                      Código • Descrição • Validade • Qtd
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Camera Controls Bar */}
        <div className="px-6 py-4 bg-[#00325f] border-t border-[#00325f] flex items-center justify-around z-10">
          <button
            onClick={() => {
              stopCamera();
              onClose();
              onSelectFromFile();
            }}
            className="flex flex-col items-center gap-1 text-[#e6f0ff]/80 hover:text-white transition"
            title="Escolher arquivo do celular"
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px]">Galeria</span>
          </button>

          {/* Big Shutter Button */}
          <button
            onClick={takePhoto}
            disabled={isCapturing || !hasPermission}
            className="w-16 h-16 rounded-full bg-white hover:bg-[#e6f0ff] p-1.5 shadow-xl transition-all active:scale-90 disabled:opacity-50 flex items-center justify-center border-4 border-[#011e38]"
            title="Tirar foto da etiqueta"
          >
            <div className="w-12 h-12 rounded-full bg-[#0284c7] hover:bg-[#0369a1] flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>

          <button
            onClick={switchCamera}
            className="flex flex-col items-center gap-1 text-[#e6f0ff]/80 hover:text-white transition"
            title="Alternar câmera frontal/traseira"
          >
            <SwitchCamera className="w-5 h-5" />
            <span className="text-[10px]">Trocar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
