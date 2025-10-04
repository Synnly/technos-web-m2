import type { FC } from 'react';
import { useEffect, useState } from 'react';
import PublicationsList from './PublicationsList';

interface Props {
    p: any;
    usersMap: Record<string,string>; // user_id to username
    cosmeticsMap?: Record<string, any>;
    usersById?: Record<string, any>;
    currentId?: string;
    onDelete: (id: string) => void;
    deletingId?: string | null;
}


export const PredictionItem: FC<Props> = ({ p, usersMap, cosmeticsMap, usersById, currentId, onDelete, deletingId }) => {

    // local caches (used if parent didn't provide maps)
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const [localCosmeticsMap, setLocalCosmeticsMap] = useState<Record<string, any>>({});
    const [localUsersById, setLocalUsersById] = useState<Record<string, any>>({});

    const effectiveCosmeticsMap = cosmeticsMap ?? localCosmeticsMap;
    const effectiveUsersById = usersById ?? localUsersById;

    // Resolve author username from populated user, usersMap or effectiveUsersById fallback
    const author = (p.user && p.user.username)
        || (typeof p.user_id === 'string' && (usersMap[p.user_id] || effectiveUsersById[p.user_id]?.username))
        || (typeof p.user_id === 'object' && (p.user_id.username || usersMap[String(p.user_id._id)] || effectiveUsersById[String(p.user_id._id)]?.username))
        || "inconnu";

    const isMine = Boolean(currentId && p?.user_id && ((typeof p.user_id === 'string' && p.user_id === currentId) || (typeof p.user_id === 'object' && p.user_id._id && String(p.user_id._id) === currentId)));

    useEffect(() => {
        // if parent didn't provide cosmeticsMap, fetch once
        if (!cosmeticsMap) {
            (async () => {
                try {
                    const res = await fetch(`${API_URL}/cosmetic`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                    const cosArr = await res.json();
                    const cmap: Record<string, any> = {};
                    (cosArr || []).forEach((c: any) => { if (c && c._id) cmap[String(c._id)] = c; });
                    setLocalCosmeticsMap(cmap);
                } catch (e) {
                    setLocalCosmeticsMap({});
                }
            })();
        }
        // if parent didn't provide usersById, fetch once
        if (!usersById) {
            (async () => {
                try {
                    const res = await fetch(`${API_URL}/user`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                    const usersArr = await res.json();
                    const uMap: Record<string, any> = {};
                    (usersArr || []).forEach((u: any) => { if (u && u._id) uMap[String(u._id)] = u; });
                    setLocalUsersById(uMap);
                } catch (e) {
                    setLocalUsersById({});
                }
            })();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // publications UI moved to PublicationsList

    return (
        <li key={p._id} className="p-3 border rounded bg-white text-black">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    {p.description && <p className="text-sm">{p.description}</p>}

                    
                                        {/* resolve full user object if available and applied cosmetic */}
                                        {(() => {
                                                const resolvedUser = (p.user && typeof p.user === 'object') ? p.user : (p.user_id && typeof p.user_id === 'string') ? effectiveUsersById[String(p.user_id)] : (p.user_id && typeof p.user_id === 'object' ? p.user_id : null);
                                                const pubAuthor = resolvedUser?.username ?? ((p.user_id && typeof p.user_id === 'string') ? usersMap[p.user_id] : author || 'inconnu');
                                                let appliedCosmetic: any = null;
                                                const userToCheck = resolvedUser;
                                                if (userToCheck && userToCheck.currentCosmetic) {
                                                    if (typeof userToCheck.currentCosmetic === 'object') appliedCosmetic = userToCheck.currentCosmetic;
                                                    else appliedCosmetic = effectiveCosmeticsMap[String(userToCheck.currentCosmetic)] || null;
                                                }

                                                return (
                                                    <p className="text-xs text-gray-500">Par: {
                                                        appliedCosmetic ? (
                                                            appliedCosmetic.type === 'color' && appliedCosmetic.hexColor ? (
                                                                <span style={{ color: appliedCosmetic.hexColor }}>{pubAuthor}</span>
                                                            ) : appliedCosmetic.type === 'badge' ? (
                                                                <span>{pubAuthor} {appliedCosmetic.name}</span>
                                                            ) : (
                                                                <span>{pubAuthor}</span>
                                                            )
                                                        ) : (
                                                            <span>{pubAuthor}</span>
                                                        )
                                                    }</p>
                                                );
                                        })()}

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
                <PublicationsList p={p} predictionId={p._id} usersMap={usersMap} currentId={currentId} />
            </div>
        </li>
    );
}
 