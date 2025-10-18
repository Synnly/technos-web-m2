import CosmeticCard from "./cosmetic-card/CosmeticCard";

export default function CosmeticList({ owned, applied, apply }: any) {
	if (owned.length === 0) {
		return (
			<div className="col-span-full text-sm text-gray-500 bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-center">
				Vous ne possédez aucun cosmétique.
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{owned.map((c: any) => (
				<CosmeticCard
					key={c._id}
					id={c._id}
					name={c.name}
					cost={c.cost}
					isApplied={applied.includes(String(c._id))}
					onApply={apply}
					type={c.type}
				/>
			))}
		</div>
	);
}
