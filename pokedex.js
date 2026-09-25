const displayError = (message) => {
  const error = document.createElement('p')
  error.classList.add('red')
  error.textContent = message
  document.body.appendChild(error)
}

const getData = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    .catch(error => {
      console.error("Error:", error)
      displayError("Une erreur est survenue")
    });
        
    let pokedex_list = [];
    let index = 1;

    if(response.status < 300){
        const data = await response.json();
        
        for (const element of data.results) {
            const resDetails = await fetch(element.url);
            const details = await resDetails.json();
            const types = details.types.map(t => t.type.name);

            pokedex_list.push([
                index,
                element.name,
                element.url,
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`,
                types 
            ]);
            index += 1;
        }
    } else {
        displayError("Une erreur est survenue");
    }
    return pokedex_list;
} 

async function creerpokedex(){
    const pokedex_list = await getData();
    let pokedex ="";
    
    for (let i = 0; i < pokedex_list.length; i++) {
        let typesHtml = pokedex_list[i][4].map(t => {
            return `<img src="https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/${t}.svg" alt="${t}" class="icon_type" title="${t}">`;
        }).join('');

        pokedex += `<div class="carte" data-types="${pokedex_list[i][4].join(' ')}" name="${pokedex_list[i][0]}">
                        <div class="carte_header">
                            <div class="case_nom">
                                <h2>${pokedex_list[i][1]}</h2>
                            </div>
                            <div class="affichage_type">
                                ${typesHtml}
                            </div>
                        </div>
                        <div class="image_carte">
                            <img src="${pokedex_list[i][3]}" alt="image de ${pokedex_list[i][1]}">
                        </div> 
                    </div>`;
    }
    const pokedex_div = document.getElementById("pokedex");
    pokedex_div.innerHTML = pokedex;

    initFilter();
    initCardHover();
}

creerpokedex();

function initFilter() {
    const selectFilter = document.querySelector('select');
    const cards = document.querySelectorAll('.carte');

    selectFilter.addEventListener('change', (e) => {
        const selectedValue = e.target.value; 

        cards.forEach(card => {
            const cardTypes = card.getAttribute('data-types'); 

            if (selectedValue === 'all' || cardTypes.includes(selectedValue)) {
                card.style.display = 'flex'; 
            } else {
                card.style.display = 'none'; 
            }
        });
    });
}

async function poke_identity(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .catch(error => {
            console.error("Error:", error);
            displayError("Une erreur est survenue");
        });

    if(response.status < 300) {
        const details = await response.json();
        const stats = details.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('');
        const types = details.types.map(t => t.type.name).join(', ');
        
        const modalDetails = document.getElementById("modal-details");
        modalDetails.innerHTML = `
            <h2>${details.name}</h2>
            <img src="${details.sprites.front_default}" alt="${details.name}" style="width: 130px; image-rendering: pixelated;">
            <p><strong>Type(s) :</strong> ${types}</p>
            <p><strong>Taille :</strong> ${details.height * 10} cm</p>
            <p><strong>Poids :</strong> ${details.weight / 10} kg</p>
            <p><strong>Statistiques :</strong></p>
            <ul>${stats}</ul>
        `;

        document.getElementById("pokemon-modal").style.display = "flex";
    } else {
        displayError("Une erreur est survenue");
    }
}

document.addEventListener('click', (event) => {
    const modal = document.getElementById("pokemon-modal");
    if (event.target.classList.contains('close-btn') || event.target === modal) {
        modal.style.display = 'none';
    }
});

function initCardHover() {
    const cards = document.querySelectorAll('.carte');

    cards.forEach(card => {
        let hoverTimer = null;
        let closeTimer = null;
        const pokemonName = card.querySelector('h2').textContent;
        const modal = document.getElementById("pokemon-modal");

        card.addEventListener('mouseenter', () => {
            clearTimeout(closeTimer);

            if (modal.style.display !== "flex") {
                clearTimeout(hoverTimer);
                hoverTimer = setTimeout(() => {
                    poke_identity(pokemonName);
                }, 2000);
            }
        });

        card.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);

            
            if (modal.style.display === "flex") {
                clearTimeout(closeTimer);
                closeTimer = setTimeout(() => {
                    modal.style.display = 'none';
                }, 1000);
            }
        });
    });
}

// Partie Amina

const champRecherche = document.getElementById("recherche_pokemon");
const messageAucunResultat = document.getElementById("aucun_resultat");
const nombreFavoris = document.getElementById("nombre_favoris");
const zonePokedex = document.getElementById("pokedex");
const boutonAfficherFavoris = document.getElementById(
    "afficher_favoris"
);

let favoris =
    JSON.parse(localStorage.getItem("favorisPokemon")) || [];

let afficherSeulementFavoris = false;

const sauvegarderFavoris = () => {
    localStorage.setItem(
        "favorisPokemon",
        JSON.stringify(favoris)
    );
};

const mettreAJourCompteur = () => {
    nombreFavoris.textContent = favoris.length;
};

const estFavori = (id) => {
    return favoris.includes(id);
};

const changerFavori = (id, bouton) => {
    if (estFavori(id)) {
        favoris = favoris.filter(favoriId => {
            return favoriId !== id;
        });
    } else {
        favoris.push(id);
    }

    sauvegarderFavoris();
    mettreAJourCompteur();

    const actif = estFavori(id);

    bouton.textContent = actif ? "♥" : "♡";
    bouton.classList.toggle("actif", actif);

    rechercherPokemon();
};

const ajouterBoutonsFavoris = () => {
    const cartes = document.querySelectorAll(".carte");

    cartes.forEach(carte => {
        if (carte.querySelector(".bouton_favori")) {
            return;
        }

        const id = Number(carte.getAttribute("name"));
        const bouton = document.createElement("button");
        const actif = estFavori(id);

        bouton.type = "button";
        bouton.classList.add("bouton_favori");
        bouton.classList.toggle("actif", actif);
        bouton.textContent = actif ? "♥" : "♡";

        bouton.addEventListener("click", () => {
            changerFavori(id, bouton);
        });

        carte.appendChild(bouton);
    });
};

const rechercherPokemon = () => {
    const recherche = champRecherche.value
        .trim()
        .toLowerCase();

    const cartes = document.querySelectorAll(".carte");
    let nombreResultats = 0;

    cartes.forEach(carte => {
        const nom = carte
            .querySelector("h2")
            .textContent
            .toLowerCase();

        const id = Number(carte.getAttribute("name"));

        const correspondRecherche = nom.includes(recherche);

        const correspondFavori =
            !afficherSeulementFavoris || estFavori(id);

        const afficherCarte =
            correspondRecherche && correspondFavori;

        carte.classList.toggle("cache", !afficherCarte);

        if (afficherCarte) {
            nombreResultats++;
        }
    });

    messageAucunResultat.classList.toggle(
        "cache",
        nombreResultats !== 0
    );
};

champRecherche.addEventListener("input", rechercherPokemon);

boutonAfficherFavoris.addEventListener("click", () => {
    afficherSeulementFavoris = !afficherSeulementFavoris;

    if (afficherSeulementFavoris) {
        boutonAfficherFavoris.textContent =
            "Voir tous les Pokémon";

        boutonAfficherFavoris.classList.add("actif");
    } else {
        boutonAfficherFavoris.textContent =
            "Voir mes favoris";

        boutonAfficherFavoris.classList.remove("actif");
    }

    rechercherPokemon();
});

mettreAJourCompteur();

const observateurPokedex = new MutationObserver(() => {
    ajouterBoutonsFavoris();
    rechercherPokemon();
});

observateurPokedex.observe(zonePokedex, {
    childList: true
});