import path from 'path'

//Knex unfortunatelly doesnt supports export default
module.exports = {
    client: 'sqlite3', //we need to install...
    connection: {
        filename: path.resolve(__dirname,'src','database','database.sqlite')
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    },

    useNullAsDefault: true,
};