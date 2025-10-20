import React from "react";
import type { Publication } from "../../modules/publication/publication.interface";
import { Heart, MessageSquare, MessageSquarePlus } from "lucide-react";
import WritePublication from "./WritePublication";

interface PublicationCardProps {
	predictionId: string;
	username: string;
	publication: Publication;
	publications: Publication[];
	addPublication: (message: Publication) => void;
	toggleLike: (publicationId: string) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
	predictionId,
	username,
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
			<div className="text-white border border-gray-700 rounded-lg p-4 shadow-md">
				<p className="font-bold">{publication.user_id}</p>
				<h3 className="">{publication.message}</h3>
				<div className="flex gap-4">
					<p className="text-gray-400">{publication.datePublication.toLocaleString()}</p>
					<div className="flex gap-1 cursor-pointer">
						<Heart
							strokeWidth={1.25}
							className={`transition-all duration-300 ease-in-out hover:fill-red-500
                            hover:scale-110 active:scale-95 ${publication.likes.includes(username) ? "fill-red-500" : "transparent"}`}
							onClick={() => toggleLike(publication._id)}
						/>
						<div>{publication.likes.length}</div>
					</div>
					<div className="flex gap-1 cursor-pointer">
						<MessageSquare
							strokeWidth={1.25}
							className="transition-all duration-300 ease-in-out fill-transparent hover:fill-blue-500
                            hover:scale-110 active:scale-95"
							onClick={() => setShowChildren(!showChildren)}
						/>
						<div>{childPublications.length}</div>
					</div>
					<div>
						<MessageSquarePlus
							strokeWidth={1.25}
							className="transition-all duration-300 ease-in-out fill-transparent hover:fill-green-500
                            hover:scale-110 active:scale-95"
							onClick={() => setShowPublicationBox(!showPublicationBox)}
						/>
					</div>
				</div>
			</div>
			<div className="mx-20 mt-2">
				{showPublicationBox && (
					<WritePublication
						predictionId={predictionId}
						username={username}
						parentPublication={publication}
						placeholder={"Écrivez votre réponse ..."}
						addPublication={addPublicationAndShowChildren}
					/>
				)}
			</div>
			{childPublications.length > 0 && showChildren && (
				<div className="ml-20 mt-2" ref={publicationDivRef}>
					{childPublications.map((child) => (
						<PublicationCard
                            key={child._id}
							predictionId={predictionId}
							username={username}
							publication={child}
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
