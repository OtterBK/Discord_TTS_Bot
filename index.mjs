import dotenv from 'dotenv'
import {Client, GatewayIntentBits } from "discord.js";
import { registerCommands } from "./deploy-commands.mjs";
import { createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel , AudioPlayerStatus} from '@discordjs/voice'
import { requestVoice } from "./clovavoice.mjs";
import { generateDependencyReport } from '@discordjs/voice';
import voice_list from "./voice_list.mjs";

var audio_player_map = {

};

dotenv.config({path: '.env'});

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ] 
});

function randomItem(array){
    let cnt = Math.floor(Math.random() * array.length);
    return array[cnt];
}

/**  이벤트 등록  **/
//봇 실행됐을 시
client.once('ready', () => {
    console.log("Started Naver voice bot")
    client.user.setActivity("/니버보이스 | '메시지");

    registerCommands(process.env.DISCORD_BOT_TOKEN, process.env.CLIENT_ID, "918841117015941160");        
    registerCommands(process.env.DISCORD_BOT_TOKEN, process.env.CLIENT_ID, "726652673817837618");        
})

// 메시지를 받으면 호출되는 함수
client.on('interactionCreate', async interaction => {
    try{    // Original: https://discordjs.guide/interactions/replying-to-slash-commands.html#receiving-interactions
        if (!interaction.isCommand()) return;
    
        if (interaction.commandName === '니버보이스') {
            let voice_type = interaction.options.getString("목소리유형");
            if(voice_type == undefined) voice_type = process.env.VOICE_TYPE;
            let voice_channel = interaction.options.getChannel("보이스채널");
    
            process.env.VOICE_TYPE = voice_type;
    
            let voice_name = "니버보이스";
            voice_list.forEach(element => {
                if(element["value"] == voice_type){
                    voice_name = element["name"].split(" ")[0];
                }
            });

            interaction.guild.members.me.setNickname(voice_name);
            await interaction.reply(`${voice_name} 씨를 모셔옵니다~!\n아직 열 분밖에 섭외하지 못했어요. 금방 추가됩니다.`);
    
            // 보이스 채널 참가
            const voice_connection = joinVoiceChannel({
                channelId: voice_channel.id,
                guildId: voice_channel.guild.id,
                adapterCreator: voice_channel.guild.voiceAdapterCreator,
            });
    
            // 오디오 플레이어
            const audio_player = createAudioPlayer();
    
            // 해당 보이스 채널의 봇은 생성한 오디오 플레이어 송출되게 
            voice_connection.subscribe(audio_player);
    
            let guild_id = voice_channel.guild.id;
            audio_player_map[guild_id] = audio_player;
    
            let hello_text = [
                "안녕하세요! 반갑습니다.",
                "안녕안녕! 난 "+voice_name+"라고해",
                "안녕하세요! 잘 부탁드려요!",
                "만나서 반가워요",
                voice_name + "님 여기 등장!",
                "안녕하세용? 제가 왔어요!",
                "여러분 반가습니다." + voice_name + "이라고 합니다!",
                "안녕?",
            ]

            requestVoice(randomItem(hello_text), (audio)=>{
                let resource = createAudioResource(audio, { inlineVolume: true });
                resource.volume.setVolume(0.5);
                audio_player.play(resource);
            });
    
        }
    }catch(ex){
        console.log(ex);
    }

});

client.on('messageCreate', (message) =>{
    try{
        let content = message.content;
        let guild_id = message.channel.guild.id;
    
        if(content.startsWith("'")){
            let voice_connection = getVoiceConnection(guild_id);
            
            if(voice_connection != undefined){
                let audio_player = audio_player_map[guild_id];
                
                requestVoice(content.substring(1), (audio)=>{
                    let resource = createAudioResource(audio, { inlineVolume: true });
                    resource.volume.setVolume(0.5);
                    audio_player.play(resource);
                });
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