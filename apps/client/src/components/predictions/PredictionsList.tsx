import type { FC } from 'react';
import { PredictionItem } from './PredictionItem';

interface Props {
    predictions: any[];
    usersMap: Record<string,string>;
    currentId?: string;
    onDelete: (id: string) => void;
    deletingId?: string | null;
    showOnlyMine?: boolean;
}

const PredictionsList: FC<Props> = ({ predictions, usersMap, currentId, onDelete, deletingId, showOnlyMine }) => {
    const list = showOnlyMine ? predictions.filter((p) => {
        if (!currentId) return false;
        if (!p?.user_id) return false;
        if (typeof p.user_id === 'string') return p.user_id === currentId;
        if (typeof p.user_id === 'object' && p.user_id._id) return String(p.user_id._id) === currentId;
        return false;
    }) : predictions;

    if (list.length === 0) return <div>Aucune publication pour le moment.</div>;

    return (
        <ul className="space-y-4">
            {list.map((p) => (
                <PredictionItem key={p._id} p={p} usersMap={usersMap} currentId={currentId} onDelete={onDelete} deletingId={deletingId} />
            ))}
        </ul>
    );
}

export default PredictionsList;
