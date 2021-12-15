import startBot from './createBot.js';
import connect from './database.js';
import TPS from './getTps.js';
import chalk from 'chalk';

const notConnected = (string: string) => console.error(chalk.red(`Database is not connected. Tried to log: ${string}`));
(async () => {

    let database: any = await connect();
    if (!database) return console.error(chalk.red("Could not connect to the database, Exiting....")), database = false;


    console.log(chalk.green("Connection made to database successfully."));

    const bot: any = await startBot();
    console.log(chalk.green("Mineflayer bot has logged in successfully."))
    bot.loadPlugin(TPS);

    /**
     * Getting and storing TPS
     * every 5 minutes.
     */
    setInterval(() => {
        if (!database) return notConnected("TPS");
        console.log(bot.getTps(), " ", Date.now());
        database.query('INSERT INTO Tps (tps, time) VALUES (?,?)', [parseInt(bot.getTps()), Date.now()], (err: unknown) => {
            if (err) throw err;
        });
    }, 5 * 60000);

    /**
     * Getting total player count
     * and storing it every 20 minutes.
     */
    setInterval(() => {
        if (!database) return notConnected("Player Count");
        const playerCount: number = Object.keys(bot.players).length;
        database.query('INSERT INTO Playercount (count , time) VALUES (?,?)', [playerCount, Date.now()], (err: unknown) => {
            if (err) throw err;
        });

    }, 20 * 60000);

    let cooldown = new Set<string>();
    let tps: [number, number][] = [];

    const min = () => tps.reduce((m, c) => c[0] < m[0] ? c : m, tps[0]);

    setInterval(async () => {
        if (process.uptime() / 60 < 1) return;
        tps.push([bot.getTps(), Date.now()]);
    }, 1000);

    bot.on("chat", (user: string, msg: string) => {
        if (user === bot.username) return;
        if (msg === 'tps') {
            if (cooldown.has(bot.username)) return bot.whisper(user, "Anti spam, wait 2 seconds.");
            cooldown.add(bot.username);
            setTimeout(() => { cooldown.delete(bot.username) }, 2000)
            if (process.uptime() / 60 < 1) return bot.whisper(user, "TPS not calculated yet");
            const TPS = min().toString().split(",");
            let Tps = parseInt(TPS[0]) !== 20 ? `Lowest Recorded: ${TPS[0]} at ${new Date(parseInt(TPS[1])).toLocaleTimeString("en-US")} CDT` : " ";
            return bot.whisper(user, `TPS: ${bot.getTps()} | ${Tps}`);
        }

        if (msg === '!tps') {
            if (cooldown.has(bot.username)) return bot.whisper(user, "Anti spam, wait 2 seconds.");
            cooldown.add(bot.username);
            setTimeout(() => { cooldown.delete(bot.username) }, 2000)
            if (process.uptime() / 60 < 1) return bot.whisper(user, "TPS not calculated yet");
            const TPS = min().toString().split(",");
            let Tps = parseInt(TPS[0]) !== 20 ? `Lowest Recorded: ${TPS[0]} at ${new Date(parseInt(TPS[1])).toLocaleTimeString("en-US")} CDT` : " ";
            return bot.chat(`TPS: ${bot.getTps()} | ${Tps}`);
        }

    });
    const exit = () => { console.warn("Bot has ended. Exiting..."); process.exit(1) };
    bot.on('end' || 'kicked', exit);
})();   