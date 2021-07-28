# A simple notes app
For Code Louisville's 2021 JavaScript cohort.
***
## Project Description
This is a single-page, browser-based notes app utilizing vanilla JavaScript. It currently stores data to the user's local storage. Designed and developed by Jeff Ruble. Tested for Google Chrome.
***
### Feature Requirements
1. Read and parse an external file into your application and display some data from it.
    - Within the Actions menu, users can choose to import notes created through this app from their local environment.
        
        > To evaluate, import sample-notes.JSON from the documents folder in this repo.

2. Create a form and save the values to an external file.
    - From the Actions menu, users can export notes created through this app to their local environment.
3. Create an array and populate it with multiple values, retrieve at least one value, and use or display it.
    - Color properties are stored as objects within the `colorThemes` array.
    - On page load, a function called `buildThemeDropdownMenu` loops through `colorThemes` and dynamically builds the dropdown menu. 
    - The function `setTheme` loops through the `colorThemes` array and applies the values as CSS style declarations.

        > This process allows for future themes to be built requiring no more additional programming beyond creating a new theme object.

4. Create and use a function that accepts two or more parameters, calculates or determines a new value based on those inputs, and returns a new value.
    - The function `sortNotes` accepts two values, method and order to calcuate and display notes by date edited, date created, ascending or descending.
5. Calculate and display data based on an external factor.
    - Notes utilize the Date object to store the creation and edit dates.
    - This data is used to:
        - Calucate sort order
        - Display the date type back to the user
6. Analyze text and display information about it.
    - As a user types a note, the function `countItems` displays either the current word or character count.
7. Application must have a responsive design.
    - The project is built mobile-first and scales to a tablet/desktop configuration at 700px.