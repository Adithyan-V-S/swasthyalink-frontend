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
  increment,
} from 'firebase/firestore';
import { createChatMessageNotification } from './notificationService';

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

// Send a text message (enabled for Firestore writes)
export const sendMessage = async ({ conversationId, senderId, text }) => {
  if (!conversationId || !senderId) throw new Error('conversationId and senderId are required');
  if (!text || !text.trim()) return;
  const trimmed = text.trim();

  // Load conversation
  const convoRef = doc(db, CHATS_COLLECTION, conversationId);
  const convoSnap = await getDoc(convoRef);
  if (!convoSnap.exists()) throw new Error('Conversation not found');
  const convo = convoSnap.data();
  const participants = Array.isArray(convo.participants) ? convo.participants : [];
  const otherUid = participants.find((u) => u !== senderId);

  // Add message
  const msgsRef = collection(db, CHATS_COLLECTION, conversationId, 'messages');
  const now = serverTimestamp();
  await addDoc(msgsRef, {
    text: trimmed,
    senderId,
    timestamp: now,
    readBy: { [senderId]: now },
    isDeleted: false,
    deletedFor: {},
  });

  // Update conversation metadata and unread counter
  const updates = {
    lastMessage: trimmed,
    lastMessageTime: now,
    lastSenderId: senderId,
  };
  if (otherUid) {
    updates[`unread.${otherUid}`] = increment(1);
  }
  await updateDoc(convoRef, updates);

  // Try to notify other participant (non-blocking)
  try {
    if (otherUid) {
      await createChatMessageNotification(otherUid, {
        text: trimmed,
        fromUid: senderId,
        conversationId,
      });
    }
  } catch (_) {}
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
// Throttled version to reduce Firestore writes
let markReadTimeout = null;
let pendingMarkReadCalls = [];

export const markMessagesAsRead = ({ conversationId, readerUid, messages }) => {
  if (!conversationId || !readerUid || !Array.isArray(messages)) return;

  // Add to pending calls
  pendingMarkReadCalls.push({ conversationId, readerUid, messages });

  if (markReadTimeout) return;

  markReadTimeout = setTimeout(async () => {
    const callsToProcess = [...pendingMarkReadCalls];
    pendingMarkReadCalls = [];
    markReadTimeout = null;

    try {
      const updates = [];
      callsToProcess.forEach(({ conversationId, readerUid, messages }) => {
        messages
          .filter((m) => m && m.senderId !== readerUid && !(m.readBy && m.readBy[readerUid]))
          .forEach((m) => {
            const msgRef = doc(db, CHATS_COLLECTION, conversationId, 'messages', m.id);
            updates.push(updateDoc(msgRef, { [`readBy.${readerUid}`]: serverTimestamp() }));
          });
      });
      await Promise.allSettled(updates);
    } catch (e) {
      if (e.code === 'resource-exhausted' || e.message.includes('quota')) {
        console.warn('Firestore quota exceeded in markMessagesAsRead, throttling updates');
      } else {
        console.error('markMessagesAsRead error:', e);
      }
    }
  }, 2000); // Throttle updates every 2 seconds
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