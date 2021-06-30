

const newNoteButton = document.querySelector('nav ul li');
const gridControl = document.getElementById('grid');
const themeControl = document.getElementById('theme-control');
const closeModalButton = document.querySelector('#modal-footer li');
const modal = document.getElementById('modal');
const trash = document.getElementById('trash');
const sortBy = document.getElementById('sort');
let textArea = document.querySelector('textarea');
let index;
let thisNoteKey;

let root = document.documentElement;

// Sets initial state of modal display
modal.style.display = 'none';

// Pull existing notes from local storage. 
// If no preexisting notes, sets userNotes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

// Sort notes by edited date on page load
userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited);
sortBy.textContent = 'Sort: Date Edited (Descending)';

// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNotePreview(note));

const colorThemes = [

    {
        themeName: 'Light',
        mainTextColor: 'rgb(0, 0, 0)',
        mainBackgroundColor: 'rgb(255, 255, 255)',
        mainNotesColor: 'rgb(255, 232, 132)',
    },
    {
        themeName: 'Dark',
        mainTextColor: 'rgb(255, 255, 255)',
        mainBackgroundColor: 'rgb(0, 0, 0)',
        mainNotesColor: 'rgb(75, 75, 75)',    
    }

];


function changeColorTheme() {
    if (this.textContent.includes(colorThemes[0].themeName)) {
        root.style.setProperty('--main-text-color', colorThemes[1].mainTextColor);
        root.style.setProperty('--main-background-color', colorThemes[1].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorThemes[1].mainNotesColor);
        themeControl.textContent = `Theme: ${colorThemes[1].themeName}`;
    } else {
        root.style.setProperty('--main-text-color', colorThemes[0].mainTextColor);
        root.style.setProperty('--main-background-color', colorThemes[0].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorThemes[0].mainNotesColor);
        themeControl.textContent = `Theme: ${colorThemes[0].themeName}`;
    }
}

function toggleModalDisplay() {
    
    if (modal.style.display == 'grid') {
        modal.style.display = 'none';
        // refresh();
        sortNotes();
    } else {
        modal.style.display = 'grid';
        textArea.value = userNotes[index].noteContent.text; // Sets text area to content of note
        let countedWords = document.getElementById('wordcount');
        countedWords.innerHTML = 'Words:' + ' ' + userNotes[index].noteContent.wordCount;
    }
}

function countWords(text) {
    return text.match(/\w+/g).length;
}

function createNewNote() {

    const note = {
        noteKey: Date.now(),
        noteContent: {
            text: null,
            dateCreated: Date.now(),
            dateEdited: null,
            wordCount: 0
        }
    };

    userNotes.push(note);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    thisNoteKey = note.noteKey;
    getNote(thisNoteKey);
}

function saveNote() {
    const thisNote = userNotes[index].noteContent;
    thisNote.text = textArea.value;
    thisNote.dateEdited = Date.now();
    thisNote.wordCount = countWords(textArea.value);
    userNotes.push();
    localStorage.setItem('notes', JSON.stringify(userNotes));
}

// Create article element containing note information
// Add event handler on article element
// Inserts article element into the usernotes-viewer section
function displayNotePreview(note) {

    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');

    article.innerHTML = `
    <p>${note.noteKey}</p>
    <p>${note.noteContent.text}</p>
    `;

    article.addEventListener('click', () => {
        let thisNoteKey = article.querySelector('p').textContent;
        thisNoteKey = parseInt(thisNoteKey);
        getNote(thisNoteKey); // returns index value of this note
        toggleModalDisplay();
    }
    );

    section.prepend(article);

}

// Performs a find on the userNotes array to find index value of
// object containing the supplied noteKey provided by displayNotePreview
function getNote(key) {
    index = userNotes.findIndex(note => note.noteKey === key);
    return index;
}

function deleteNote() {
    userNotes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    toggleModalDisplay();
}

function changeGrid() {
    const section = document.getElementById('usernotes-viewer');
    if (section.style.gridTemplateColumns == 'repeat(auto-fill, minmax(150px, 2fr))') {
        section.style.gridTemplateColumns = '1fr';
    } else {
        section.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 2fr))';
    }
}

function sortNotes() {

    let sortingLabel = sortBy.textContent;
    if (sortingLabel.includes('Date Edited (Descending)')) {
        userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited).reverse();
        sortBy.textContent = 'Sort: Date Edited (Ascending)';
    } else if (sortingLabel.includes('Sort: Date Edited (Ascending)')) {
        userNotes.sort((a, b) => a.noteContent.dateCreated - b.noteContent.dateCreated);
        sortBy.textContent = 'Sort: Date Created (Descending)';
    } else if (sortingLabel.includes('Sort: Date Created (Descending)')) {
        userNotes.sort((a, b) => a.noteContent.dateCreated - b.noteContent.dateCreated).reverse();
        sortBy.textContent = 'Sort: Date Created (Ascending)';
    } else if (sortingLabel.includes('Sort: Date Created (Ascending)')) {
        userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited);
        sortBy.textContent = 'Sort: Date Edited (Descending)';
    }

    // Save newly re-ordered array to Local Storage
    localStorage.setItem('notes', JSON.stringify(userNotes));
    refresh();  

}

// Refresh user-notes viewer content
function refresh() {
    const section = document.getElementById('usernotes-viewer');
    section.innerHTML = '';
    userNotes.forEach(note => displayNotePreview(note));
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Event Listeners
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


// Open modal window
newNoteButton.addEventListener('click', createNewNote);
newNoteButton.addEventListener('click', toggleModalDisplay);

// Close modal window
closeModalButton.addEventListener('click', toggleModalDisplay);

// Count and display number of words as user types
textArea.addEventListener('input', () => {
    let wordCount = document.getElementById('wordcount');
    wordCount.innerHTML = 'Words:' + ' ' + countWords(textArea.value);
});

// Save the note with every character stroke
textArea.addEventListener('input', saveNote);

// Change color theme
themeControl.addEventListener('click', changeColorTheme);

// Change grid display
gridControl.addEventListener('click', changeGrid);

// Delete an existing note
trash.addEventListener('click', deleteNote);

// Sort the notes by creation date and edit date
sortBy.addEventListener('click', sortNotes);