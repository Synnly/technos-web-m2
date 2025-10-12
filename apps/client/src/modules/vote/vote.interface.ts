export interface Vote {
	_id: string;
	amount: number;
	prediction_id: string;
	option: string;
	date: Date;
	user_id: string;
}
