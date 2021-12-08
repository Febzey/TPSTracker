import startBot from './createBot.js';
import connect from './database.js';
import TPS from './getTps.js';

(async () => {

    const database:any = await connect();

    if (!database) return () => {
        console.error("Could not connect to the database");
        return process.exit(1);
    }

    console.log(database);

    const bot:any = await startBot();
    if (!bot) return;

    bot.loadPlugin(TPS);



    console.log("Mineflayer bot has logged in successfully.")

    bot.on("chat", (user,msg)=>{
        if(user === bot.username) return;
        if(msg === 'tps') {
            bot.chat(`${bot.getTps()}`)
        }
    })

})();   