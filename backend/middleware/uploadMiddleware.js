import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = './uploads';

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extensionName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (extensionName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, JPG, PNG, GIF, and WEBP image formats are allowed!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter
});

const sellerFileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|pdf/;
  const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only JPEG, JPG, PNG images and PDF documents are allowed!'));
  }
};

export const uploadSellerDocs = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: sellerFileFilter
}).fields([
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'cancelledCheque', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]);

const productUploadDir = './uploads/products';

if (!fs.existsSync(productUploadDir)) {
  fs.mkdirSync(productUploadDir, { recursive: true });
}

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique timestamp filename
    const cleanOrigName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '-');
    cb(null, Date.now() + '-' + cleanOrigName);
  }
});

const productImageFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp/;
  const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPEG, JPG, PNG, and WEBP formats are allowed!'));
  }
};

export const uploadProductImage = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: productImageFilter
});
