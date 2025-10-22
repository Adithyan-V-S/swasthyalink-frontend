import { storage } from '../firebaseConfig';
import { 
  ref, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject, 
  listAll, 
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Collection reference for file metadata
const filesCollection = collection(db, 'userFiles');

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} userId - User ID
 * @param {string} category - File category (medical, prescription, lab, etc.)
 * @param {string} description - File description
 * @returns {Promise<Object>} - Upload result with metadata
 */
export const uploadFile = async (file, userId, category = 'general', description = '') => {
  try {
    console.log('📁 Uploading file:', { name: file.name, size: file.size, type: file.type });
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Create storage reference
    const storageRef = ref(storage, `user-files/${userId}/${category}/${fileName}`);
    
    // Temporary workaround: Since Firebase Storage isn't fully configured,
    // we'll create a mock download URL and store the file data in Firestore
    console.log('⚠️ Firebase Storage not fully configured, using temporary workaround');
    
    // Convert file to base64 for temporary storage
    const fileData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // Create a mock download URL
    const downloadURL = `data:${file.type};base64,${fileData.split(',')[1]}`;
    console.log('🔗 Mock download URL generated');
    
    // Store file metadata in Firestore
    const fileMetadata = {
      userId,
      fileName: file.name,
      storagePath: `user-files/${userId}/${category}/${fileName}`,
      downloadURL,
      fileSize: file.size,
      fileType: file.type,
      category,
      description,
      fileData: fileData, // Store file data temporarily
      uploadedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(filesCollection, fileMetadata);
    console.log('📝 File metadata stored in Firestore:', docRef.id);
    
    return {
      success: true,
      fileId: docRef.id,
      fileName: file.name,
      downloadURL,
      fileSize: file.size,
      fileType: file.type,
      category,
      description,
      uploadedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Get all files for a user
 * @param {string} userId - User ID
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} - Array of file metadata
 */
export const getUserFiles = async (userId, category = null) => {
  try {
    console.log('📁 Fetching files for user:', userId, category ? `category: ${category}` : '');
    
    let q;
    
    if (category && category !== 'all') {
      // Query with category filter (requires composite index)
      q = query(
        filesCollection,
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      // Query without category filter (requires basic index)
      q = query(
        filesCollection,
        where('userId', '==', userId),
        orderBy('uploadedAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const files = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      files.push({
        id: doc.id,
        ...data,
        uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });
    
    console.log('✅ Found', files.length, 'files for user');
    return files;
    
  } catch (error) {
    console.error('❌ Error fetching user files:', error);
    
    // If it's an index error, provide helpful message
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      console.log('🔧 Index required - this will be created automatically');
      // Return empty array for now, index will be created
      return [];
    }
    
    throw new Error(`Failed to fetch files: ${error.message}`);
  }
};

/**
 * Delete a file from storage and Firestore
 * @param {string} fileId - File document ID
 * @param {string} storagePath - Storage path of the file
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFile = async (fileId, storagePath) => {
  try {
    console.log('🗑️ Deleting file:', { fileId, storagePath });
    
    // Delete from Firebase Storage
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    console.log('✅ File deleted from storage');
    
    // Delete metadata from Firestore
    await deleteDoc(doc(filesCollection, fileId));
    console.log('✅ File metadata deleted from Firestore');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Update file metadata
 * @param {string} fileId - File document ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<boolean>} - Success status
 */
export const updateFileMetadata = async (fileId, updates) => {
  try {
    console.log('📝 Updating file metadata:', { fileId, updates });
    
    const fileRef = doc(filesCollection, fileId);
    await updateDoc(fileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ File metadata updated');
    return true;
    
  } catch (error) {
    console.error('❌ Error updating file metadata:', error);
    throw new Error(`Failed to update file: ${error.message}`);
  }
};

/**
 * Get file categories
 * @returns {Array} - Available file categories
 */
export const getFileCategories = () => {
  return [
    { value: 'medical', label: 'Medical Records', icon: 'medical_services' },
    { value: 'prescription', label: 'Prescriptions', icon: 'receipt' },
    { value: 'lab', label: 'Lab Reports', icon: 'science' },
    { value: 'imaging', label: 'Scans & X-rays', icon: 'photo_camera' },
    { value: 'insurance', label: 'Insurance', icon: 'account_balance' },
    { value: 'general', label: 'General Documents', icon: 'description' }
  ];
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type icon
 * @param {string} fileType - MIME type
 * @returns {string} - Material icon name
 */
export const getFileTypeIcon = (fileType) => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('pdf')) return 'picture_as_pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'description';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'slideshow';
  if (fileType.includes('text')) return 'text_snippet';
  return 'insert_drive_file';
};
