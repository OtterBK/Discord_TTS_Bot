import fetch from 'node-fetch'

export const requestTranslation = (request_text, target_language, callback) => {
    fetch('https://openapi.naver.com/v1/papago/n2mt',
    {
        method: "POST",
        headers: { 
            'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 
            'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET,
        },
        body: new URLSearchParams({   
            source: "ko",
            target: target_language,
            text: request_text
        }),
    })
    .then(response => response.json())
    .then(response_json => {
        if(response_json['message'] == undefined) return;

        let result_json = response_json['message']['result'];
        if(result_json == undefined) return;

        let translated_text = result_json['translatedText'];
        if(translated_text == undefined) return;
        
        callback(translated_text);
    });
}