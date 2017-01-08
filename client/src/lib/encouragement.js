const encouragements = ["Nice Job! 🎇"," Way to go! ✨"," Wow"," So good! 💖"," Bravo! 👏"," You rock! 🚀"," Well done! 🎉"," I see what you did there! 🙏"," Genius work! 🍩"," Thumbs up! 👍"," Coding win! 🍸"," FTW! ⚡️"," Yep! 🙆"," Nnnnnnnailed it! ✌"];

export default function getEncouragement() {
	return encouragements[Math.floor(Math.random() * encouragements.length)];
}
