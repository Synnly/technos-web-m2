import { Send } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Publication } from "../../modules/publication/publication.interface";

interface WritePublicationProps {
	predictionId: string;
	username: string;
	placeholder: string;
	parentPublication?: Publication;
	addPublication: (message: Publication) => void;
}

const WritePublication: React.FC<WritePublicationProps> = ({
	predictionId,
	username,
	placeholder,
	parentPublication,
	addPublication,
}) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleInput = () => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	};

	const sendPublication = () => {
		if (textareaRef.current) {
			const publication = {
				_id: ((Math.random() * 1000) % 10) + "",
				message: textareaRef.current.value,
				datePublication: new Date(),
				prediction_id: predictionId,
				parentPublication_id: parentPublication ? parentPublication._id : undefined,
				user_id: username,
				likes: [],
			};
			addPublication(publication);
			textareaRef.current.value = "";
			handleInput();
		}
	};

	useEffect(() => {
		handleInput();
	}, []);

	return (
		<div className="bg-gray-800/50 p-4 border border-gray-700 rounded-lg shadow-md w-full">
			<div className="flex flex-row justify-between gap-4">
				<textarea
					placeholder={placeholder}
					className="outline-none text-gray-400 mb-2 resize-none overflow-hidden w-full"
					rows={1}
					onChange={handleInput}
					ref={textareaRef}
				/>

				<button
					className="text-white bg-gray-800 border border-gray-700 self-center rounded-md w-fit p-1 md:p-2 cursor-pointer 
                	transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-xl background-gray-700 h-fit"
					onClick={() => {
						sendPublication();
					}}
				>
					<Send strokeWidth={1.5} className="w-5 h-5 md:w-6 md:h-6" />
				</button>
			</div>
		</div>
	);
};

export default WritePublication;
