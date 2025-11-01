import { useEffect, useRef } from "react";
import type { ModalProps } from "./modal.interface";
import ReactDOM from "react-dom";

function Modal({ isOpen, onClose, title, children }: ModalProps) {
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const previousActiveRef = useRef<Element | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		previousActiveRef.current = document.activeElement;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
			(previousActiveRef.current as HTMLElement | null)?.focus?.();
		};
	}, [isOpen]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div
			ref={overlayRef}
			aria-hidden={!isOpen}
			role="presentation"
			onMouseDown={(e) => {
				if (e.target === overlayRef.current) onClose();
			}}
			className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label="Modal dialog"
				className="rounded-lg shadow-lg max-w-md w-full p-6 bg-gray-800"
				onMouseDown={(e) => e.stopPropagation()}
			>
				{title && (
					<h2 className="text-lg font-semibold mb-4">{title}</h2>
				)}
				<div>{children}</div>
			</div>
		</div>,
		document.body,
	);
}

export default Modal;
