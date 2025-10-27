interface AmountButtonProps {
    amount: number;
    onClick: () => void;
    currentAmount: number;
}

const AmountButton: React.FC<AmountButtonProps> = ({ amount, onClick, currentAmount }) => {
    const displayAmount = amount >= 1000 ? (amount / 1000).toFixed(0) + 'k' : amount;

    return (
        <button
            className={`text-white md:text-lg font-semibold md:px-10 py-4 border border-gray-700 rounded-lg cursor-pointer shadow-md
        transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-xl click:bg-gray-700 bg-gray-${amount === currentAmount ? '700' : '800'}`}
            onClick={onClick}
        >
            {displayAmount} points
        </button>
    );
};

export default AmountButton;
