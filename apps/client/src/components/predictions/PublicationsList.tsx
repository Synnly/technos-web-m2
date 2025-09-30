import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Props {
  p: any;
  predictionId: string;
  usersMap: Record<string, string>;
  currentId?: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function PublicationsList({p, predictionId, usersMap, currentId }: Props) {
  const [showPublications, setShowPublications] = useState(false);
  const [publications, setPublications] = useState<any[]>([]);
  const [loadingPubs, setLoadingPubs] = useState(false);
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [postingReply, setPostingReply] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [postingNew, setPostingNew] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');


  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const fetchPubs = async () => {
    setLoadingPubs(true);
    try {
      const res = await axios.get(`${API_URL}/publication`, {
    headers: { Authorization: `Bearer ${token}` },
  });
      const pubs: any[] = res.data || [];
      const filtered = pubs.filter(d => {
        if (!d?.prediction_id) return false;
        if (typeof d.prediction_id === 'string') return d.prediction_id === predictionId;
        if (typeof d.prediction_id === 'object' && d.prediction_id._id) return String(d.prediction_id._id) === predictionId;
        return false;
      });
      // normalize _id to string for ease
      const normalized = filtered.map((d) => ({ ...d, _id: String(d._id), parentPublication_id: d.parentPublication_id ? String(d.parentPublication_id) : undefined }));
      setPublications(normalized);
    } catch (e) {
      setPublications([]);
    } finally {
      setLoadingPubs(false);
    }
  };

  // helper to build tree from flat publications
  const buildTree = (items: any[]) => {
    const byId: Record<string, any> = {};
    items.forEach((it) => { byId[it._id] = { ...it, children: [] }; });
    const roots: any[] = [];
    items.forEach((it) => {
      const id = String(it._id);
      const parent = it.parentPublication_id ? String(it.parentPublication_id) : null;
      if (parent && byId[parent]) {
        byId[parent].children.push(byId[id]);
      } else {
        roots.push(byId[id]);
      }
    });
    return roots;
  };

  return (
    <div className="mt-3 border-t pt-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Commentaires</div>
        <div>
          <button className="text-sm text-white" onClick={async () => {
            if (showPublications) { setShowPublications(false); return; }
            setShowPublications(true);
            await fetchPubs();
          }}>{showPublications ? 'Cacher' : 'Voir'}</button>
        </div>
        <div>
          <button onClick={() => navigate(`/prediction/${p._id}`)} className='text-sm text-white'>
            Voter
          </button>
        </div>
      </div>

      {showPublications && (
        <div className="mt-2 text-sm">
          {/* Form to add a top-level publication (comment) under this prediction) */}
          <div className="mb-3">
            {currentId ? (
              <div>
                <textarea className="w-full p-2 border rounded" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ajouter un commentaire..." />
                <div className="flex gap-2 mt-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
                    if (!newMessage.trim()) { setNewError("Le message est requis"); return; }
                    setNewError(null);
                    setPostingNew(true);
                    try {
                      const payload: any = {
                        message: newMessage.trim(),
                        datePublication: new Date().toISOString(),
                        prediction_id: predictionId,
                      };
                      if (currentId) payload.user_id = currentId;
                      const token = localStorage.getItem('token');
                      await axios.post(`${API_URL}/publication`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                      await fetchPubs();
                      setNewMessage('');
                    } catch (err: any) {
                      setNewError(err?.response?.data?.message || 'Erreur lors de la création');
                    } finally {
                      setPostingNew(false);
                    }
                  }}>{postingNew ? 'Envoi...' : 'Publier'}</button>
                  <button className="px-3 py-1 bg-gray-200 text-white rounded" onClick={() => setNewMessage('')}>Annuler</button>
                </div>
                {newError && <div className="text-red-500 text-sm mt-1">{newError}</div>}
              </div>
            ) : (
              <div className="text-xs text-gray-400">Connectez-vous pour publier un commentaire</div>
            )}
          </div>
          {loadingPubs ? <div>Chargement...</div> : (
            publications.length === 0 ? <div className="text-xs text-gray-500">Aucun commentaire</div> : (
              <ul className="space-y-2">
                {buildTree(publications).map((root) => {
                  const renderNode = (node: any, level = 0) => {
                    const pubAuthor = (node.user_id && typeof node.user_id === 'string') ? usersMap[node.user_id] : (node.user && node.user.username) || 'inconnu';
                    const hasChildren = node.children && node.children.length > 0;
                    const isCollapsed = collapsedIds.includes(node._id);
                    return (
                      <li key={node._id} className="p-2 bg-gray-50 rounded" style={{ marginLeft: level * 12 }}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {node.parentPublication_id ? (
                              <div className="text-xs text-gray-400">Réponse à {(() => {
                                const parent = publications.find((d) => String(d._id) === String(node.parentPublication_id));
                                if (parent) return (parent.user && parent.user.username) || (parent.user_id && usersMap[parent.user_id]) || 'inconnu';
                                return 'inconnu';
                              })()}</div>
                            ) : null}
                            <div className="text-sm">{node.message}</div>
                            <div className="text-xs text-gray-500">Par: {pubAuthor} • {new Date(node.datePublication).toLocaleString()}</div>
                          </div>
                          <div className="ml-2 flex items-center gap-2">
                            {hasChildren ? (
                              <button className="text-xs text-white" onClick={() => toggleCollapsed(node._id)}>{isCollapsed ? 'Afficher' : 'Réduire'}</button>
                            ) : null}
                            {currentId ? (
                              <button className="text-xs text-white" onClick={() => setReplyFor(node._id)}>Répondre</button>
                            ) : (
                              <div className="text-xs text-gray-400">&nbsp;</div>
                            )}
                          </div>
                        </div>
                        {replyFor === node._id && (
                          <div className="mt-2">
                            <textarea className="w-full p-2 border rounded" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Votre réponse..." />
                            <div className="flex gap-2 mt-2">
                              <button className="px-3 py-1 bg-white text-white rounded" onClick={async () => {
                                if (!replyMessage) return;
                                setPostingReply(true);
                                try {
                                  const payload: any = {
                                    message: replyMessage,
                                    datePublication: new Date().toISOString(),
                                    prediction_id: predictionId,
                                    parentPublication_id: node._id,
                                  };
                                  if (currentId) payload.user_id = currentId;
                                  const token = localStorage.getItem('token');
                                  await axios.post(`${API_URL}/publication`, payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
                                  await fetchPubs();
                                  setReplyFor(null); setReplyMessage('');
                                } catch (err) {
                                  // keep simple UI for now
                                } finally { setPostingReply(false); }
                              }}>{postingReply ? 'Envoi...' : 'Envoyer'}</button>
                              <button className="px-3 py-1 bg-gray-200 text-white rounded" onClick={() => { setReplyFor(null); setReplyMessage(''); }}>Annuler</button>
                            </div>
                          </div>
                        )}
                        {/* render children unless collapsed */}
                        {hasChildren && !isCollapsed && (
                          <ul className="mt-2 space-y-2">
                            {node.children.map((child: any) => renderNode(child, level + 1))}
                          </ul>
                        )}
                        {hasChildren && isCollapsed && (
                          <div className="text-xs text-gray-500 mt-2">{node.children.length} réponse(s) réduite(s)</div>
                        )}
                      </li>
                    );
                  };
                  return renderNode(root, 0);
                })}
              </ul>
            )
          )}
        </div>
      )}
    </div>
  );
}
