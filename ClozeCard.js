//Constuctor function for the ClozeCard
function ClozeCard(text, cloze) {
	this.text = text.split(cloze);
	this.cloze = cloze;
};

//Constructor that creats a protype fo ClozeCard to return the question missing cloze
function ClozeCardProtype() {

	this.clozeRemoved = function() {
//templete literal enclosed by the back-tick (read about this on Slack seems to be working for now.)
		return `${this.text[0]} ... ${this.text[1]}`
	};
};

ClozeCard.prototype = new ClozeCardProtype();
module.exports = ClozeCard;