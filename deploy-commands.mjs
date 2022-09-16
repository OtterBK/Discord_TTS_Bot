import {SlashCommandBuilder} from "@discordjs/builders";
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v10';
import { ChannelType } from "discord-api-types/v10";

//명령어 목록
const commands = [

    new SlashCommandBuilder()
    .setName('니버보이스')
    .setDescription('TTS 봇을 부릅니다.')
    .addChannelOption(option => 
        option
        .setName("보이스채널")
        .setDescription("봇을 부를 채널")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),

    new SlashCommandBuilder()
    .setName('니버보이스종료')
    .setDescription('TTS 봇을 종료합니다.')

].map(command => command.toJSON());

//명령어 등록하는 함수
export const registerCommands = (token, clientId, guildId) => {
    const rest = new REST({version: '10'}).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}