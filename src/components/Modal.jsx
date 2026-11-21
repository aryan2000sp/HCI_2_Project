import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../Sass/Modal.scss'

// A pop-up window. It closes when you click outside it, click ×, or press Escape.
// createPortal draws it directly inside <body>, so it sits on top of everything
// and isn't affected by the styles of whatever page opened it.
function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    // Remove the listener again when the pop-up closes.
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return createPortal(
    <div className='modal-backdrop' onClick={onClose}>
      {/* stopPropagation: clicking inside the box shouldn't count as clicking outside */}
      <div className='modal-box' role='dialog' aria-modal='true' onClick={(e) => e.stopPropagation()}>
        <button className='modal-close' onClick={onClose} aria-label='Close'>×</button>
        <h2 className='modal-title'>{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default Modal
