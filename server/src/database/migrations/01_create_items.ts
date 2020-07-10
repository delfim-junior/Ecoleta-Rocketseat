import Knex from 'knex'


export async function up(knex: Knex){
    //CREATE TABLE
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    })
}

export async function down(knex: Knex){
    //BACKWARD
    return knex.schema.dropTable('items')

}

