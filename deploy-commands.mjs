import {SlashCommandBuilder} from "@discordjs/builders";
import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v10';
import { ChannelType } from "discord-api-types/v10";
import voice_list from "./voice_list.mjs";

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
    )
    .addStringOption(option => 
        option
        .setName("목소리유형")
            .setDescription("누구를 부를까요?")
            .setRequired(false)
            .addChoices(
                { value: 'nara', name: '아라 한국어, 여성' },
                { value: 'nminyoung', name: '민영 한국어, 여성' },
                { value: 'nyejin', name: '예진 한국어, 여성' },
                { value: 'mijin', name: '미진 한국어, 여성' },
                { value: 'njiyun', name: '지윤 한국어, 여성' },
                { value: 'nsujin', name: '수진 한국어, 여성' },
                { value: 'ngaram', name: '가람 한국어, 아동'},
                { value: 'ngoeun', name: '고은 한국어, 여성' },
                { value: 'nyujin', name: '유진 한국어, 여성' },
                { value: 'dara_ang', name: '아라(화남) 한국어, 여성' },
                { value: 'nsunhee', name: '선희 한국어, 여성' },
                { value: 'nminseo', name: '민서 한국어, 여성' },
                { value: 'njiwon', name: '지원 한국어, 여성' },
                { value: 'nbora', name: '보라 한국어, 여성' },
                { value: 'nes_c_hyeri', name: '혜리 한국어, 여성' },
                { value: 'nes_c_sohyun', name: '소현 한국어, 여성' },
                { value: 'nes_c_mikyung', name: '미경 한국어, 여성' },
                { value: 'ntiffany', name: '기서 한국어, 여성' },
                { value: 'neunseo', name: '은서 한국어, 여성' },
                { value: 'nyoungmi', name: '영미 한국어, 여성' },
                { value: 'nnarae', name: '나래 한국어, 여성' },
                { value: 'nyuna', name: '유나 한국어, 여성' },
                { value: 'nkyunglee', name: '경리 한국어, 여성' },
                { value: 'nminjeong', name: '민정 한국어, 여성' },
        )
    )

].map(command => command.toJSON());

//명령어 등록하는 함수
export const registerCommands = (token, clientId, guildId) => {
    const rest = new REST({version: '10'}).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}