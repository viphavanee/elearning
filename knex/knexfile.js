require("dotenv").config()
let IsProd = process.env.NODE_ENV === "production" ? true : false
console.log(`The app is running on : ${process.env.NODE_ENV === "production" ? "product" : "development"} mode.`)
const knex = require('knex')
module.exports = {
    elearning: knex({
        client: 'mysql2',
        connection: {
            host: IsProd ? process.env.PROD_MYSQL_HOST : process.env.DEV_MYSQL_HOST,
            user: IsProd ? process.env.PROD_MYSQL_USER : process.env.DEV_MYSQL_USER,
            port: IsProd ? parseInt(process.env.PROD_MYSQL_PORT) : parseInt(process.env.DEV_MYSQL_PORT),
            password: IsProd ? process.env.PROD_MYSQL_PASSWORD : process.env.DEV_MYSQL_PASSWORD,
            database: IsProd ? process.env.PROD_MYSQL_DATABASE : process.env.DEV_MYSQL_DATABASE
        }
    })
}
