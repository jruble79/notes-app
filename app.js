
let notes = JSON.parse(localStorage.getItem('notes')) || [];

function addNote() {

    const title = prompt('What do you want to call your note?');
    const text = prompt('What is your note?');
    const dateCreated = new Date();
    const note = {
        title,
        text,
        dateCreated
    }

    // Add note to top of notes array
    notes.push(note);

    // Save new note to local storage
    localStorage.setItem('notes', JSON.stringify(notes));

    // Add new note to display
    displayNote(note);
}

function displayNote(note) {

    const section = document.querySelector('section');
    const article = document.createElement('article');    

    article.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.text}</p>
    `;
    section.prepend(article);
    
}

// Loads any preexisting notes from local storage
notes.forEach(note => displayNote(note));
