const sites = [
    { name: "Del Carmen Hair Salon", path: "DelCarmeHairSalon" },
    { name: "Shop Vezzy", path: "SHOPVEZZY" },
    { name: "Studio 47 Hair Salon", path: "Studio47HairSalon" },
    { name: "Favorite Place to Shop", path: "favoriteplacetoshop" },
    { name: "Green House Water Heaters", path: "GreenHouseWaterHeaters" }
];

const gallery = document.getElementById("gallery");
const searchInput = document.getElementById("searchInput");

function renderSites(filter = "") {
    const search = filter.trim().toLowerCase();
    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(search)
    );

    gallery.innerHTML = "";

    if (!filteredSites.length) {
        gallery.innerHTML = '<div class="empty-state">No matching websites</div>';
        return;
    }

    filteredSites.forEach(site => {
        const card = document.createElement("a");
        card.className = "site-card";
        card.href = `./${site.path}/`;

        card.innerHTML = `
            <div class="preview-wrapper">
                <iframe
                    class="preview-frame"
                    src="./${site.path}/"
                    loading="lazy"
                    tabindex="-1"
                    aria-hidden="true"
                ></iframe>
            </div>
            <div class="card-label">${site.name}</div>
        `;

        gallery.appendChild(card);
    });
}

searchInput.addEventListener("input", event => {
    renderSites(event.target.value);
});

renderSites();
