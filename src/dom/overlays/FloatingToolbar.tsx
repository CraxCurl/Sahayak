import React, { useState } from 'react';
import { Eye, Type, BookOpen, RotateCcw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { SafeDOMExecutor } from '../engine/action-executor';
import { ReaderMode } from '../reader/reader-mode';

interface FloatingToolbarProps {
  executor: SafeDOMExecutor;
  readerMode: ReaderMode;
  onTriggerReanalysis?: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  executor,
  readerMode,
  onTriggerReanalysis,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isReaderActive, setIsReaderActive] = useState(false);
  const [fontScale, setFontScale] = useState(1.0);

  const accessibilityEngine = executor.getAccessibilityEngine();

  const toggleHighContrast = () => {
    const nextState = !isHighContrast;
    setIsHighContrast(nextState);
    accessibilityEngine.setHighContrast(nextState);
  };

  const adjustFontScale = (delta: number) => {
    const nextScale = Math.min(Math.max(Number((fontScale + delta).toFixed(2)), 0.8), 2.0);
    setFontScale(nextScale);
    accessibilityEngine.setFontScale(nextScale);
  };

  const toggleReader = () => {
    const active = readerMode.toggle();
    setIsReaderActive(active);
  };

  const handleReset = () => {
    executor.revertAll();
    readerMode.disable();
    setIsHighContrast(false);
    setIsReaderActive(false);
    setFontScale(1.0);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2147483647, // Maximum z-index
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#f8fafc',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          padding: isExpanded ? '12px 16px' : '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          transition: 'all 0.3s ease',
          minWidth: isExpanded ? '240px' : 'auto',
        }}
      >
        {/* Toolbar Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                padding: '4px 6px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <span style={{ fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>Sahayak UI</span>
          </div>

          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Toolbar Action Body */}
        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
            {/* Quick Toggle Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={toggleHighContrast}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: isHighContrast ? '1px solid #38bdf8' : '1px solid #334155',
                  backgroundColor: isHighContrast ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  color: isHighContrast ? '#38bdf8' : '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <Eye size={14} /> Contrast
              </button>

              <button
                onClick={toggleReader}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: isReaderActive ? '1px solid #38bdf8' : '1px solid #334155',
                  backgroundColor: isReaderActive ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  color: isReaderActive ? '#38bdf8' : '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <BookOpen size={14} /> Reader
              </button>
            </div>

            {/* Font Scaling Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#1e293b',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
                <Type size={14} /> Text Size ({Math.round(fontScale * 100)}%)
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => adjustFontScale(-0.1)}
                  style={{
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '4px',
                    width: '22px',
                    height: '22px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  -
                </button>
                <button
                  onClick={() => adjustFontScale(0.1)}
                  style={{
                    backgroundColor: '#334155',
                    color: '#f8fafc',
                    border: 'none',
                    borderRadius: '4px',
                    width: '22px',
                    height: '22px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Bottom Actions: Re-adapt & Reset */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {onTriggerReanalysis && (
                <button
                  onClick={onTriggerReanalysis}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '6px',
                    borderRadius: '8px',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Sparkles size={12} /> AI Re-Adapt
                </button>
              )}

              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#334155',
                  color: '#f8fafc',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                title="Reset all adaptations"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
