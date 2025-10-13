import React, { useEffect, useState } from "react";
import {
	formatDuration,
	intervalToDuration,
	isBefore,
	differenceInHours,
	differenceInDays,
	differenceInWeeks,
} from "date-fns";
import { fr } from "date-fns/locale";

interface TimeUntilProps {
	endDate: string;
}

const TimeUntilEnd: React.FC<TimeUntilProps> = ({ endDate }) => {
	const [text, setText] = useState("");
	const [intervalDelay, setIntervalDelay] = useState(60000);

	const updateTime = () => {
		const now = new Date();
		const end = new Date(endDate);

		if (isBefore(end, now)) {
			setText("Terminé !");
			return;
		}

		const hoursLeft = differenceInHours(end, now);
		const daysLeft = differenceInDays(end, now);
		const weeksLeft = differenceInWeeks(end, now);

		let duration;
		if (weeksLeft >= 1) {
			duration = intervalToDuration({ start: now, end });
			setText(
				`Fini dans ${formatDuration(
					{ weeks: duration.weeks, days: duration.days },
					{ locale: fr },
				)}`,
			);
			setIntervalDelay(3600000);
		} else if (daysLeft >= 3) {
			duration = intervalToDuration({ start: now, end });
			setText(
				`Fini dans ${formatDuration(
					{ days: duration.days, hours: duration.hours },
					{ locale: fr },
				)}`,
			);
			setIntervalDelay(300000);
		} else if (daysLeft >= 1) {
			duration = intervalToDuration({ start: now, end });
			setText(
				`Fini dans ${formatDuration(
					{
						days: duration.days,
						hours: duration.hours,
						minutes: duration.minutes,
					},
					{ locale: fr },
				)}`,
			);
			setIntervalDelay(60000);
		} else if (hoursLeft >= 1) {
			duration = intervalToDuration({ start: now, end });
			setText(
				`Fini dans ${formatDuration(
					{ hours: duration.hours, minutes: duration.minutes },
					{ locale: fr },
				)}`,
			);
			setIntervalDelay(30000);
		} else {
			duration = intervalToDuration({ start: now, end });
			setText(
				`Fini dans ${formatDuration(
					{ minutes: duration.minutes, seconds: duration.seconds },
					{ locale: fr },
				)}`,
			);
			setIntervalDelay(1000);
		}
	};

	useEffect(() => {
		updateTime();
		const timer = setInterval(updateTime, intervalDelay);
		return () => clearInterval(timer);
	}, [endDate, intervalDelay]);

	return (
		<div
			className={`w-fit relative px-4 py-2 text-sm font-semibold uppercase rounded-full`}
		>
			<span>{text}</span>
		</div>
	);
};

export default TimeUntilEnd;
