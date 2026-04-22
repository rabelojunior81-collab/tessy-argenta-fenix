import {
  Check,
  Image,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Sliders,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { ACCENT_PRESETS, useVisual, WALLPAPERS } from '../../contexts/VisualContext';

const VisualSettingsModal: React.FC = () => {
  const {
    settings,
    updateSetting,
    resetSettings,
    isVisualModalOpen,
    setIsVisualModalOpen,
    resolvedTheme,
    customWallpapers,
    addCustomWallpaper,
    removeCustomWallpaper,
  } = useVisual();
  const [activeTab, setActiveTab] = useState<'appearance' | 'glass'>('appearance');
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isVisualModalOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisualModalOpen(false);
    }, 150);
  };

  const tabs = [
    { id: 'appearance', icon: Palette, label: 'Aparência' },
    { id: 'glass', icon: Sliders, label: 'Vidro' },
  ] as const;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: modal backdrop
    <div
      role="presentation"
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
      onKeyDown={(e) => e.key === 'Escape' && handleClose()}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions lint/a11y/useKeyWithClickEvents: stop propagation */}
      <div
        role="presentation"
        className={`w-full max-w-lg glass-modal flex flex-col max-h-[80vh] ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Palette size={12} className="text-glass-accent" />
            <h2 className="text-[10px] font-bold tracking-widest text-glass uppercase">
              Aparência
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-0.5 text-glass-muted hover:text-glass transition-all"
          >
            <X size={12} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-glass shrink-0">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest transition-all relative flex items-center justify-center gap-1.5 uppercase ${
                activeTab === tab.id
                  ? 'text-glass-accent bg-white/5'
                  : 'text-glass-muted hover:text-glass'
              }`}
            >
              <tab.icon size={12} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-glass-accent" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 relative">
          {activeTab === 'appearance' && (
            <>
              {/* Theme Mode */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Tema
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dark', icon: Moon, label: 'Escuro' },
                    { value: 'light', icon: Sun, label: 'Claro' },
                    { value: 'system', icon: Monitor, label: 'Sistema' },
                  ].map((mode) => (
                    <button
                      type="button"
                      key={mode.value}
                      onClick={() => updateSetting('themeMode', mode.value as any)}
                      className={`py-3 flex flex-col items-center gap-2 transition-all border group active:scale-95 ${
                        settings.themeMode === mode.value
                          ? 'border-glass-accent bg-glass-accent/10 text-glass-accent'
                          : 'border-glass/10 bg-white/5 text-glass-muted hover:bg-white/10 hover:text-glass'
                      }`}
                    >
                      <mode.icon
                        size={18}
                        className={
                          settings.themeMode === mode.value ? 'text-glass-accent' : 'opacity-40'
                        }
                      />
                      <span className="text-[10px] uppercase tracking-wider font-medium">
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Accent Colors */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Cor de Acento
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => updateSetting('accentColor', color.value)}
                      className="w-8 h-8 transition-all flex items-center justify-center relative group"
                      style={{
                        backgroundColor: color.value,
                        transform: settings.accentColor === color.value ? 'scale(1.1)' : 'scale(1)',
                        boxShadow:
                          settings.accentColor === color.value
                            ? `0 0 15px ${color.value}40`
                            : 'none',
                        border: settings.accentColor === color.value ? '2px solid white' : 'none',
                      }}
                      title={color.name}
                    >
                      {settings.accentColor === color.value && (
                        <Check size={14} className="text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Wallpaper Gallery */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image size={14} className="text-gray-500" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      Papel de Parede
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-glass-muted hover:text-glass-accent border border-glass/10 hover:border-glass-accent/30 transition-all"
                    title="Carregar imagem local"
                  >
                    <Upload size={10} />
                    Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addCustomWallpaper(file);
                      e.target.value = '';
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {WALLPAPERS.map((wp) => (
                    <button
                      type="button"
                      key={wp.id}
                      onClick={() => updateSetting('wallpaper', wp.url)}
                      className={`aspect-video overflow-hidden transition-all relative group bg-white/5 border ${
                        settings.wallpaper === wp.url
                          ? 'border-glass-accent ring-1 ring-glass-accent/20'
                          : 'border-glass/10 hover:border-glass/30'
                      }`}
                    >
                      {wp.url ? (
                        <img
                          src={wp.url}
                          alt={wp.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                      )}
                      {settings.wallpaper === wp.url && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Check size={16} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom uploaded wallpapers */}
                {customWallpapers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[8px] font-bold uppercase tracking-widest text-glass-muted opacity-50">
                      Carregadas
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {customWallpapers.map((wp) => (
                        <div
                          key={wp.id}
                          className={`aspect-video overflow-hidden relative group bg-white/5 border ${
                            settings.wallpaper === `custom:${wp.id}`
                              ? 'border-glass-accent ring-1 ring-glass-accent/20'
                              : 'border-glass/10'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => updateSetting('wallpaper', `custom:${wp.id}`)}
                            className="absolute inset-0 w-full h-full"
                          >
                            <img
                              src={wp.dataUrl}
                              alt={wp.name}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            {settings.wallpaper === `custom:${wp.id}` && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Check size={16} className="text-white drop-shadow-md" />
                              </div>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCustomWallpaper(wp.id);
                            }}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Remover imagem"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {activeTab === 'glass' && (
            <>
              {/* Glass Opacity */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Opacidade
                  </h3>
                  <span className="text-xs font-mono text-glass-accent">
                    {Math.round(settings.glassOpacity * 100)}%
                  </span>
                </div>
                <div className="relative h-6 flex items-center">
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={settings.glassOpacity}
                    onChange={(e) => updateSetting('glassOpacity', parseFloat(e.target.value))}
                    className="w-full h-1 appearance-none cursor-pointer bg-white/10"
                    style={{
                      background: `linear-gradient(to right, var(--glass-accent) ${((settings.glassOpacity - 0.3) / 0.65) * 100}%, rgba(255,255,255,0.05) ${((settings.glassOpacity - 0.3) / 0.65) * 100}%)`,
                    }}
                  />
                </div>
              </section>

              {/* Blur Strength */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Blur
                  </h3>
                  <span className="text-xs font-mono text-glass-accent">
                    {settings.blurStrength}px
                  </span>
                </div>
                <div className="relative h-6 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="2"
                    value={settings.blurStrength}
                    onChange={(e) => updateSetting('blurStrength', parseInt(e.target.value, 10))}
                    className="w-full h-1 appearance-none cursor-pointer bg-white/10"
                    style={{
                      background: `linear-gradient(to right, var(--glass-accent) ${(settings.blurStrength / 32) * 100}%, rgba(255,255,255,0.05) ${(settings.blurStrength / 32) * 100}%)`,
                    }}
                  />
                </div>
              </section>

              {/* Animations Toggle */}
              <section className="space-y-4">
                <div className="flex items-center justify-between glass-card border-glass/10 p-4">
                  <div>
                    <h3 className="text-xs font-medium text-glass-secondary">Animações</h3>
                    <p className="text-[10px] text-glass-muted mt-0.5">Transições e movimento</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('enableAnimations', !settings.enableAnimations)}
                    className={`w-10 h-5 transition-all flex items-center px-0.5 active:scale-95 ${
                      settings.enableAnimations
                        ? 'bg-glass-accent justify-end shadow-[0_0_10px_rgba(var(--accent-rgb),0.3)]'
                        : 'bg-white/10 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white" />
                  </button>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-glass/10 flex items-center justify-between shrink-0 bg-transparent">
          <button
            type="button"
            onClick={() => {
              if (confirm('Restaurar configurações padrão?')) {
                resetSettings();
              }
            }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-glass-muted hover:text-glass transition-all active:scale-95"
          >
            <RotateCcw size={12} />
            Restaurar
          </button>
          <button
            type="button"
            onClick={handleClose}
            style={{ boxShadow: '0 4px 16px rgba(var(--accent-rgb), 0.3)' }}
            className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-glass-accent text-white hover:brightness-110 transition-all active:scale-95 border-transparent"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualSettingsModal;
