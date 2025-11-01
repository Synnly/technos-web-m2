import type { User } from "../../../modules/user/user.interface";

type Props = {
	username?: string | null;
	user?: User;
};

function Header({ username, user }: Props) {
	return (
		<div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-2xl p-4 md:p-6 border border-gray-700 mb-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h2 className="text-xl md:text-2xl font-bold mb-2 text-white">
						Bienvenue {username} !
					</h2>
					<p className="text-gray-400 text-base md:text-md">
						Prêt à prédire l'avenir ?
					</p>
				</div>

				<div className="text-left md:text-right">
					<div className="text-lg md:text-xl font-bold text-yellow-400">
						{user && <span>{user.points}</span>}
					</div>
					<div className="text-sm text-gray-400">Total Points</div>
				</div>
			</div>
		</div>
	);
}

export default Header;
