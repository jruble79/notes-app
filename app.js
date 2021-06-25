

// Pull existing notes from local storage. 
// If no preexisting notes, sets userNotes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

const newNoteButton = document.querySelector('nav ul li');
const closeModalButton = document.querySelector('#modal-footer li');
const textArea = document.querySelector('textarea');

function toggleModalDisplay() {
    
    const modal = document.getElementById('modal');

    if (modal.style.display == 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }

}

function countWords(text) {
    return text.match(/\w+/g).length;
}

function isBlank() {
    const regex = new RegExp(/^(\s+$)(.{0})/);
    return regex.test(note.text);
}

function addNote() {

    const text = textArea.value;
    const dateCreated = new Date();
    const note = {
        text,
        dateCreated,
        wordCount: countWords(textArea.value)
    }

    if (note.text !== '' && !isBlank()) {
        // Add note to top of notes array
        userNotes.push(note);
        // Save new note to local storage
        localStorage.setItem('notes', JSON.stringify(userNotes));
        // Add new note to display
        displayNote(note);
    } else {
        return;
    };

}

function displayNote(note) {

    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');    

    article.innerHTML = `
    <p>${note.text}</p>
    <p>${note.dateCreated}</p>
    `;
    section.prepend(article);
    
}

// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNote(note));
// Open modal window
newNoteButton.addEventListener('click', toggleModalDisplay);
// Save a new note and close modal window
closeModalButton.addEventListener('click', addNote);
closeModalButton.addEventListener('click', toggleModalDisplay);
// Count and display number of words as user types
textArea.addEventListener('input', () => {
    let wordCount = document.getElementById('wordcount');
    wordCount.innerHTML = 'Words:' + ' ' + countWords(textArea.value);
});

