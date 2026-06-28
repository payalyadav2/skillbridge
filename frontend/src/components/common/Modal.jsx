import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Keyboard: Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <>
      <style>{`
        @keyframes modal-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-panel-in {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes modal-glow-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
        .modal-backdrop {
          animation: modal-backdrop-in 0.2s ease forwards;
        }
        .modal-panel {
          animation: modal-panel-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .modal-close-btn:hover .modal-close-icon {
          transform: rotate(90deg);
        }
        .modal-close-icon {
          transition: transform 0.2s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop, .modal-panel { animation: none; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Backdrop */}
        <div
          ref={overlayRef}
          className="modal-backdrop absolute inset-0"
          style={{
            background: 'rgba(2, 0, 16, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          className={`modal-panel relative w-full ${sizes[size]}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderRadius: '20px',
            boxShadow: `
              0 0 0 1px rgba(34,211,238,0.08),
              0 24px 64px rgba(0,0,0,0.6),
              0 0 40px rgba(34,211,238,0.06),
              inset 0 1px 0 rgba(255,255,255,0.08)
            `,
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Ambient top glow line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)',
              borderRadius: '999px',
              animation: 'modal-glow-pulse 3s ease-in-out infinite',
            }}
          />

          {/* Header */}
          {title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <h2
                id="modal-title"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #ffffff 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h2>

              <button
                onClick={onClose}
                className="modal-close-btn"
                aria-label="Close modal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(34,211,238,0.12)'
                  e.currentTarget.style.borderColor = 'rgba(34,211,238,0.35)'
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(34,211,238,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <X className="modal-close-icon w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </div>
          )}

          {/* Content */}
          <div style={{ padding: title ? '24px' : '28px' }}>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default Modal