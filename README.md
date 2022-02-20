# GPT-AKI

When Humans use Akinator then majority of the time it correctly guesses the thing you are thinking about (Try yourself https://en.akinator.com/game). We can use this fact to investigate what the language model has learned about characters(fictional and non-fictional), animals and objects. My intuition is if akinator can't correctly guess the the thing your language model is "thinking" about then that means it has incorrectly answered some questions from akinator, however if akinator does correctly guess the thing then thats an indicator that the model understand what the thing is.

Currently i've just created a proof of concept in the form of a node scripts, which connects akinator api and OpenAIApi(eg. you can try gpt-neox or gpt-3). You manually change the game thematic which can be "characters", "animals", or "objects" and the word akinator should try to guess is whatever the variable called "guess" is set to. The answers from the model and the questions from akinator will be printed out in the console.

To use the script find your api key from either https://goose.ai/dashboard/apikeys or https://beta.openai.com/account/api-keys(you also have to change the model name if you want to use gpt-3) and add it to the field called "apiKey".

Then just run "node gpt-aki.js" (you might need to install some packages)
