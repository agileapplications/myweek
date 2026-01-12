import type { ReactNode } from "react"

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
}

const Modal = ({ open, onClose, children }: ModalProps) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
        {children}
      </div>
    </div>
  )
}

export default Modal
