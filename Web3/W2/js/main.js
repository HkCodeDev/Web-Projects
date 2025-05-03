// Global variables for page, perPage, and searchName
let page = 1; // Tracks the current page
const perPage = 10; // Number of listings to display per page
let searchName = null; // Stores the search query

// Function to load listing data from the API
async function loadListingsData() {
    let url = `/api/listings?page=${page}&perPage=${perPage}`;
    if (searchName) {
        url += `&name=${encodeURIComponent(searchName)}`;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        if (data.length > 0) {
            updateTableWithData(data); // Create <tr> elements and add them to the table
        } else {
            handleNoData();
        }
    } catch (error) {
        console.error("Error fetching data from API:", error);
        handleNoData();
    }
}

// Function to handle "No data available" scenario
function handleNoData() {
    const tableBody = document.querySelector("#listingsTable tbody");
    tableBody.innerHTML = `<tr><td colspan="4"><strong>No data available</strong></td></tr>`;
    
    if (page > 1) {
        page--; // Decrease the page if no data is available
    }
}

// Function to update the table with fetched data
function updateTableWithData(data) {
    const tableBody = document.querySelector("#listingsTable tbody");
    tableBody.innerHTML = ""; // Clear any existing rows

    data.forEach(listing => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', listing._id);

        const location = [
            listing.address?.city,
            listing.address?.state,
            listing.address?.country,
        ].filter(Boolean).join(', '); // Ensure only valid parts of the address are displayed

        tr.innerHTML = `
            <td>${listing.name}</td>
            <td>${listing.room_type}</td>
            <td>${location}</td>
            <td>${listing.summary || 'No summary available'}<br><br>
                <strong>Accommodates:</strong> ${listing.accommodates}<br>
                <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || "No rating"} (${listing.number_of_reviews || 0} Reviews)
            </td>
        `;
        
        // Add click event listener to show details in modal
        tr.addEventListener('click', () => showDetailsModal(listing._id));
        tableBody.appendChild(tr);
    });

    // Update the current page display
    document.getElementById('current-page').textContent = page;
}

// Function to show the modal with listing details
async function showDetailsModal(id) {
    try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) {
            throw new Error(`API error with status code: ${res.status}`);
        }

        const data = await res.json();
        populateModalWithData(data); // Populate the modal with the fetched data
    } catch (error) {
        console.error("Error fetching listing details from API:", error);
    }
}

// Function to populate the modal with listing data
function populateModalWithData(data) {
    document.querySelector("#listingModalLabel").textContent = `${data.name}`;
    
    const imageUrl = data.images?.picture_url || 'https://placehold.co/600x400?text=Photo+Not+Available';
    const neighborhoodOverview = data.neighborhood_overview || "No neighborhood overview available.";
    const price = data.price ? `$${data.price.toFixed(2)}` : "No price available";
    const roomType = data.room_type || "N/A";
    const bedType = data.bed_type || "N/A";
    const beds = data.beds || "N/A";

    const modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = `
       <img id="photo" class="img-fluid w-100" src="${imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Photo+Not+Available'" alt="Listing Image"><br><br>
        ${neighborhoodOverview}<br><br>
        <strong>Price:</strong> ${price}<br>
        <strong>Room:</strong> ${roomType}<br>
        <strong>Bed:</strong> ${bedType} (${beds})<br><br>
    `;

    // Show the modal
    const listingModal = new bootstrap.Modal(document.querySelector("#listingModal"));
    listingModal.show();
}

// Pagination: Handle the "Previous" and "Next" button events
document.getElementById('previous-page').addEventListener('click', () => {
    if (page > 1) {
        page--;
        loadListingsData(); // Load the previous page
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    page++;
    loadListingsData(); // Load the next page
});

// Handle search form submission
document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    searchName = document.getElementById('name').value.trim(); // Get the search value
    page = 1; // Reset to the first page after searching
    loadListingsData();
});

// Handle "Clear" button to reset search
document.getElementById('clearForm').addEventListener('click', () => {
    document.getElementById('name').value = ''; // Clear the search input
    searchName = null; // Reset the searchName variable
    loadListingsData(); // Reload the listings without any search filter
});

// Initialize the page when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadListingsData(); // Load the data when the page is first loaded
});
