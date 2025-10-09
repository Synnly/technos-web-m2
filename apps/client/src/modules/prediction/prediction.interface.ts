export interface PredictionFormValues {
  title: string;
  description?: string;
  dateFin: string;
}

export interface PredictionPayload {
  title: string;
  description?: string;
  dateFin: string;
  status?: string;
  result?: string;
  options: Record<string, number>;
  user_id?: string;
}

export interface CreatePredictionDeps {
  username?: string | null;
  fetchPredictions?: () => Promise<void>;
  onClose?: () => void;
  setToast?: (msg: string) => void;
  setLocalError?: (msg: string | null) => void;
}
export type PredictionStatus = 'waiting' | 'valid' | 'invalid';


export interface Prediction {
    _id: string;
    title: string;
    description: string;
    status: PredictionStatus;
    dateFin: Date;
    options: Record<string, number>;
    user_id: string;
    result: string;
}