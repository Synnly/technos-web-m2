export interface Publication {
	_id: string;
	message: string;
	datePublication: Date;
	prediction_id: string;
	parentPublication_id: string | undefined;
	user_id: string;
	likes: string[];
}
