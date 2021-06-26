

// Pull existing notes from local storage. 
// If no preexisting notes, sets userNotes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

const colorTheme = [

    {
        themeName: 'Light',
        mainTextColor: 'rgb(0, 0, 0)',
        mainBackgroundColor: 'rgb(255, 255, 255)',
        mainNotesColor: 'rgb(211, 211, 211)',
    },
    {
        themeName: 'Dark',
        mainTextColor: 'rgb(255, 255, 255)',
        mainBackgroundColor: 'rgb(0, 0, 0)',
        mainNotesColor: 'rgb(75, 75, 75)',    
    }

];

const newNoteButton = document.querySelector('nav ul li');
const themeControl = document.getElementById('theme-control');
const closeModalButton = document.querySelector('#modal-footer li');
const trash = document.getElementById('trash');
let textArea = document.querySelector('textarea');
// let foundNote;
let foundIndex;

let root = document.documentElement;

function changeColorTheme() {
    if (this.textContent.includes(colorTheme[0].themeName)) {
        root.style.setProperty('--main-text-color', colorTheme[1].mainTextColor);
        root.style.setProperty('--main-background-color', colorTheme[1].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorTheme[1].mainNotesColor);
        themeControl.textContent = `Theme: ${colorTheme[1].themeName}`;
    } else {
        root.style.setProperty('--main-text-color', colorTheme[0].mainTextColor);
        root.style.setProperty('--main-background-color', colorTheme[0].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorTheme[0].mainNotesColor);
        themeControl.textContent = `Theme: ${colorTheme[0].themeName}`;
    }
}

function toggleModalDisplay(note) {
    
    const modal = document.getElementById('modal');
    textArea.textContent = note;

    if (modal.style.display == 'grid') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'grid';
    }

}

function countWords(text) {
    return text.match(/\w+/g).length;
}

function addNote() {

    const note = {
        noteKey: Date.now(),
        noteContent: {
            text: textArea.value,
            dateCreated: Date(),
            wordCount: countWords(textArea.value)
        }
    };

    function isBlank() {
        const regex = new RegExp(/^(\s+$)(.{0})/);
        return regex.test(note.noteContent.text);
    }    

    if (note.noteContent.text !== '' && !isBlank()) {
        // Add note to top of notes array
        userNotes.push(note);
        // Save new note to local storage
        localStorage.setItem('notes', JSON.stringify(userNotes));
        // Add new note to display
        displayNote(note);
        // Force page refresh 
        location.reload();
    } else {
        return;
    };

}

function displayNote(note) {

    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');    

    article.innerHTML = `
    <p>${note.noteKey}</p>
    <p>${note.noteContent.text}</p>
    <p>${note.noteContent.dateCreated}</p>
    `;
    section.prepend(article);
    
}

function getNote() {
    let thisNoteKey = this.querySelector('p').textContent;
    thisNoteKey = parseInt(thisNoteKey);
    // foundNote = userNotes.find(note => note.noteKey === thisNoteKey);
    foundIndex = userNotes.findIndex(note => note.noteKey === thisNoteKey);
    toggleModalDisplay(userNotes[foundIndex].noteContent.text);
}

function deleteNote() {
    userNotes.splice(foundIndex, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    toggleModalDisplay();
    location.reload();
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
// Change color theme
themeControl.addEventListener('click', changeColorTheme);
// Open an existing note
const article = document.querySelectorAll('article'); 
article.forEach(note => note.addEventListener('click', getNote));
// Delete an existing note
trash.addEventListener('click', deleteNote);