import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text from PDF using PDF.js
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (file) => {
  try {
    console.log('📄 Extracting text from PDF:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('✅ PDF text extracted successfully');
    return fullText.trim();
  } catch (error) {
    console.error('❌ Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Extract text from image using Tesseract OCR
 * @param {File} file - Image file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromImage = async (file) => {
  try {
    console.log('🖼️ Extracting text from image:', file.name);
    
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => console.log('OCR Progress:', m)
    });
    
    console.log('✅ Image text extracted successfully');
    return text.trim();
  } catch (error) {
    console.error('❌ Error extracting image text:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Extract text from document based on file type
 * @param {File} file - Document file
 * @returns {Promise<string>} - Extracted text
 */
export const extractDocumentText = async (file) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  console.log('📋 Extracting text from document:', file.name, fileType);
  
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  } else if (fileType.startsWith('image/') || 
             fileName.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/)) {
    return await extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type for text extraction');
  }
};

/**
 * Generate AI summary using Gemini API
 * @param {string} text - Extracted text from document
 * @param {string} documentType - Type of document (lab report, prescription, etc.)
 * @returns {Promise<string>} - AI-generated summary
 */
export const generateAISummary = async (text, documentType = 'document') => {
  try {
    console.log('🤖 Generating AI summary for:', documentType);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text content found in the document');
    }
    
    // Truncate text if too long (Gemini has token limits)
    const maxLength = 8000; // Adjust based on Gemini's token limits
    const truncatedText = text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
    
    const prompt = `Please analyze and summarize the following ${documentType} document. Provide a clear, detailed summary that includes:

1. **Document Type**: Identify what type of medical document this is
2. **Key Information**: Extract important details like dates, values, medications, diagnoses
3. **Main Findings**: Highlight the primary findings or results
4. **Recommendations**: Any suggested actions or follow-ups
5. **Important Notes**: Any critical information the patient should know

Document Content:
${truncatedText}

Please provide a well-structured summary that a patient can easily understand.`;

    // Use the existing Gemini API configuration
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ AI summary generated successfully');
    
    return data.response || data.message || 'Summary could not be generated';
  } catch (error) {
    console.error('❌ Error generating AI summary:', error);
    throw new Error(`Failed to generate AI summary: ${error.message}`);
  }
};

/**
 * Process document and generate AI summary
 * @param {File} file - Document file
 * @param {string} documentType - Type of document
 * @returns {Promise<Object>} - Summary result
 */
export const processDocumentForAI = async (file, documentType = 'document') => {
  try {
    console.log('🔄 Processing document for AI analysis:', file.name);
    
    // Step 1: Extract text from document
    const extractedText = await extractDocumentText(file);
    
    if (!extractedText || extractedText.trim().length === 0) {
      return {
        success: false,
        error: 'No readable text found in the document. The document might be scanned or corrupted.',
        summary: null
      };
    }
    
    // Step 2: Generate AI summary
    const summary = await generateAISummary(extractedText, documentType);
    
    return {
      success: true,
      summary: summary,
      extractedText: extractedText.substring(0, 500) + '...', // Preview of extracted text
      documentType: documentType,
      fileName: file.name
    };
  } catch (error) {
    console.error('❌ Error processing document:', error);
    return {
      success: false,
      error: error.message,
      summary: null
    };
  }
};

/**
 * Get document type based on file name and content
 * @param {string} fileName - Name of the file
 * @param {string} category - File category
 * @returns {string} - Document type
 */
export const getDocumentType = (fileName, category) => {
  const name = fileName.toLowerCase();
  
  if (name.includes('lab') || name.includes('test') || name.includes('result')) {
    return 'lab report';
  } else if (name.includes('prescription') || name.includes('rx') || name.includes('medication')) {
    return 'prescription';
  } else if (name.includes('scan') || name.includes('xray') || name.includes('mri') || name.includes('ct')) {
    return 'medical scan';
  } else if (name.includes('report') || name.includes('summary')) {
    return 'medical report';
  } else if (category === 'lab') {
    return 'lab report';
  } else if (category === 'prescription') {
    return 'prescription';
  } else if (category === 'imaging') {
    return 'medical scan';
  } else {
    return 'medical document';
  }
};
