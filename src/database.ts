import 'dotenv/config';
import { createPool } from 'mysql';
const connect = () => {
    return new Promise(resolve => {

        const database = createPool({
            host: process.env.dbHost,
            user: process.env.dbUser,
            password: process.env.dbPass,
            database: process.env.DbDatabase
        })

        database.getConnection((error: unknown) => {
            if (error) {
                resolve(false);
            }

            resolve(database);
        })


    })
}

export default connect;