const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (!message.guild || message.author.bot) return;

        let words = ["nigger", "nigga", "coon", "faggot", "fagot", "https://", "discord.gg/", ".gg/", ".com", ".net",".au"];

        let foundInText = false;

        for (let i in words) {
            if (message.content.toLowerCase().includes(words[i].toLowerCase())) foundInText = true;
        }

        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const botMention = `<@&1142529120098586725>`;
        const dayOfWeek = days[now.getUTCDay()];
        const month = months[now.getUTCMonth()];
        const dayOfMonth = now.getUTCDate();
        const year = now.getUTCFullYear();
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        const seconds = now.getUTCSeconds().toString().padStart(2, '0');

        const logEmbed = new EmbedBuilder()
            .setTitle(`Dreadlands Moderation System`)
            .setColor('Red')
            .setThumbnail('https://t3.gstatic.com/licensed-image?q=tbn:ANd9GcTHsK1ZoItA_jI8Qsh_g-KScUGYtHjh5MqFuQGjFQAXyKD8UYneQToPyqYOgGzQWnbl')
            .addFields({
                name: '🙋‍♂️ **From**',
                value: `${message.author}`,
                inline: false,
            },
            {
                name: '🙋‍♂️ **alet**',
                value: `<@&1142529120098586725>`,
                inline: false,
            },
            {
                name: '📜 **Message**',
                value: `${message.content}`,
                inline: true,
            },
            {
                name: '🕓 Date',
                value: `${dayOfWeek} ${month} ${dayOfMonth} ${hours}:${minutes}:${seconds} ${year}`,
                inline: true,
            });

        const logChannel = message.guild.channels.cache.get('1235742550535573565');

        if (foundInText) {
            logChannel.send({ embeds: [logEmbed] });
        };

        const embed = new EmbedBuilder()
            .setTitle(`Dreadlands Moderation System`)
            .setColor('Red')
            .setTimestamp()
            .setThumbnail('https://t3.gstatic.com/licensed-image?q=tbn:ANd9GcTHsK1ZoItA_jI8Qsh_g-KScUGYtHjh5MqFuQGjFQAXyKD8UYneQToPyqYOgGzQWnbl')
            .setDescription(`${message.author},<@&1142529120098586725>, your message has been detected by our auto moderation system for being against our server rules. This situation will be undergoing further investigation.`);

        if (foundInText) {
            message.delete();
            message.channel.send({ embeds: [embed] });
        }
    }
}