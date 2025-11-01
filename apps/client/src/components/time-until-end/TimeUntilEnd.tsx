import React, { useEffect, useState } from "react";

interface TimeUntilProps {
	endDate: string;
}

const plural = (n: number, singular: string, pluralForm?: string) =>
	`${n} ${n > 1 ? (pluralForm ?? singular + "s") : singular}`;

const TimeUntilEnd: React.FC<TimeUntilProps> = ({ endDate }) => {
	const [text, setText] = useState("");
	const [intervalDelay, setIntervalDelay] = useState<number>(60000);

	const updateTime = () => {
		const now = new Date();
		const end = new Date(endDate);

		if (isNaN(end.getTime())) {
			setText("Date invalide");
			return;
		}

		const diffMs = end.getTime() - now.getTime();
		if (diffMs <= 0) {
			setText("Terminé !");
			return;
		}

		let totalSeconds = Math.floor(diffMs / 1000);

		const weeks = Math.floor(totalSeconds / (7 * 24 * 3600));
		totalSeconds -= weeks * 7 * 24 * 3600;

		const days = Math.floor(totalSeconds / (24 * 3600));
		totalSeconds -= days * 24 * 3600;

		const hours = Math.floor(totalSeconds / 3600);
		totalSeconds -= hours * 3600;

		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds - minutes * 60;

		// règle d'affichage / granularité comme dans ton code d'origine
		if (weeks >= 1) {
			setText(`Fini dans ${plural(weeks, "semaine")}${days ? " " + plural(days, "jour") : ""}`);
			setIntervalDelay(3600000); // mise à jour toutes les heures
		} else if (days >= 3) {
			setText(`Fini dans ${plural(days, "jour")}${hours ? " " + plural(hours, "heure") : ""}`);
			setIntervalDelay(300000); // 5 min
		} else if (days >= 1) {
			setText(
				`Fini dans ${plural(days, "jour")}${hours ? " " + plural(hours, "heure") : ""}${
					minutes ? " " + plural(minutes, "minute") : ""
				}`,
			);
			setIntervalDelay(60000); // 1 min
		} else if (hours >= 1) {
			setText(`Fini dans ${plural(hours, "heure")}${minutes ? " " + plural(minutes, "minute") : ""}`);
			setIntervalDelay(30000); // 30s
		} else {
			setText(`Fini dans ${plural(minutes, "minute")}${seconds ? " " + plural(seconds, "seconde") : ""}`);
			setIntervalDelay(1000); // 1s
		}
	};

	useEffect(() => {
		updateTime();
		const timer = setInterval(updateTime, intervalDelay);
		return () => clearInterval(timer);
	}, [endDate, intervalDelay]);

	return (
		<div className={`w-fit relative px-4 py-2 text-sm font-semibold uppercase rounded-full`}>
			<span>{text}</span>
		</div>
	);
};

export default TimeUntilEnd;
