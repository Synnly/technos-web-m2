import type { Publication } from "../../modules/publication/publication.interface";
import PublicationCard from "./PublicationCard";

interface PublicationListProps {
	predictionId: string;
	username: string;
	publications: Publication[];
    addPublication: (message: Publication) => void;
	toggleLike: (publicationId: string) => void;
}

const PublicationList: React.FC<PublicationListProps> = ({ predictionId, username, publications, addPublication, toggleLike }) => {

	const parentsPublications = publications.filter((pub) => !pub.parentPublication_id);

	return (
		<div className="flex flex-col gap-4">
			{parentsPublications.map((publication) => (
				<PublicationCard
                    key={publication._id}
					predictionId={predictionId}
					username={username}
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
