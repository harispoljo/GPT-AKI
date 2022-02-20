# GPT-AKI

Investigating if you can use Akinator to probe language model about their knowledge about things and people. My intuition is that if akinator can't guess the the thing your language model is "thinking" about then that means it has incorrectly answered the question from akinator.

Currently i've just created a proof of concept in the form of a node scripts, which connects akinator api and OpenAIApi (eg. gpt-neox or gpt-3).  You manually change the game_thematic and the word akinator should try to guess. The answers from the model and the questions from akinator will be printed out in the console.
