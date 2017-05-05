var inquirer = require("inquirer");
var library = require("./cardLibrary.json");
var BasicCard = require("./BasicCard.js")
var ClozeCard = require("./ClozeCard.js")
var colors = require('colors');
var fs = require("fs");

var libCard;
var playedCard;
var count = 0;

//initially give option to the user to Create new flashcards or use exiting ones.
function openMenu() {
//use inquirer to ask question    
  inquirer.prompt([                                                         
      {
//type list gives user a list of options        
          type: "list", 
//message shown to the user                                                             
          message: "\nPlease choose a menu option from the list below?",
//options that show in list             
          choices: ["Create New Card", "Use Existing Cards", "Exit"],   
//refrence name of object          
          name: "menuOptions"                                               
      }
//Once inquirer gets answer then...      
  ]).then(function (answer) {                                               
    

    switch (answer.menuOptions) {

        case 'Create New Card':
            console.log("Make a new flashcards");
                createCard();
            break;

        case 'Use Existing Cards':
            console.log("Use flashcards on file");
                askQuestions();
            break;
        

        case 'Exit':
            console.log("Thank you for using the Disney Flashcard-Generator")
            return;
            break;

        default:
            console.log("");
            console.log("Sorry I don't understand");
            console.log("");
    }

  });

}

openMenu();
//If the choice is to create a card then this function will run
function createCard() {
    inquirer.prompt([
        {
            type: "list",
            message: "What type of flashcard do you want to make?",
            choices: ["Basic Card", "Cloze Card"],
            name: "cardType"
        }

    ]).then(function (appData) {
//the variable cardType will store the choice from the name: cardType object.
        var cardType = appData.cardType;            
        console.log(cardType);                      

        if (cardType === "Basic Card") {
            inquirer.prompt([
                {
                    type: "input",
                    message: "Front of your card (Your Question).",
                    name: "front"
                },
                {
                    type: "input",
                    message: "Back of your card (Your Answer).",
                    name: "back"
                }

            ]).then(function (cardData) {
//cardobject with front and back info
                var cardObject = {                     
                    type: "BasicCard",
                    front: cardData.front,
                    back: cardData.back
                };
//push the new card into the array of cards                
                library.push(cardObject);
//write the updated array to the carLibrary.json file                               
                fs.writeFile("cardLibrary.json", JSON.stringify(library, null, 2)); 

//use inquirer to ask if the user wants to keep making cards
                inquirer.prompt([                   
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }
//once the user gives answer....
                ]).then(function (appData) {                
                    if (appData.anotherCard === "Yes") {    
                        createCard();                       
                    } else {                                
                        openMenu();         
                    }
                });
            });
//Else (if the answer isn't Basic it had to be Cloze)
        } else {                        
            inquirer.prompt([
                {
                    type: "input",
                    message: "Write full text of your statement.",
                    name: "text"
                },
                {
                    type: "input",
                    message: "Remove part of sentence you want to cloze out, (replacing with '...'.)",
                    name: "cloze"
                }
            ]).then(function (cardData) {            

                var cardObject = {                     
                    type: "ClozeCard",
                    text: cardData.text,
                    cloze: cardData.cloze
                };
                if (cardObject.text.indexOf(cardObject.cloze) !== -1) {   
//push the new card into Library                   
                    library.push(cardObject);                          
//write the updated array to the cardLibrary                    
                    fs.writeFile("cardLibrary.json", JSON.stringify(library, null, 2)); 
                } else {                                            
                    console.log("The cloze must match word or words in the sentence.");
                }
//use inquirer to ask if the user wants to make another card
                inquirer.prompt([                   
                    {
                        type: "list",
                        message: "Do you want to make another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function(appData) {                
                    if (appData.anotherCard === "Yes") {    
                        createCard();                       
                    } else {                                
                        openMenu();     
                    }
                });
            });
        }

    });
};

//function used to get the questions from the cardLbrary that are already existing 
function getQuestion(card) {
    if (card.type === "BasicCard") {                        
//libCard becomes a new card of BasicCard constuctor 
        libCard = new BasicCard(card.front, card.back);   
        return libCard.front; 
    } else if (card.type === "ClozeCard") { 
//libCard becomes a new card of ClozeCard constuctor                    
        libCard = new ClozeCard(card.text, card.cloze)         
        return libCard.clozeRemoved();                    
    }
};

//function to ask questions from all stored card in the library
function askQuestions() {
//if current count (starts at 0) is less than the number of cards in the library....    
    if (count < library.length) {                    
        playedCard = getQuestion(library[count]);   
        inquirer.prompt([                           
            {
                type: "input",
                message: playedCard,
                name: "question"
            }           
        ]).then(function(answer) {                 
//if the users answer equals .back or .cloze show message
            if (answer.question === library[count].back || answer.question === library[count].cloze) {
                console.log(colors.blue("You are correct!!"));
            } else {
//checks if current card is Cloze or Basic
                if (libCard.front !== undefined) { 
                    console.log(colors.magenta("Sorry, the correct answer is ") + library[count].back + "."); 
                } else {                   
                    console.log(colors.magenta("Sorry, the correct answer is ") + library[count].cloze + ".");
                }
            }          
            count++; 
//recursion call the function within the function to keep it running. 
            askQuestions(); 
        });
    } else {
//reset counter to 0 once loop ends        
        count=0;
        openMenu();        
    }
};