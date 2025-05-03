/**
 * WEB222 – Assignment 06
 *
 * I declare that this assignment is my own work in accordance with
 * Seneca Academic Policy. No part of this assignment has been
 * copied manually or electronically from any other source
 * (including web sites) or distributed to other students.
 *
 * Please update the following with your information:
 *
 *      Name:       Hoda Karimi
 *      Student ID: 138611223
 *      Date:       April 12 2024
 */ const { artists, songs } = window;
// Function to create menu buttons for each artist
function createMenuButtons() {
    const menu = document.getElementById("menu");
    artists.forEach((artist)=>{
        const button = document.createElement("button");
        button.textContent = artist.name;
        button.onclick = ()=>selectArtist(artist);
        menu.appendChild(button);
    });
}
function displayArtistLinks(artist) {
    const selectedArtist = document.getElementById("selected-artist");
    const linksHTML = artist.urls.map((link)=>`<a href="${link.url}" target="_blank">${link.name}</a>`).join(", ");
    selectedArtist.innerHTML = `${artist.name} (${linksHTML})`;
}
// Existing JavaScript code...
function createSongCard(song) {
    const card = document.createElement("div");
    card.classList.add("card");
    const songImg = document.createElement("img");
    songImg.src = song.imageUrl; // Make sure this property exists in your songs
    songImg.alt = song.title; // Accessibility for screen readers
    songImg.classList.add("card-image");
    card.appendChild(songImg); // Append the image to the card
    const songTitle = document.createElement("h3");
    songTitle.textContent = song.title;
    songTitle.classList.add("card-title");
    card.appendChild(songTitle);
    const songYear = document.createElement("time");
    songYear.textContent = song.year;
    songYear.classList.add("card-year");
    card.appendChild(songYear);
    const songDuration = document.createElement("span");
    songDuration.textContent = formatDuration(song.duration);
    songDuration.classList.add("card-duration");
    card.appendChild(songDuration);
    // Add event listener to open song URL on image click
    songImg.addEventListener("click", ()=>window.open(song.url, "_blank"));
    return card;
}
function selectArtist(artist) {
    displayArtistLinks(artist);
    const cardsContainer = document.getElementById("cards-container");
    cardsContainer.innerHTML = ""; // Clear previous cards
    const artistSongs = songs.filter((song)=>song.artistId === artist.artistId && !song.explicit);
    artistSongs.forEach((song)=>{
        const card = createSongCard(song);
        cardsContainer.appendChild(card);
    });
}
// Rest of the JavaScript code...
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
// Function to set up the initial table headings
function setupTableHeadings() {
    const tableHead = document.querySelector("table thead");
    tableHead.innerHTML = `
    <tr>
      <th>Song Name</th>
      <th>Year Recorded</th>
      <th>Duration (mm:ss)</th>
    </tr>
  `;
}
// Initial setup function that will run when the page loads
function setup() {
    createMenuButtons();
    setupTableHeadings();
}
// Attach the setup function to the window's load event
window.onload = setup;
// For debugging, display all of our data in the console. You can remove this later.
console.log({
    artists,
    songs
}, "App Data");

//# sourceMappingURL=index.8f0c9192.js.map
