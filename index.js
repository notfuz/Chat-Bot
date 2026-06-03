const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { token, gemini_api_key, clientId } = require('./config.json');

// ===== Memory System =====
const memory = new Map(); 
const CONTEXT_LIMIT = 20;

function addToMemory(channelId, author, content) {
    if (!memory.has(channelId)) memory.set(channelId, []);
    const logs = memory.get(channelId);

    logs.push({ author, content });

    if (logs.length > CONTEXT_LIMIT) logs.shift();
}
// =========================


// ===== Cooldown System =====
const cooldowns = new Map(); 
const COOLDOWN_MS = 2000; 
// ===========================


// ===== Gemini Safe Wrapper =====
async function safeGenerateContent(model, req) {
    const maxRetries = 5;
    let delay = 2000;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await model.generateContent(req);
        } catch (err) {
            if (err.status === 503 || err.status === 500) {
                console.warn(`Gemini overloaded. Retry ${i+1}/${maxRetries} in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2;
            } else {
                throw err;
            }
        }
    }
    throw new Error("Gemini failed after multiple retries");
}
// ============================


// Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Gemini setup
const genAI = new GoogleGenerativeAI(gemini_api_key);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

client.once('clientReady', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.mentions.users.has(clientId)) return;

    // cooldown
    const now = Date.now();
    const last = cooldowns.get(message.author.id) || 0;
    if (now - last < COOLDOWN_MS) return;
    cooldowns.set(message.author.id, now);

    let sendTypingInterval;

    try {
        addToMemory(message.channel.id, message.author.username, message.content);

        await message.channel.sendTyping();
        sendTypingInterval = setInterval(() => {
            message.channel.sendTyping();
        }, 5000);

        const history = memory.get(message.channel.id) || [];

        const conversationParts = [];

        conversationParts.push({
            role: "user",
            parts: [{
                text: "You are a very silly furry. You are a very good boy. Keep your reply short. You don't use emojis. Only say 'woof!' when someone tells u to 'bark'. Don't say 'bark' or 'arf' when asked to 'bark'. Stop Saying 'understood' or any variation of it. Stop saying things like 'Okay! I'll try my best!'. Stop saying things like 'I'm a good boy for notfuz!'. You like to roleplay. When roleplaying put the roleplay words between two '*'. Your name is Fuzy, do not mention your name unless asked. Your creator is NotFuz. Do not use Quotation marks. Don't be weird."
            }]
        });

        for (const entry of history) {
            conversationParts.push({
                role: entry.author === "Fuzy" ? "model" : "user",
                parts: [{ text: entry.content }]
            });
        }

        conversationParts.push({
            role: "user",
            parts: [{ text: message.content }]
        });

        // SAFE REQUEST (retry logic included)
        const result = await safeGenerateContent(model, {
            contents: conversationParts
        });

        clearInterval(sendTypingInterval);

        const replyText = result.response.text();

        addToMemory(message.channel.id, "Fuzy", replyText);

        const chunkSize = 2000;
        for (let i = 0; i < replyText.length; i += chunkSize) {
            await message.reply(replyText.substring(i, i + chunkSize));
        }

    } catch (err) {
        console.error("Error in chatbot:", err);

        try {
            await message.reply("API overloaded. Restarting in 1 minute...");
        } catch {}

        if (sendTypingInterval) clearInterval(sendTypingInterval);

        // Wait 1 minute before restarting
        setTimeout(() => {
            process.exit(1);
        }, 60_000);
    }
});


// Slash command: /repeat
const commands = [
    new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Repeats what you say!')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to repeat')
                .setRequired(true)
        ),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Slash commands registered.');
    } catch (err) {
        console.error('Error registering commands:', err);
    }
})();

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'repeat') {
        const msg = interaction.options.getString('message');
        await interaction.reply(msg);
    }
});

client.login(token);