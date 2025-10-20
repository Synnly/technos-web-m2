import AmountButton from "./AmountButton";
import CustomAmountInput from "./CustomAmountInput";

interface AmountButtonRowProps {
	currentAmount: number;
    customAmount: number;
	customAmountSelected: boolean;
    setCurrentAmount: (amount: number) => void;
    setCustomAmount: (amount: number) => void;
    setCustomAmountSelected: (selected: boolean) => void;
}

const AmountButtonRow: React.FC<AmountButtonRowProps> = ({
	currentAmount,
	customAmount,
	customAmountSelected,
    setCurrentAmount,
    setCustomAmount,
    setCustomAmountSelected,
}: AmountButtonRowProps) => {
	const amounts = [10, 50, 100, 1000, 10000];

	const onAmountButtonClick = (amount: number) => {
		if (amount === currentAmount) {
			setCustomAmountSelected(false);
			setCurrentAmount(0);
		} else {
			setCurrentAmount(amount);
			setCustomAmountSelected(false);
		}
	};

	const onCustomAmountBlur = (amount: number) => {
		setCurrentAmount(Math.min(0, customAmount));
		setCustomAmount(amount);
		setCustomAmountSelected(customAmount > 0);
	};

	const onCustomAmountClick = () => {
		if (customAmountSelected) {
			setCustomAmountSelected(false);
			setCurrentAmount(0);
		} else {
			setCurrentAmount(Math.min(0, customAmount));
			setCustomAmountSelected(customAmount > 0);
		}
	};

	return (
		<>
			{Object.values(amounts).map((amount) => (
				<AmountButton
					key={amount}
					amount={amount}
					onClick={() => {
						onAmountButtonClick(amount);
					}}
					currentAmount={currentAmount}
				/>
			))}
			<CustomAmountInput
				onBlur={onCustomAmountBlur}
				customAmountSelected={customAmountSelected}
				onCustomAmountClick={onCustomAmountClick}
			/>
		</>
	);
};

export default AmountButtonRow;
