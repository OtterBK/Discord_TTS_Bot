import fetch from 'node-fetch'

export const requestTranslation = (request_text, target_language, callback, source_language='ko') => {
    // const api_url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation'; //클라우드 플랫폼용
    const api_url = 'https://openapi.naver.com/v1/papago/n2mt'; //무료용
    fetch(api_url,
    {
        method: "POST",
        headers: {  //무료용
            'X-Naver-Client-Id': process.env.PAPAGO_CLIENT_ID, 
            'X-Naver-Client-Secret': process.env.PAPAGO_CLIENT_SECRET,
        },
        // headers: {  //클라우드 플랫폼용
        //     'X-NCP-APIGW-API-KEY-ID': process.env.PAPAGO_CLIENT_ID, 
        //     'X-NCP-APIGW-API-KEY': process.env.PAPAGO_CLIENT_SECRET,
        // },
        body: new URLSearchParams({   
            source: source_language,
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