import React from "react";
import type { ToastProps } from "./Toast.interface";

const ToastComponent: React.FC<ToastProps> = ({
	message,
	type,
	duration = 3000,
	icon,
	delay = 0,
	onClose,
}) => {
	const onCloseRef = React.useRef(onClose);
	React.useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			if (onCloseRef.current) onCloseRef.current();
		}, (duration || 0) + (delay || 0));
		return () => clearTimeout(timer);
	}, [duration, delay]);

	const typeStyles = {
		success: "text-green-800",
		error: "text-red-800",
		info: "text-white",
	};
	return (
		<div
			className=	
			{` 	fixed bottom-6 right-6 
			  bg-gray-900/90
              	backdrop-blur-lg 
              	font-medium 
              	border border-gray-700/50 
              	shadow-lg shadow-black/50 
              	px-4 py-3 rounded-xl 
              	flex items-center gap-2 
              	animate-slideUpFade ${typeStyles[type]}`
			}
			
			style={{ animation: `fadeIn 0.5s ease-in-out ${delay}ms` }}
		>
			{icon && <span className="text-xl">{icon}</span>}
			<span>{message}</span>

			<style>{`
                    @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
         `}</style>
		</div>
	);
};

export default ToastComponent;
