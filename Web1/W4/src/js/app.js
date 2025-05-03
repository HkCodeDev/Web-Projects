/**
 * WEB222 – Assignment 04
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
 *      Date:       March 6 2024
 */

// All of our data is available on the global `window` object.
// Create local variables to work with it in this file.
const { artists, songs } = window;
// Function to create menu buttons for each artist
function createMenuButtons() {
  const menu = document.getElementById("menu");
  artists.forEach((artist) => {
    const button = document.createElement("button");
    button.textContent = artist.name;
    button.onclick = () => selectArtist(artist);
    menu.appendChild(button);
  });
}

function displayArtistLinks(artist) {
  const selectedArtist = document.getElementById("selected-artist");
  const linksHTML = artist.urls
    .map((link) => `<a href="${link.url}" target="_blank">${link.name}</a>`)
    .join(", ");
  selectedArtist.innerHTML = `${artist.name} (${linksHTML})`;
}

function selectArtist(artist) {
  displayArtistLinks(artist);

  const songsTableBody = document.getElementById("songs");
  // Clear previous songs
  songsTableBody.innerHTML = "";

  // Filter songs for the selected artist and create table rows
  const artistSongs = songs.filter((song) => song.artistId === artist.artistId && !song.explicit);

  artistSongs.forEach((song) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${song.url}" target="_blank">${song.title}</a></td>
      <td>${song.year}</td>
      <td>${formatDuration(song.duration)}</td>
    `;
    songsTableBody.appendChild(row);
  });
}
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
console.log({ artists, songs }, "App Data");
