import XPBar from "../../experience-bar/XPBar";
import type { User } from "../../../modules/user/user.interface";

type Props = {
	user: User;
};

export default function XPSection({ user }: Props) {
	return (
		<div className="my-8">
			<h1 className="text-xl font-bold text-white mb-6">
				Progression du joueur
			</h1>

			<div className=" max-w-md">
				<XPBar points={user && user.points} />
			</div>
		</div>
	);
}
