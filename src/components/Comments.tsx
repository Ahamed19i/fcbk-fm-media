
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { toast } from 'sonner';
import { MessageSquare, Send, Trash2, User as UserIcon } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  content: string;
  createdAt: any;
  status: 'approved' | 'pending' | 'rejected';
}

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });

    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeComments = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
      setComments(fetchedComments);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Veuillez vous connecter pour commenter.");
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        articleId,
        userId: user.uid,
        userName: user.displayName || 'Anonyme',
        userPhoto: user.photoURL || '',
        content: newComment.trim(),
        createdAt: new Date().toISOString(), // Using ISO string for simplicity in rules validation
        status: 'approved'
      });
      setNewComment('');
      toast.success("Commentaire publié !");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Erreur lors de la publication du commentaire.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      toast.success("Commentaire supprimé.");
    } catch (error) {
      toast.error("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="text-blue-600" />
        <h2 className="text-2xl font-black tracking-tight dark:text-white">
          Commentaires ({comments.length})
        </h2>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="flex gap-4">
            <div className="shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <UserIcon size={20} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-grow space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-400 outline-none min-h-[100px] resize-none dark:text-white"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} /> Publier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 text-center mb-12 border border-gray-100 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Connectez-vous pour participer à la discussion.</p>
          <button 
            onClick={() => window.location.href = '/admin/login'}
            className="text-blue-600 font-bold hover:underline"
          >
            Se connecter avec Google
          </button>
        </div>
      )}

      <div className="space-y-8">
        {comments.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-600 italic text-center py-8">Soyez le premier à commenter cet article.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="shrink-0">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <UserIcon size={20} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm dark:text-white">{comment.userName}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{formatDate(comment.createdAt)}</span>
                  </div>
                  {user?.uid === comment.userId && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
