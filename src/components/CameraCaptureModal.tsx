import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  FlipHorizontal, 
  Smartphone,
  Sparkles
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoDataUrl: string) => void;
  titleBn?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  titleBn = 'ডিভাইস ক্যামেরা দিয়ে ছবি তুলুন',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  // Play subtle synthetic camera shutter click using Web Audio API
  const playShutterSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio not permitted or supported, non-blocking
    }
  };

  // Start live camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setIsLoadingCamera(true);
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('এই ব্রাউজারে সরাসরি ক্যামেরা অ্যাক্সেস সমর্থিত নয়। নিচে ডিভাইস ক্যামেরা বাটন ব্যবহার করুন।');
      }

      // Check available video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // Enumerate error, ignore
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsLoadingCamera(false);
    } catch (err: unknown) {
      setIsLoadingCamera(false);
      const errStr = err instanceof Error ? err.name : 'UnknownError';
      if (errStr === 'NotAllowedError' || errStr === 'PermissionDeniedError') {
        setErrorMessage('ক্যামেরা পারমিশন পাওয়া যায়নি। অনুগ্রহ করে ব্রাউজারে ক্যামেরা ব্যবহারের অনুমতি দিন অথবা ডিভাইসের ক্যামেরা অ্যাপ ব্যবহার করুন।');
      } else if (errStr === 'NotFoundError' || errStr === 'DevicesNotFoundError') {
        setErrorMessage('ডিভাইসে কোনো সক্রিয় ক্যামেরা পাওয়া যায়নি।');
      } else {
        setErrorMessage('ক্যামেরা চালু করতে সমস্যা হয়েছে। সরাসরি ডিভাইস ক্যামেরা অ্যাপ বাটন দিয়ে ছবি তুলুন।');
      }
    }
  };

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle front/rear camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Take snapshot from video stream
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual flash animation & sound
    setIsFlashing(true);
    playShutterSound();
    setTimeout(() => setIsFlashing(false), 180);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Mirror if front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // Native camera fallback handler
  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  // Confirm and attach photo
  const handleConfirmAttach = () => {
    if (!capturedImage) return;
    onCapture(capturedImage);
    handleClose();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Close modal
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setErrorMessage(null);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 text-white rounded-3xl max-w-xl w-full p-4 sm:p-5 space-y-4 shadow-2xl border border-slate-700 my-4 flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {titleBn}
              </h3>
              <p className="text-[11px] text-slate-400">
                ডায়রি বা হোমওয়ার্ক পোস্টে সরাসরি ছবি সংযুক্ত করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden native camera input for direct OS camera fallback */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeFileCapture}
          className="hidden"
        />

        {/* Camera Viewfinder / Preview Screen */}
        <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
          {/* Visual Shutter Flash */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 pointer-events-none opacity-90 animate-out fade-out duration-200"></div>
          )}

          {capturedImage ? (
            /* Snapshot Preview */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                <Check className="w-3.5 h-3.5" />
                <span>ছবি সফলভাবে ধারণ করা হয়েছে</span>
              </div>
            </div>
          ) : (
            /* Live Stream Video */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-2 text-xs text-slate-300">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <span>ক্যামেরা চালু হচ্ছে...</span>
                </div>
              )}

              {/* Viewfinder Target Reticle */}
              {!isLoadingCamera && !errorMessage && (
                <div className="absolute inset-4 pointer-events-none border-2 border-white/25 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-amber-400 absolute top-0 left-0"></div>
                  <div className="w-8 h-8 border-t-2 border-r-2 border-amber-400 absolute top-0 right-0"></div>
                  <div className="w-8 h-8 border-b-2 border-l-2 border-amber-400 absolute bottom-0 left-0"></div>
                  <div className="w-8 h-8 border-b-2 border-r-2 border-amber-400 absolute bottom-0 right-0"></div>
                  <span className="text-[10px] text-white/50 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                    {facingMode === 'environment' ? 'পেছনের ক্যামেরা' : 'সামনের ক্যামেরা'}
                  </span>
                </div>
              )}

              {/* Error State */}
              {errorMessage && (
                <div className="absolute inset-4 bg-slate-900/95 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 z-10">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>ডিভাইস ক্যামেরা অ্যাপ দিয়ে ছবি তুলুন</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {capturedImage ? (
            /* Controls after photo is taken */
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় ছবি তুলুন (Retake)</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAttach}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>এই ছবিটি ডায়েরিতে সংযুক্ত করুন</span>
              </button>
            </div>
          ) : (
            /* Live Controls during camera stream */
            <div className="flex items-center justify-between w-full gap-2">
              {/* Camera Switch (Front/Back) */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                disabled={isLoadingCamera}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="ক্যামেরা সুইচ করুন"
              >
                <FlipHorizontal className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">ক্যামেরা সুইচ</span>
              </button>

              {/* Main Shutter Button */}
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isLoadingCamera || !!errorMessage}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-black rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>ছবি তুলুন (Capture)</span>
              </button>

              {/* Native OS Camera App Button */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                title="ডিভাইস ক্যামেরা অ্যাপ দিয়ে ছবি তুলুন"
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">ডিভাইস ক্যামেরা</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
