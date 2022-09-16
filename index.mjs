import dotenv from 'dotenv'
import {Client, GatewayIntentBits, ActionRowBuilder, SelectMenuBuilder } from "discord.js";
import { registerCommands } from "./deploy-commands.mjs";
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel , AudioPlayerStatus, VoiceConnectionStatus } from '@discordjs/voice'
import { requestVoice } from "./clovavoice.mjs";
import { generateDependencyReport } from '@discordjs/voice';
import { voice_list , voice_info }from "./voice_list.mjs";

dotenv.config({path: '.env'});

var guild_data_map = {};
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ] 
});

function randomItem(array){
    return array[Math.floor(Math.random() * array.length)];
}

function joinVoiceBotToChannel(guild_id){

    let guild_data = guild_data_map[guild_id];

    const voice_channel = guild_data['voice_channel'];
    const voice_name = guild_data['voice_name'];

    // 보이스 채널 참가
    const voice_connection = joinVoiceChannel({
        channelId: voice_channel.id,
        guildId: voice_channel.guild.id,
        adapterCreator: voice_channel.guild.voiceAdapterCreator,
    });

    // 오디오 플레이어
    const audio_player = createAudioPlayer();
    audio_player.on(AudioPlayerStatus.Idle, () => { //음성 1개 재생 끝났을 시
        if(!processMessageQueue(guild_id)) { //다음 음성 재생
            console.log("queue empty, do pause");
            //메시지 큐 비어있다면
            audio_player.pause(); //오디오 플레이어 정지
        }
    });
    guild_data["audio_player"] = audio_player; //audio_player 정보 저장

    // 해당 보이스 채널의 봇은 생성한 오디오 플레이어 송출되게 
    voice_connection.subscribe(audio_player);
    voice_connection.on(VoiceConnectionStatus.Disconnected, () => {
        voice_channel.guild.members.me.setNickname('니버보이스');
    });
    voice_connection.on(VoiceConnectionStatus.Destroyed, () => {
        voice_channel.guild.members.me.setNickname('니버보이스');
    });

    //첫 인사말
    let hello_text_list = [
        "안녕하세요! 반갑습니다.",
        "안녕안녕! 난 "+voice_name+"라고해",
        "안녕하세요! 잘 부탁드려요!",
        "만나서 반가워요 제 이름은" + voice_name + "입니다.",
        voice_name + "님 여기 등장!",
        "안녕하세용? 제가 왔어요!",
        "여러분 반가습니다." + voice_name + " 봇이 왔습니다!",
        "안녕? 반가워",
    ];
    let hello_text = randomItem(hello_text_list);

    playTTS(guild_id, hello_text);
    voice_channel.guild.members.me.setNickname(voice_name);

}

function processMessageQueue(guild_id){

    let guild_data = guild_data_map[guild_id];

    let message_queue = guild_data['message_queue'];
    const audio_player = guild_data['audio_player']
    const voice_type = guild_data['voice_type']

    const text = message_queue.shift();
    if(text == undefined) return false;

    requestVoice(voice_type, text, (audio)=>{
        console.log(`request text: ${text}`)
        let resource = createAudioResource(audio, { inlineVolume: true });
        resource.volume.setVolume(0.5);
        audio_player.play(resource);
    });

    return true;
}

function playTTS(guild_id, text){
    let guild_data = guild_data_map[guild_id];
    if(guild_data == undefined) return;

    let message_queue = guild_data['message_queue'];
    message_queue.push(text);

    let audio_player = guild_data['audio_player'];

    if(audio_player.state.status == AudioPlayerStatus.Paused 
        || audio_player.state.status == AudioPlayerStatus.Idle){
        processMessageQueue(guild_id);
    }
}

/**  이벤트 등록  **/
//봇 실행됐을 시
client.once('ready', () => {
    console.log("Started Naver voice bot")
    client.user.setActivity("/니버보이스 | '메시지");

    registerCommands(process.env.DISCORD_BOT_TOKEN, process.env.CLIENT_ID, "918841117015941160");        
    registerCommands(process.env.DISCORD_BOT_TOKEN, process.env.CLIENT_ID, "726652673817837618");        
})

