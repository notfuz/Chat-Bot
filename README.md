# Chat Bot
This is an old source i made for my discord bot on my server which i recently found again after going through some old projects!

# How it works
Its simple! All you need is a Bot Token, a Bot ClientID and a Gemini API Key! If you have that GREAT! Place them inside of config.json! 
After that ull need to install node modules! im pretty sure ud know how to do that? right? well if u dont this is how 
First open a new terminal (in VSCode) ur gonna press **Ctrl + Shift + `** then type this EXACTLY into the new terminal: npm install 
Since this already has a package.json file itll install all the required packages for u into ur folder! 
after that ur gonna wanna run it! using: node index.js 
Or just use the already provided start.bat folder or restart.bat folder 
start.bat only starts the bot so later on if an error hapens ull need to manually restart it! 
restart.bat does that for u, when the bot gets and error it restarts the bot in about a minutes time (u can change that if u want too) 
Thats about all u need to know 

# Extra Info
When the bot is online and in ur discord all u have to do is ping him or reply to a message he sent! 
If u want u can change the AI api, i just used gemini cause it was free and im broker than a joke... 
Will require some rewriting tho 

# His personality
To find his personality to change it go to index.js and look for 
```js
conversationParts.push({
        role: "user",
            parts: [{
                text: "You are a very silly furry. You are a very good boy. Keep your reply short. You don't use emojis. Only say 'woof!' when someone tells u to 'bark'. Don't say 'bark' or 'arf' when asked to 'bark'. Stop Saying 'understood' or any variation of it. Stop saying things like 'Okay! I'll try my best!'. Stop saying things like 'I'm a good boy for notfuz!'. You like to roleplay. When roleplaying put the roleplay words between two '*'. Your name is Fuzy, do not mention your name unless asked. Your creator is NotFuz. Do not use Quotation marks. Don't be weird."
            }]
        });
```
at line 92 to 97 (line 95 to be more specific) 
there yal find his personality! Ull probs have to change it from mine cause it kinda messed up still... 
