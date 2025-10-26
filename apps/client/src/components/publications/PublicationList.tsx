import type { Publication } from "../../modules/publication/publication.interface";
import type { PublicUser } from "../../modules/user/user.interface";
import PublicationCard from "./PublicationCard";

interface PublicationListProps {
	predictionId: string;
	users: Array<PublicUser>;
	user_id: string;
	publications: Publication[];
	addPublication: (message: Publication) => void;
	toggleLike: (publicationId: string) => void;
}

const PublicationList: React.FC<PublicationListProps> = ({
	predictionId,
	user_id,
	users,
	publications,
	addPublication,
	toggleLike,
}) => {
	const parentsPublications = publications.filter((pub) => pub.parentPublication_id === undefined);

	return (
		<div className="flex flex-col gap-4">
			{parentsPublications.map((publication) => (
				<PublicationCard
					key={publication._id}
					predictionId={predictionId}
					user_id={user_id}
					users={users}
					publication={publication}
					publications={publications}
					addPublication={addPublication}
					toggleLike={toggleLike}
				/>
			))}
		</div>
	);
};

export default PublicationList;
