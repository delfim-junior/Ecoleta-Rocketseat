import { Request, Response } from 'express'
import knex from '../database/connection'

class ItemsController {
    async index(req: Request, res: Response) {

        const items = await knex('items').select('*')

        //Transform the data to be more acessible by the frontEnd
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://localhost:8000/uploads/${item.image}`
            }
        })

        return res.json(serializedItems)

    }
}

export default ItemsController;