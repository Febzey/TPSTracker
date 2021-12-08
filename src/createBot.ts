import mineflayer from "mineflayer";
import 'dotenv/config';

export default function startBot() {

    return new Promise(resolve => {

        const bot:mineflayer.Bot = mineflayer.createBot({
            host: process.env.host,
            username: process.env.username,
            auth: 'microsoft',
            port: parseInt(process.env.port),
            version: process.env.version
        })

        const timeout: ReturnType<typeof setTimeout> = setTimeout(() => {
            console.error("Mineflayer bot could not connect. Exiting.")
            process.exit(1);
        }, 40000)
        
        bot.on('login', () => {
            clearTimeout(timeout);
            resolve(bot);
        });




    });
}