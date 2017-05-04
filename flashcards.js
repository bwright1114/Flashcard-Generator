const inquirer = require("inquirer");
const library = require("./cardLibrary.json");
const BasicCard = require("./BasicCard.js")
const ClozeCard = require("./ClozeCard.js")
const colors = require('colors');
const fs = require("fs");

var drawnCard;
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
//the variable cardType will store the choice from the cardType inquirer object.
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
//builds an object with front and back info
                var cardObj = {						
                    type: "BasicCard",
                    front: cardData.front,
                    back: cardData.back
                };
//push the new card into the array of cards                
                library.push(cardObj);
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

                var cardObj = {						
                    type: "ClozeCard",
                    text: cardData.text,
                    cloze: cardData.cloze
                };
                if (cardObj.text.indexOf(cardObj.cloze) !== -1) {   
//push the new card into the array of cards                    
                    library.push(cardObj);							
//write the updated array to the cardLibrary file                    
                    fs.writeFile("cardLibrary.json", JSON.stringify(library, null, 2)); 
                } else {											
                    console.log("The cloze must match word or words in the statement.");

                }
//use inquirer to ask if the user wants to keep making cards                
                inquirer.prompt([					
                    {
                        type: "list",
                        message: "Do you want to create another card?",
                        choices: ["Yes", "No"],
                        name: "anotherCard"
                    }

                ]).then(function (appData) {				
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

//function used to get the question from the drawnCard in the askQuestions function
function getQuestion(card) {
    if (card.type === "BasicCard") {						
//drawnCard becomes a new instance of BasicCard constuctor with its front and back passed in        
        drawnCard = new BasicCard(card.front, card.back);	
        return drawnCard.front;	
    } else if (card.type === "ClozeCard") {	
//drawnCard becomes a new instance of ClozeCard constuctor with its text and cloze passed in    				
        drawnCard = new ClozeCard(card.text, card.cloze)	
//Return the ClozeCard prototpe method clozeRemoved to show the question missing the cloze        
        return drawnCard.clozeRemoved();					
    }
};

//function to ask questions from all stored card in the library
function askQuestions() {
//if current count (starts at 0) is less than the number of cards in the library....    
    if (count < library.length) {
//playedCard stores the question from the card with index equal to the current counter.    					
        playedCard = getQuestion(library[count]);	
        inquirer.prompt([							
            {
                type: "input",
                message: playedCard,
                name: "question"
            }
//once the user answers            
        ]).then(function (answer) {					
//if the users answer equals .back or .cloze of the playedCard run a message "You are correct."
            if (answer.question === library[count].back || answer.question === library[count].cloze) {
                console.log(colors.blue("You are correct."));
            } else {
//check to see if current card is Cloze or Basic
                if (drawnCard.front !== undefined) { 
                    console.log(colors.magenta("Sorry, the correct answer was ") + library[count].back + "."); 
                } else { 
//grabs & shows correct answer                    
                    console.log(colors.magenta("Sorry, the correct answer was ") + library[count].cloze + ".");
                }
            }
//increase the counter for the next run through            
            count++; 
//recursion. call the function within the function to keep it running. It will stop when counter=library.length            		
            askQuestions(); 
        });
    } else {
//reset counter to 0 once loop ends        
      	count=0;

      	openMenu();			//call the menu for the user to continue using the app
    }
};

