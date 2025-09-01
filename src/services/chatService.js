// frontend/src/services/chatService.js
// Firestore-backed family chat service (1-to-1 conversations)

import { db } from '../firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

const CHATS_COLLECTION = 'familyChats';

// Deterministic conversation ID for 1-to-1 chat
const conversationIdFor = (uidA, uidB) => {
  return [uidA, uidB].sort().join('_');
};

// Create conversation doc if it does not exist
export const getOrCreateConversation = async ({
  currentUid,
  otherUid,
  currentUserInfo, // {name, email, avatar}
  otherUserInfo,   // {name, email, avatar}
}) => {
  if (!currentUid || !otherUid) throw new Error('Both user IDs are required');

  const convoId = conversationIdFor(currentUid, otherUid);
  const convoRef = doc(db, CHATS_COLLECTION, convoId);
  const snap = await getDoc(convoRef);

  if (!snap.exists()) {
    const now = serverTimestamp();
    await setDoc(convoRef, {
      id: convoId,
      participants: [currentUid, otherUid],
      participantInfo: {
        [currentUid]: currentUserInfo || {},
        [otherUid]: otherUserInfo || {},
      },
      createdAt: now,
      updatedAt: now,
      lastMessage: '',
      lastMessageTime: now,
      lastSenderId: '',
      unread: {
        [currentUid]: 0,
        [otherUid]: 0,
      },
    });
  }

  return { id: convoId, ref: convoRef };
};

// Realtime list of conversations for a user
export const subscribeToConversations = (currentUid, callback) => {
  if (!currentUid) throw new Error('currentUid is required');
  // Avoid orderBy here to prevent composite index requirement and SDK assertion issues
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('participants', 'array-contains', currentUid)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort client-side by lastMessageTime desc
      items.sort((a, b) => {
        const at = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : new Date(a.lastMessageTime || 0).getTime();
        const bt = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : new Date(b.lastMessageTime || 0).getTime();
        return bt - at;
      });
      callback(items);
    },
    (error) => {
      console.error('subscribeToConversations error:', error);
      callback([]);
    }
  );
};

// Realtime messages in a conversation
export const subscribeToMessages = (conversationId, callback) => {
  const msgsRef = collection(db, CHATS_COLLECTION, conversationId, 'messages');
  const q = query(msgsRef, orderBy('timestamp', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
};

// Send a text message
export const sendMessage = async ({ conversationId, senderId, text }) => {
  if (!text || !text.trim()) return;
  const trimmed = text.trim();

  const msgsRef = collection(db, CHATS_COLLECTION, conversationId, 'messages');
  const newMsg = {
    senderId,
    text: trimmed,
    type: 'text',
    timestamp: serverTimestamp(),
  };

  await addDoc(msgsRef, newMsg);

  // Update conversation metadata
  const convoRef = doc(db, CHATS_COLLECTION, conversationId);
  const convoSnap = await getDoc(convoRef);
  if (convoSnap.exists()) {
    const convo = convoSnap.data();
    const otherUid = convo.participants.find((u) => u !== senderId);
    await updateDoc(convoRef, {
      lastMessage: trimmed,
      lastMessageTime: serverTimestamp(),
      lastSenderId: senderId,
      updatedAt: serverTimestamp(),
      [`unread.${otherUid}`]: (convo.unread?.[otherUid] || 0) + 1,
    });
  }
};

// Mark messages as read for current user
export const markAsRead = async ({ conversationId, userUid }) => {
  const convoRef = doc(db, CHATS_COLLECTION, conversationId);
  await updateDoc(convoRef, {
    [`unread.${userUid}`]: 0,
  });
};

// Convenience to shape participant view data
export const getOtherParticipant = (conversation, currentUid) => {
  const otherUid = conversation.participants.find((u) => u !== currentUid);
  const info = conversation.participantInfo?.[otherUid] || {};
  return { uid: otherUid, ...info };
};

// Mark all messages from the other participant as read (adds readBy[readerUid])
export const markMessagesAsRead = async ({ conversationId, readerUid, messages }) => {
  try {
    if (!conversationId || !readerUid || !Array.isArray(messages)) return;
    const updates = messages
      .filter((m) => m && m.senderId !== readerUid && !(m.readBy && m.readBy[readerUid]))
      .map(async (m) => {
        const msgRef = doc(db, CHATS_COLLECTION, conversationId, 'messages', m.id);
        await updateDoc(msgRef, { [`readBy.${readerUid}`]: serverTimestamp() });
      });
    await Promise.allSettled(updates);
  } catch (e) {
    console.error('markMessagesAsRead error:', e);
  }
};

// Soft-delete a message for the current user only
export const deleteMessageForMe = async ({ conversationId, messageId, userUid }) => {
  if (!conversationId || !messageId || !userUid) return;
  const msgRef = doc(db, CHATS_COLLECTION, conversationId, 'messages', messageId);
  await updateDoc(msgRef, { [`deletedFor.${userUid}`]: true });
};

// Delete a message for everyone (only sender can do this)
export const deleteMessageForEveryone = async ({ conversationId, messageId, requesterUid }) => {
  if (!conversationId || !messageId || !requesterUid) return;
  const msgRef = doc(db, CHATS_COLLECTION, conversationId, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  const data = snap.data();
  if (data.senderId !== requesterUid) throw new Error('Only the sender can delete this message for everyone.');
  await updateDoc(msgRef, {
    isDeleted: true,
    text: '', // keep text empty; UI will show a placeholder
    deletedAt: serverTimestamp(),
  });
};

export default {
  conversationIdFor,
  getOrCreateConversation,
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markAsRead,
  getOtherParticipant,
  markMessagesAsRead,
  deleteMessageForMe,
  deleteMessageForEveryone,
};