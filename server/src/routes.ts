import express from 'express';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsController';


const routes = express.Router()

const pointsController = new PointsController();
const itemsController = new ItemsController()


routes.get('/items', itemsController.index)
routes.post('/points', pointsController.create)

routes.get('/points', pointsController.index)
//Listar um ponto de colecta especifico
routes.get('/points/:id', pointsController.show)



//index - listagem
//show - exibir um unico registo
//create/store - criacao
//delete/destroy

export default routes;