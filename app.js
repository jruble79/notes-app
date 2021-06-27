

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
const gridControl = document.getElementById('grid');
const themeControl = document.getElementById('theme-control');
const closeModalButton = document.querySelector('#modal-footer li');
const modal = document.getElementById('modal');
const trash = document.getElementById('trash');
let textArea = document.querySelector('textarea');
let foundIndex;
let thisNoteKey;

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
    
    textArea.textContent = note;

    if (modal.style.display == 'grid') {
        modal.style.display = 'none';
        location.reload()
    } else {
        modal.style.display = 'grid';
        // Auto save the note every second when modal window is open
        setInterval(saveNote, 1000);
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

    // function isBlank() {
    //     const regex = new RegExp(/^(\s+$)(.{0})/);
    //     return regex.test(note.noteContent.text);
    // }    

    userNotes.push(note);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    thisNoteKey = note.noteKey;
    getNote(thisNoteKey);
    return note;
}

function saveNote(note) {
    userNotes[foundIndex].noteContent.text = textArea.value;
    userNotes.push();
    localStorage.setItem('notes', JSON.stringify(userNotes));
}

function displayNotePreview(note) {

    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');    

    article.innerHTML = `
    <p>${note.noteKey}</p>
    <p>${note.noteContent.text}</p>
    <p>${note.noteContent.dateCreated}</p>
    `;
    section.prepend(article);
}

function getNote(key) {
    foundIndex = userNotes.findIndex(note => note.noteKey === key);
    return foundIndex;
}

function deleteNote() {
    userNotes.splice(foundIndex, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    toggleModalDisplay();
    location.reload();
}

function changeGrid() {
    const section = document.getElementById('usernotes-viewer');
    if (section.style.gridTemplateColumns == 'repeat(auto-fill, minmax(150px, 2fr))') {
        section.style.gridTemplateColumns = '1fr';
    } else {
        section.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 2fr))';
    }
}


// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNotePreview(note));

// Open modal window
newNoteButton.addEventListener('click', toggleModalDisplay);
newNoteButton.addEventListener('click', addNote);

// Close modal window
closeModalButton.addEventListener('click', toggleModalDisplay);

// Count and display number of words as user types
textArea.addEventListener('input', () => {
    let wordCount = document.getElementById('wordcount');
    wordCount.innerHTML = 'Words:' + ' ' + countWords(textArea.value);
});

// Change color theme
themeControl.addEventListener('click', changeColorTheme);

// Change grid display
gridControl.addEventListener('click', changeGrid);

// Open an existing note
const article = document.querySelectorAll('article'); 
article.forEach(article => article.addEventListener('click', () => {
    let thisNoteKey = article.querySelector('p').textContent;
    thisNoteKey = parseInt(thisNoteKey);
    getNote(thisNoteKey);
    toggleModalDisplay(userNotes[foundIndex].noteContent.text);
}
));

// Delete an existing note
trash.addEventListener('click', deleteNote);