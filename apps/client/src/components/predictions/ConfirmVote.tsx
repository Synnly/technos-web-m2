interface ConfirmVoteProps {
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmVote: React.FC<ConfirmVoteProps> = ({ onConfirm, onCancel }) => {
	return (
		<div
			className="text-green-400 bg-green-800/50 border border-green-700 rounded-lg px-5 py-2 text-center text-lg 
            font-bold cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.025] hover:shadow-lg 
            hover:shadow-green-700"
		>
			Confirmer le vote
		</div>
	);
};
export default ConfirmVote;
