import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicationsList from './PublicationsList';

interface Props {
    p: any;
    usersMap: Record<string,string>; // user_id to username
    currentId?: string;
    onDelete: (id: string) => void;
    deletingId?: string | null;
}


const PredictionItem: FC<Props> = ({ p, usersMap, currentId, onDelete, deletingId }) => {
    const navigate = useNavigate();

    const author = (p.user_id && typeof p.user_id === 'string') ? usersMap[p.user_id] : "inconnu";
    const isMine = Boolean(currentId && p?.user_id && ((typeof p.user_id === 'string' && p.user_id === currentId) || (typeof p.user_id === 'object' && p.user_id._id && String(p.user_id._id) === currentId)));

    // publications UI moved to PublicationsList

    return (
        <li key={p._id} className="p-3 border rounded bg-white text-black" onClick={() => navigate(`/prediction/${p._id}`)}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.description && <p className="text-sm">{p.description}</p>}
                    {author ? <p className="text-xs text-gray-500">Par: {author}</p> : null}
                    <p className="text-xs">Fin: {new Date(p.dateFin).toLocaleString()}</p>
                </div>
                <div className="text-sm">{p.status}</div>
            </div>
            {p.options && (
                <div className="mt-2 text-xs text-gray-600">Options: {Object.entries(p.options).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
            )}
            {isMine ? (
                <div className="mt-2">
                    <button className="text-red-600 text-sm" onClick={() => onDelete(p._id)} disabled={deletingId === p._id}>{deletingId === p._id ? 'Suppression...' : 'Supprimer'}</button>
                </div>
            ) : null}
            <div>
                <PublicationsList predictionId={p._id} usersMap={usersMap} currentId={currentId} />
            </div>
        </li>
    );
}

export default PredictionItem;
