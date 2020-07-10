import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
    async index(req: Request, res: Response){
        //Filtros:cidade, estado e items
        const { city, uf, items } = req.query

        const parseItems = String(items)
            .split(',')
            .map(item => Number(item.trim()))
        
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parseItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*')//Only points table data

        return res.json(points)
    }
    
    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsApp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;

        //Turning it into a transaction
        const trx = await knex.transaction();

        const point = {
            image: 'https://images.unsplash.com/photo-1581405784382-207abf7aeb95?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name,
            email,
            whatsApp,
            latitude,
            longitude,
            city,
            uf
        }
        //After an insertion it returns all IDs
        const insertedIds = await trx('points').insert(point);

        //Just to make it beautiful
        const point_id = insertedIds[0]
        
        const pointItems = items.map((item_id: number) => {
            return {
                point_id,
                item_id,
            }
        })

        await trx('point_items').insert(pointItems);

        await trx.commit()
        
        return res.json({ 
            id: point_id,
            ...point, })
    }

    async show(req: Request, res: Response) {
        const { id } = req.params
        
        //Withou the 'first' function it return an array
        const point = await knex('points').where('id', id).first()
        
        if(!point){
            return res.status(400).json({message: 'point not found'})
        }

        const items = await knex('items')
        .join('point_items','items.id','=','point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title')
        return res.json({point,items})
    }

    
}

export default PointsController;