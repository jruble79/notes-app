
let notes = [];

function createNewNote() {

    const title = prompt('What do you want to call your note?');
    const text = prompt('What is your note?');
    const dateCreated = new Date();

    class Note {
        constructor(title, text, dateCreated) {
            this.title = title;
            this.text = text;
            this.dateCreated = dateCreated;
        }
    }

    // Add note to notes array
    notes.unshift(new Note(title, text, dateCreated));

    // Add new note to display
    displayNotes(new Note(title, text, dateCreated));
}

function displayNotes(note) {

    const section = document.querySelector('section');
    const article = document.createElement('article');    

    article.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.text}</p>
    `;
    section.prepend(article);
    
}