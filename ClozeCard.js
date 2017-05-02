//require fs
var fs = require("fs");

module.exports = ClozeFlashCard;

//constructor for ClozeFlashcard
function ClozeFlashCard(text, cloze) {
	this.text = text;
	this.cloze = cloze;
	this.clozeDeleted = this.text.replace(this.cloze, '___');
	this.create = function() {
		var data = {
			text: this.text,
			cloze: this.cloze,
			clozeDeleted: this.clozeDeleted,
			type: "cloze"
		};
		//add card to log.txt
		fs.appendFile("log.txt", JSON.stringify(data) + ';', "utf8", function(error) {
			//if there is an error, log error
				if (error) {
					console.log(error);
				}
		});
	};
}