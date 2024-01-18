const multer = require ("multer");
const path = require("path")


// determina la carpeta de destino dependiendo de la extensión del archivo
const destination = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    let folderPath;
    if (ext === ".jpg" || ext === ".jpeg") {
        folderPath = path.join(__dirname, '..', 'uploads', 'profileImage');
    } else if (ext === ".doc" || ext === ".docx") {
        folderPath = path.join(__dirname, '..', 'uploads', 'documents');
    } else if (ext === ".pdf") {
        folderPath = path.join(__dirname, '..', 'uploads', 'identification');
    } else {
        cb(new Error("Error en la carga del archivo, verifica e intenta nuevamente el tipo de documento a cargar"));
        return;
    }


    cb(null, folderPath);
};



const storage = multer.diskStorage({
    destination: destination,
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${timestamp}${ext}`);
    },
});

// Configuración de multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite de 5MB, ajusta según tus necesidades
    fileFilter: (req, file, cb) => {
        // Verificar la extensión del archivo permitida
        const extname = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".doc", ".docx"];
        
        if (allowedExtensions.includes(extname)) {
          return cb(null, true);
        } else {
          return cb(new Error("Solo se permiten archivos PDF, DOC, DOCX, JPG y JPEG"));
        }
    },
});
  
module.exports = { upload };