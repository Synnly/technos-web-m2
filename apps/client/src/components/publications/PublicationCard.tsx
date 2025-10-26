import React from "react";
import type { Publication } from "../../modules/publication/publication.interface";
import { Heart, MessageSquare, MessageSquarePlus } from "lucide-react";
import WritePublication from "./WritePublication";
import type { PublicUser } from "../../modules/user/user.interface";

interface PublicationCardProps {
	predictionId: string;
	user_id: string;
	users: Array<PublicUser>;
	publication: Publication;
	publications: Publication[];
	addPublication: (message: Publication) => void;
	toggleLike: (publicationId: string) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
	predictionId,
	user_id,
	users,
	publication,
	publications,
	addPublication,
	toggleLike,
}) => {
	const [showChildren, setShowChildren] = React.useState(false);
	const [showPublicationBox, setShowPublicationBox] = React.useState(false);
	const childPublications = publications.filter((pub) => pub.parentPublication_id === publication._id);
	const publicationDivRef = React.useRef<HTMLDivElement>(null);

	const addPublicationAndShowChildren = (newPublication: Publication) => {
		addPublication(newPublication);
		setShowPublicationBox(false);
		setShowChildren(true);
	};
	
	return (
		<div>
			<div className="text-sm md:text-base bg-gray-800/50 text-white border border-gray-700 rounded-lg p-4 shadow-md">
				<p className="font-bold">{users.find((user) => user._id === publication.user_id)?.username}</p>
				<h3>{publication.message}</h3>
				<div className="flex gap-4 mt-1">
					<p className="text-gray-400">{publication.datePublication.toLocaleDateString()}</p>
					<div className="flex gap-1 cursor-pointer">
						<Heart
							strokeWidth={1.25}
							className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ease-in-out hover:fill-red-500
                            hover:scale-110 active:scale-95 ${publication.likes.includes(user_id) ? "fill-red-500" : "fill-transparent"} 
							`}
							onClick={() => toggleLike(publication._id)}
						/>
						<div>{publication.likes.length}</div>
					</div>
					<div className="flex gap-1 cursor-pointer">
						<MessageSquare
							strokeWidth={1.25}
							className="w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ease-in-out fill-transparent hover:fill-blue-500
                            hover:scale-110 active:scale-95"
							onClick={() => setShowChildren(!showChildren)}
						/>
						<div>{childPublications.length}</div>
					</div>
					<div>
						<MessageSquarePlus
							strokeWidth={1.25}
							className="w-5 h-5 md:w-6 md:h-6 transition-all duration-300 ease-in-out fill-transparent hover:fill-green-500
                            hover:scale-110 active:scale-95"
							onClick={() => setShowPublicationBox(!showPublicationBox)}
						/>
					</div>
				</div>
			</div>
			<div className="ml-10 md:mx-20 mt-2">
				{showPublicationBox && (
					<WritePublication
						predictionId={predictionId}
						user_id={user_id}
						parentPublication={publication}
						placeholder={"Écrivez votre réponse ..."}
						addPublication={addPublicationAndShowChildren}
					/>
				)}
			</div>
			{childPublications.length > 0 && showChildren && (
				<div className="ml-7 sm:ml-10 lg:ml-20 mt-2" ref={publicationDivRef}>
					{childPublications.map((child) => (
						<PublicationCard
                            key={child._id}
							predictionId={predictionId}
							user_id={user_id}
							publication={child}
							users={users}
							publications={publications}
							addPublication={addPublicationAndShowChildren}
							toggleLike={toggleLike}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default PublicationCard;
