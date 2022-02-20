const { Aki } = require('aki-api');
const { Configuration, OpenAIApi } = require("openai");

/*
This function will change the question returned by akinator so it includes the name of the thing we want akinator to guess, this will
hopefully help the model in  answering the questions right.

Example: Is your character a real person? ----> Is Elon musk a real person?

Currently im using a simple heuristics where i'm replacing a part of the string with the name.
Depending on which game thematic is used ("character, animals, objects") some
of the questions will turn out to be grammatically incorrect.

Currently using the game thematic "character" works the best with this implementation
*/
function fixQuestion(question, guess, game_thematic){
    replace_with = {"character": `your character`, "animals": "your animal", "objects": "it"}
    return question.replace(replace_with[game_thematic], guess)
}



/*
This function will return the prompt that the model will be used to generate an answer.

initialPrompt: can be used to condition the model, for example I'm using the same string
used in the openai playground example "QnA".

replies: can be used to condition the model to "hopefully" return a string which matches,
the answers compatible with akinator. That is [Yes, No, Don't know, Probably, Probably not]


*/
function generatePrompt(question, initialPrompt = "", replies  = "" ){
    let prompt = initialPrompt + "Q:" + question + replies + "\n" + "A:"
  return prompt
}


const run = async () => {

    //OpenAI
    const configuration = new Configuration({
        basePath: 'https://api.goose.ai/v1',
        apiKey: "INSERT YOUR API KEY",
      });

      const openai = new OpenAIApi(configuration);
    console.log("\n############# START #############\n")

    //Akinator
    //character Daniel Radcliffe, Micheal Jackson
    //Animals supported: rainbowfish, humpback whale

    //Are these things inclueded in the PILE?
    let guess = " Micheal Jackson"


    //change this variable depending on the what "guess" is set to. Either character, animals, objects
    const game_thematic = "character"

    const regions = {"character": "en", "animals": "en_animals", "objects": "en_objects"}
    const region = regions[game_thematic];

    const print_steps = true;
    const childMode = false;
    const proxy = undefined;
    const aki = new Aki({ region, childMode, proxy });
    await aki.start();


    console.log(`\nGPT-3 is thinking about :${guess}\n`)

    // Get first question from Akinator
    let question = fixQuestion(aki.question, guess, game_thematic)
    let replies =" Answer by choosing one of the following alternatives: Yes, No, Don't know, Probably, Probably not."
    let initialPrompt = "I am a highly intelligent question answering bot. If you ask me a question that is rooted in truth, I will give you the answer.If you ask me a question that is nonsense, trickery, or has no clear answer, I will respond with \"Unknown\".\n"

    let prompt = generatePrompt(question,initialPrompt, replies)

    console.log(`\nExample of how the prompt will looklike:\n\n${prompt}\n`)

    //Categories replies from model
    let QnA = {'Yes':[], 'No':[], "Don't know":[], 'Probably':[], 'Probably not':[]}


    //Total GUESSES the model can do before ending the game
    const total_steps = 30

    //Not sure how the aki.progress works, but i expect it has to do with how confident akinator is in it's current guess
    const progress_threshold = 80


    //Stops when akinator is confident in its guess or when there are no more guesses.
    while (aki.progress <= progress_threshold && aki.currentStep < total_steps) {
        if (print_steps)
            console.log(`############# STEP ${aki.currentStep} #############`)
            console.log("progress:",aki.progress)

        const response = await openai.createCompletion("gpt-neo-20b", {
            prompt:  prompt ,
            temperature: 0,
            max_tokens: 5,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
            logprobs: 5,
            stop: ["\n"],
        });



        //Currently i'm just checking if the returned tokens contain yes or no, if not the answer will be set to "Don't know",
        //If the model is not confident in its predicition (decided by variable prob_threshold) the answer will also be set to "Don't know"

        //How confident the model needs to be to use the answer
        prob_threshold = 0.2

        returned_tokens = response.data.choices[0].logprobs.tokens
        returned_logprobs = response.data.choices[0].logprobs.token_logprobs

        answer = "Don't know"
        final_prob = -1

        for(let i = 0; i < returned_tokens.length; i++){
          prob = Math.exp(returned_logprobs[i])
          token = returned_tokens[i]
          if(token.toLowerCase().includes("yes") ){
            if (prob > prob_threshold){
              answer = "Yes"
              final_prob = prob
            }
            break
          }
          else if(token.toLowerCase().includes("no")){
            if (prob > prob_threshold){
              answer = "No"
              final_prob = prob
            }
            break;
          }
        }

        //Save answer and question
        QnA[answer].push(question)


        if (print_steps)
            console.log(question + "\n" + answer)
            console.log("Prob:",final_prob)

        //Send answer, get next question, and update the prompt accordningly
        await aki.step(answer);
        question = fixQuestion(aki.question, guess, game_thematic)
        prompt =  generatePrompt(question)
        }
        await aki.win();

        //Print guesses from akinator
        console.log("\n############# GUESSES #############\n")
        for(let i = 0; i < aki.answers.length; i++){
            console.log( aki.answers[i].name, ", Prob:", aki.answers[i].proba)
        }
        console.log('\nguessCount:', aki.guessCount);


        //Print the answers from that the model made
        console.log("\n############# QNA #############\n")
        console.log(QnA)
    }






    run().catch(console.error);
