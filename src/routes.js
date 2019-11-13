import { Router } from 'express';

// import de configurações
import multer from 'multer';
import multerConfig from './config/multer';

// import de controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';

// import de middlawares
import authMiddleware from './app/middleware/auth';

// constantes
const routes = new Router();
const upload = multer(multerConfig);

// rotas
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/providers', ProviderController.index);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
