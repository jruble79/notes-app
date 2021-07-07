# Jeff Ruble's Final Project
For Code Louisville's 2021 JavaScript course
***
## Project Description
This is a single-page, browser-based notes app utilizing vanilla JavaScript. It currently stores data to the user's local storage.
***
### Feature Requirements
1. Create a form and save the values to an external file.
    - When a user selects "New Note" an object containing initial values gets converted to JSON and stored to Local Storage.
    - These values get updated and saved with every new keystroke added to the note.
2. Create an array, dictionary or list, populate it with multiple values, retrieve at least one value, and use or display it in your application.
    - Color properties are stored as objects within an array inside theme objects.
    - On page load, a function called buildThemeDropdownMenu loops through the colorThemes array and dynamically builds the dropdown menu. 

        > This process allows for future themes to be built requiring no more additional programming beyond creating a new theme object.

    - The function setTheme loops through the colorThemes array and applies the values to :root in styles.css
3. Create and use a function that accepts two or more parameters, calculates or determines a new value based on those inputs, and returns a new value.
    - The function sortNotes accepts two values, method and order to caluate and display notes by date edited, created, ascending or descending.
4. Calculate and display data based on an external factor.
    - Notes utilize the Date object to store the creation and edit date.
    - This data is used to:
        - Calucate sort order
        - Display the date type back to the user
5. Analyze text and display information about it.
    - As a user types a note, the function countItems displays either the current word or character count.