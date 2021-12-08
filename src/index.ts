import startBot from './createBot.js';
import connect from './database.js';
import TPS from './getTps.js';
import chalk from 'chalk';

(async () => {

    const database:any = await connect();

    if (!database) return () => {
        console.error(chalk.red("Could not connect to the database"));
        console.error(chalk.red("Exiting...."));
        return process.exit(1);
    }
    console.log(chalk.green("Connection made to database successfully."));



    const bot:any = await startBot();
    console.log(chalk.green("Mineflayer bot has logged in successfully."))


    bot.loadPlugin(TPS);


    const logTps = async () => {
       if (process.uptime() / 60 < 1) return;
        console.log(bot.getTps(), " ", Date.now());
        database.query('INSERT INTO TPS (tps, time) VALUES (?,?)', [parseInt(bot.getTps()), Date.now()], (err:unknown) => {
            if (err) throw err;
        });
    };


    setInterval(() => {
        logTps();
    },60000)

    bot.on('end' || 'kicked', () => {
        console.warn(chalk.yellow("Bot has ended. process will now exit."));
        process.exit(0);
    });

    let cooldown = new Set();
    bot.on("chat", (user: string, msg: string)=>{
        if(user === bot.username) return;
        if(msg === 'TPS'.toLocaleLowerCase()) {
            
            if (cooldown.has(bot.username)) {
                bot.whisper(user, "Anti spam, wait 3 seconds.");
                return setTimeout(() => { cooldown.delete(bot.username) }, 3000)
            }

            cooldown.add(bot.username);
            
            if (process.uptime() / 60 < 1) return bot.whisper(user, "TPS not calculated yet")
            return bot.whisper(user, `${bot.getTps()}`);

        }
    });

})();   