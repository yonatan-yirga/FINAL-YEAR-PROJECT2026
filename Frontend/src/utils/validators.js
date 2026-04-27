export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10,15}$/;
  return re.test(phone.replace(/[\s-]/g, ''));
};

export const validateFile = (file, maxSizeMB = 5) => {
  if (!file) return { valid: false, error: 'No file selected' };
  
  const maxSize = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` };
  }
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }
  
  return { valid: true };
};