// 상호작용을 받으면 호출되는 함수
client.on('interactionCreate', async interaction => {
    try{    // Original: https://discordjs.guide/interactions/replying-to-slash-commands.html#receiving-interactions

        const guild_id = interaction.channel.guild.id;
        if(!guild_data_map.hasOwnProperty(guild_id)) guild_data_map[guild_id] = {};
        let guild_data = guild_data_map[guild_id];

        //커맨드 입력 시
        if (interaction.isCommand()){
            if (interaction.commandName === '니버보이스') {
                const voice_channel = interaction.options.getChannel("보이스채널");
                guild_data['voice_channel'] = voice_channel;

                const select_menu_voice_language = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select_menu_voice_language')
                            .setPlaceholder('언어를 선택해주세요.')
                            .addOptions(

                                Object.keys(voice_info).map( language => { 
                                    return {label: language, value: language, description: language + " 음성을 선택합니다."}
                                })

                            )
                    );
                await interaction.reply({components: [select_menu_voice_language]});
            } else if(interaction.commandName === '니버보이스종료'){
                let audio_player = guild_data['audio_player'];
                if(audio_player != undefined) audio_player.stop();

                let voice_connection = getVoiceConnection(guild_id);
                if(voice_connection != undefined 
                    && voice_connection.state.status != VoiceConnectionStatus.Destroyed
                    && voice_connection.state.status != VoiceConnectionStatus.Disconnected) {

                    console.log("disconnect voice bot")
                    voice_connection.disconnect();
                }

                if(guild_data_map.hasOwnProperty(guild_id)) delete guild_data_map[guild_id];

                await interaction.reply({content: "안녕히계세요~"});
            }
        }
    
        //선택 메뉴 아이템 선택 시
        if (interaction.isSelectMenu()){
            if(interaction.customId === 'select_menu_voice_language'){

                const selected_language = interaction.values[0];

                guild_data['language'] = selected_language;
                const voice_gender_map = voice_info[selected_language];

                const select_menu_voice_gender = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select_menu_voice_gender')
                            .setPlaceholder('성별을 선택해주세요.')
                            .addOptions(

                                Object.keys(voice_gender_map).map( gender => { 
                                    return {label: gender, value: gender, description: gender + " 목소리 목록입니다."}
                                })

                            )
                );
                await interaction.update({components: [select_menu_voice_gender]});

            } else if(interaction.customId === 'select_menu_voice_gender'){

                const selected_language = guild_data['language'];
                const selected_gender = interaction.values[0];

                guild_data['gender'] = selected_gender;
                const voice_name_map = voice_info[selected_language][selected_gender];

                const select_menu_voice_name = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select_menu_voice_name')
                            .setPlaceholder('목소리 유형을 선택해주세요.')
                            .addOptions(

                                Object.keys(voice_name_map).map( voice_name => { 
                                    return {label: voice_name, value: voice_name, description: voice_name + " 유형의 AI 목소리를 사용합니다."}
                                })

                            )
                );
                await interaction.update({components: [select_menu_voice_name]});

            } else if(interaction.customId === 'select_menu_voice_name'){

                const selected_voice_channel = guild_data['voice_channel'];
                const selected_language = guild_data['language'];
                const selected_gender = guild_data['gender'];
                const selected_voice_name = interaction.values[0];

                const selected_voice_type = voice_info[selected_language][selected_gender][selected_voice_name];
                guild_data['voice_name'] = selected_voice_name;
                guild_data['voice_type'] = selected_voice_type;
                guild_data['message_queue'] = []; //메시지 큐 초기화

                joinVoiceBotToChannel(guild_id);

                await interaction.update({content: `${selected_voice_name} 씨가 ${selected_voice_channel} 음성 채널에 입장하셨습니다~!`, components: []});

            }
        }
        
    }catch(ex){
        console.log(ex);
    }

});

// 메시지 수신 시
client.on('messageCreate', (message) =>{
    try{
        let content = message.content;
        let guild_id = message.channel.guild.id;
    
        if(content.startsWith("'")){
            let voice_connection = getVoiceConnection(guild_id);
            
            if(voice_connection != undefined){            
                playTTS(guild_id , content.substring(1));
            }
        }
    }catch(ex){
        console.log(ex);
    }
});


// 봇 활성화
client.login(process.env.DISCORD_BOT_TOKEN).then(function () {
    console.log("LOGIN SUCCESS.");
});