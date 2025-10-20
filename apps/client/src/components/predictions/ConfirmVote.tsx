interface ConfirmVoteProps {
	onClick: () => void;
}

const ConfirmVote: React.FC<ConfirmVoteProps> = ({ onClick }) => {
	return (
		<div className="flex justify-center">
			<div
				className="w-3/4 text-green-400 bg-green-800/50 border border-green-700 rounded-lg px-5 py-2 text-center text-lg 
            font-bold cursor-pointer shadow-md transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-lg
            hover:shadow-green-700"
				onClick={onClick}
			>
				Confirmer le vote
			</div>
		</div>
	);
};
export default ConfirmVote;
