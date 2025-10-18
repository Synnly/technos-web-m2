interface CustomAmountInputProps {
	onChange: (value: number) => void;
	customAmountSelected: boolean;
	onCustomAmountClick: (value: boolean) => void;
}

const CustomAmountInput: React.FC<CustomAmountInputProps> = ({
	onChange,
	customAmountSelected,
	onCustomAmountClick,
}) => {
	return (
		<div
			className={`text-white text-lg font-semibold px-10 py-4 bg-gray-${customAmountSelected ? "700" : "800"} border border-gray-700 rounded-lg cursor-pointer shadow-md
        transition-all duration-300 hover:scale-[1.025] hover:shadow-xl`}
		>
			<input
				type="number"
				placeholder="Montant"
				className="w-full [appearance:textfield] text-center outline-none"
				onClick={() => onCustomAmountClick(true)}
				onChange={(e) => {
					onChange(Number(e.target.value));
				}}
			/>
		</div>
	);
};
export default CustomAmountInput;
