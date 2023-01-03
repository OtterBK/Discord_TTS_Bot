import dotenv from 'dotenv'
dotenv.config({path: '.env'});

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const requestOpenAIAnswer = (prompt_text, callback) =>{

    const completion = openai.createCompletion({
        model:'text-davinci-003',
        prompt: prompt_text,
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1.0,
        best_of: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    })
      
    console.info('sending question...' + prompt_text);

    completion.then((r) =>{
        const answer = r.data.choices[0].text;
        console.log(`Open AI Answer: ${answer}`);
        callback(answer);
    })
};
