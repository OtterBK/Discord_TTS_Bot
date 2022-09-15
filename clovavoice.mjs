import fetch from 'node-fetch'

export const requestVoice = (request_text, callback) => {
    fetch('https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',
    {
        method: "POST",
        headers: { 
            'X-NCP-APIGW-API-KEY-ID': process.env.CLOVA_CLIENT_ID, 
            'X-NCP-APIGW-API-KEY': process.env.CLOVA_SECRET,
        },
        body: new URLSearchParams({   
            speaker: process.env.VOICE_TYPE, 
            volume: '0', 
            speed: '0', 
            pitch: '1', 
            text: request_text, 
            format: 'mp3' 
        }),
    })
    .then(response => response.body)
    .then(body => {
        callback(body);
    });
}