const { AttachmentBuilder, ActionRowBuilder } = require('discord.js');
const {
  Client,
  PermissionsBitField,
  PermissionFlagsBits,
  GatewayIntentBits,
  ButtonBuilder, 
  ButtonStyle,
  Partials,
  Collection,
  EmbedBuilder,
  MessageManager,
  Embed,
  Events,
  Guild,
} = require("discord.js");
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;
const fs = require('fs');
const client = new Client({ intents: [ GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildIntegrations,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.AutoModerationConfiguration,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.AutoModerationExecution,], 
  partials: [
    Partials.GuildMember,
    Partials.Channel,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});
 

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(process.env.MONGODB_URI, { keepAlive: true });
      console.log('Connected to DB.');
  
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  })();

  (async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();
//suggestion

const suggestion = require('./Schemas.js/suggestionSchema'); 
const formatResults = require('./utilts/formatResults'); 

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.isButton) return;

    const data = await suggestion.findOne({ GuildID: interaction.guild.id, Msg: interaction.message.id });
    if (!data) return;
    const message = await interaction.channel.messages.fetch(data.Msg);

    if (interaction.customId == 'upv') {

        if (data.Upmembers.includes(interaction.user.id)) return await interaction.reply({content: `You cannot vote again! You have already sent an upvote on this suggestion.`, ephemeral: true});

        let Downvotes = data.downvotes;
        if (data.Downmembers.includes(interaction.user.id)) {
            Downvotes = Downvotes - 1;
        }

        if (data.Downmembers.includes(interaction.user.id)) {

            data.downvotes = data.downvotes - 1;
        }

        data.Upmembers.push(interaction.user.id);
        data.Downmembers.pull(interaction.user.id);
        
        const newEmbed = EmbedBuilder.from(message.embeds[0]).setFields({name: `Upvotes`, value: `> **${data.upvotes + 1}** Votes`, inline: true}, { name: `Downvotes`, value: `> **${Downvotes}** Votes`, inline: true}, {name: `Author`, value: `> <@${data.AuthorID}>`}, { name: `Votes`, value: formatResults(data.Upmembers, data.Downmembers)});

                const upvotebutton = new ButtonBuilder()
                .setCustomId('upv')
                .setEmoji('<:tup:1162598259626352652>')
                .setLabel('Upvote')
                .setStyle(ButtonStyle.Primary)

                const downvotebutton = new ButtonBuilder()
                .setCustomId('downv')
                .setEmoji('<:tdown:1162598331390889994>')
                .setLabel('Downvote')
                .setStyle(ButtonStyle.Primary)
        
                const totalvotesbutton = new ButtonBuilder()
                .setCustomId('totalvotes')
                .setEmoji('💭')
                .setLabel('Votes')
                .setStyle(ButtonStyle.Secondary)

                const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setLabel('Approve')
                    .setEmoji('<a:AUSC_checked:1011088709266985110>')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji('<a:rejected:1162622460835922043>')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                )
                
                await interaction.update({ embeds: [newEmbed], components: [btnrow, button2] });

                data.upvotes++;
                data.save();
    }

    if (interaction.customId == 'downv') {

        if (data.Downmembers.includes(interaction.user.id)) return await interaction.reply({ content: `You cannot vote again! You have already sent an downvote on this suggestion.`, ephemeral: true});

        let Upvotes = data.upvotes;
        if (data.Upmembers.includes(interaction.user.id)) {
            Upvotes = Upvotes - 1;
        }

        if (data.Upmembers.includes(interaction.user.id)) {

            data.upvotes = data.upvotes - 1;
        }

        data.Downmembers.push(interaction.user.id);
        data.Upmembers.pull(interaction.user.id);

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setFields({name: `Upvotes`, value: `> **${Upvotes}** Votes`, inline: true}, { name: `Downvotes`, value: `> **${data.downvotes + 1}** Votes`, inline: true}, {name: `Author`, value: `> <@${data.AuthorID}>`}, { name: `Votes`, value: formatResults(data.Upmembers, data.Downmembers)});

                const upvotebutton = new ButtonBuilder()
                .setCustomId('upv')
                .setEmoji('<:tup:1162598259626352652>')
                .setLabel('Upvote')
                .setStyle(ButtonStyle.Primary)

                const downvotebutton = new ButtonBuilder()
                .setCustomId('downv')
                .setEmoji('<:tdown:1162598331390889994>')
                .setLabel('Downvote')
                .setStyle(ButtonStyle.Primary)
        
                const totalvotesbutton = new ButtonBuilder()
                .setCustomId('totalvotes')
                .setEmoji('💭')
                .setLabel('Votes')
                .setStyle(ButtonStyle.Secondary)

                const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);

                const button2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('appr')
                    .setLabel('Approve')
                    .setEmoji('<a:AUSC_checked:1011088709266985110>')
                    .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                    .setCustomId('rej')
                    .setEmoji('<a:rejected:1162622460835922043>')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
                )
                
                await interaction.update({ embeds: [newEmbed], components: [btnrow, button2] });

                data.downvotes++;
                data.save();
    }

    if (interaction.customId == 'totalvotes') {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        let upvoters = [];
        await data.Upmembers.forEach(async member => {
            upvoters.push(`<@${member}>`)
        });

        let downvoters = [];
        await data.Downmembers.forEach(async member => {
            downvoters.push(`<@${member}>`)
        });

        const embed = new EmbedBuilder()
        .addFields({ name: `Upvoters (${upvoters.length})`, value: `> ${upvoters.join(', ').slice(0, 1020) || `No upvoters!`}`, inline: true})
        .addFields({ name: `Downvoters (${downvoters.length})`, value: `> ${downvoters.join(', ').slice(0, 1020) || `No downvoters!`}`, inline: true})
        .setColor('Random')
        .setTimestamp()
        .setFooter({ text: `💭 Vote Data`})
        .setAuthor({ name: `${interaction.guild.name}'s Suggestion System`})

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId == 'appr') {

        const upvotebutton = new ButtonBuilder()
        .setCustomId('upv')
        .setEmoji('<:tup:1162598259626352652>')
        .setLabel('Upvote')
        .setStyle(ButtonStyle.Primary)

        const downvotebutton = new ButtonBuilder()
        .setCustomId('downv')
        .setEmoji('<:tdown:1162598331390889994>')
        .setLabel('Downvote')
        .setStyle(ButtonStyle.Primary)
        
        const totalvotesbutton = new ButtonBuilder()
        .setCustomId('totalvotes')
        .setEmoji('💭')
        .setLabel('Votes')
        .setStyle(ButtonStyle.Secondary)

        upvotebutton.setDisabled(true);
        downvotebutton.setDisabled(true);

        const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);
        
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setColor('Green').addFields({ name: '\u200B', value: '<a:AUSC_checked:1011088709266985110> Your suggestion has been approved!'})

        await interaction.update({ embeds: [newEmbed], components: [btnrow] });
    }

    if (interaction.customId == 'rej') {

        const upvotebutton = new ButtonBuilder()
        .setCustomId('upv')
        .setEmoji('<:tup:1162598259626352652>')
        .setLabel('Upvote')
        .setStyle(ButtonStyle.Primary)

        const downvotebutton = new ButtonBuilder()
        .setCustomId('downv')
        .setEmoji('<:tdown:1162598331390889994>')
        .setLabel('Downvote')
        .setStyle(ButtonStyle.Primary)
        
        const totalvotesbutton = new ButtonBuilder()
        .setCustomId('totalvotes')
        .setEmoji('💭')
        .setLabel('Votes')
        .setStyle(ButtonStyle.Secondary)

        upvotebutton.setDisabled(true);
        downvotebutton.setDisabled(true);

        const btnrow = new ActionRowBuilder().addComponents(upvotebutton, downvotebutton, totalvotesbutton);
        
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return await interaction.reply({ content: `Only Admins & Staffs can use this button.`, ephemeral: true });

        const newEmbed = EmbedBuilder.from(message.embeds[0]).setColor('Red').addFields({ name: '\u200B', value: '<a:rejected:1162622460835922043> Your suggestion has been rejected!'})

        await interaction.update({ embeds: [newEmbed], components: [btnrow] });
    }       
})



/// ticket


















