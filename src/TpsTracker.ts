import startBot from './createBot.js';
import connect from './database.js';
import TPS from './getTps.js';
import chalk from 'chalk';

//TODO: Get lowest tps and store it until another lowest tps is achieved.

//TODO: Create lowest recorded tps command

//TODO: bot restart, check if values exists, if not then restart them (database)

(async () => {

    const database: any = await connect();
    if (!database) return () => {
        console.error(chalk.red("Could not connect to the database"));
        console.error(chalk.red("Exiting...."));
        process.exit(1);
    }

    console.log(chalk.green("Connection made to database successfully."));



    const bot: any = await startBot();
    console.log(chalk.green("Mineflayer bot has logged in successfully."))


    bot.loadPlugin(TPS);


    const logTps = () => {
        if (process.uptime() / 60 < 1) return;
        console.log(bot.getTps(), " ", Date.now());
        database.query('INSERT INTO TPS (tps, time) VALUES (?,?)', [parseInt(bot.getTps()), Date.now()], (err: unknown) => {
            if (err) throw err;
        });
    };

    /**
     * Getting and storing TPS
     * every 4 minutes.
     */
    setInterval(() => {
        logTps();
    }, 4 * 60000)


    /**
     * Getting total player count
     * and storing it every 10 minutes.
     */
    setInterval(() => {

        const playerCount: number = Object.keys(bot.players).length;
        database.query('INSERT INTO playercount (count , time) VALUES (?,?)', [playerCount, Date.now()], (err: unknown) => {
            if (err) throw err;
        });

    }, 10 * 60000)

    bot.on('end' || 'kicked', () => {
        console.warn(chalk.yellow("Bot has ended. process will now exit."));
        process.exit(0);
    });

    let cooldown = new Set<string>();

    bot.on("chat", (user: string, msg: string) => {
        if (user === bot.username) return;
        if (msg === 'TPS'.toLocaleLowerCase()) {

            if (cooldown.has(bot.username)) {
                return bot.whisper(user, "Anti spam, wait 2 seconds.");
            };

            cooldown.add(bot.username);
            setTimeout(() => { cooldown.delete(bot.username) }, 2000)

            if (process.uptime() / 60 < 1) return bot.whisper(user, "TPS not calculated yet")
            return bot.whisper(user, `${bot.getTps()}`);

        }
    });

})();   