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

const TimeUntilGaming: React.FC<TimeUntilProps> = ({ endDate }) => {
	const [text, setText] = useState("");
	const [color, setColor] = useState("text-green-400");
	const [intervalDelay, setIntervalDelay] = useState(60000);
	const [glowSpeed, setGlowSpeed] = useState(2.5);

	const updateTime = () => {
		const now = new Date();
		const end = new Date(endDate);

		if (isBefore(end, now)) {
			setText("Terminé !");
			setColor("text-gray-400");
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

		if (hoursLeft < 6) setColor("text-red-500");
		else if (hoursLeft < 48) setColor("text-orange-400");
		else setColor("text-green-400");
	};

	useEffect(() => {
		updateTime();
		const timer = setInterval(updateTime, intervalDelay);
		return () => clearInterval(timer);
	}, [endDate, intervalDelay]);

	useEffect(() => {
		const randomize = () => {
			const newSpeed = 1.5 + Math.random() * 2;
			setGlowSpeed(newSpeed);
		};
		randomize();
		const timer = setInterval(randomize, 5000);
		return () => clearInterval(timer);
	}, []);

	return (
		<div
			className={`w-fit relative px-4 py-2 text-sm font-semibold uppercase tracking-wide ${color} rounded-full`}
		>
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-sm animate-shimmer"></div>
			<span
				className="relative z-10 drop-shadow-[0_0_6px_rgba(0,255,0,0.4)]"
				style={{
					animation: `pulse-glow ${glowSpeed}s ease-in-out infinite`,
				}}
			>
				{text}
			</span>

			<style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 4s linear infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(34,197,94,0.4));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(34,197,94,0.9));
          }
        }
      `}</style>
		</div>
	);
};

export default TimeUntilGaming;
