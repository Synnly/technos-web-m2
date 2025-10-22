interface CustomAmountInputProps {
	onBlur: (value: number) => void;
	customAmountSelected: boolean;
	onCustomAmountClick: (value: boolean) => void;
}

const CustomAmountInput: React.FC<CustomAmountInputProps> = ({ onBlur, customAmountSelected, onCustomAmountClick }) => {
	return (
		<div
			className={`text-white md:text-lg font-semibold md:px-10 py-4 bg-gray-${customAmountSelected ? "700" : "800"}
             border border-gray-700 rounded-lg cursor-pointer shadow-md transition-all duration-300 hover:scale-[1.025] 
             hover:shadow-xl flex justify-center`}
			onClick={() => onCustomAmountClick(true)}
		>
			<div className="md:w-3/5">
				<input
					type="number"
					placeholder="Montant"
					className="w-full [appearance:textfield] text-center outline-none"
					onBlur={(e) => {
						onBlur(Number(e.target.value));
					}}
				/>
			</div>
		</div>
	);
};
export default CustomAmountInput;
