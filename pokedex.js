// Afficher un message d'erreur
const afficherErreur = (message) => {
    const erreur = document.createElement("p");

    erreur.classList.add("red");
    erreur.textContent = message;

    document.body.appendChild(erreur);
};


// Éléments HTML
const zonePokedex = document.getElementById("pokedex");

const champRecherche =
    document.getElementById("recherche_pokemon");

const filtreType =
    document.getElementById("filtre_type");

const messageAucunResultat =
    document.getElementById("aucun_resultat");

const nombreFavoris =
    document.getElementById("nombre_favoris");

const boutonAfficherFavoris =
    document.getElementById("afficher_favoris");

const modal =
    document.getElementById("pokemon-modal");

const modalDetails =
    document.getElementById("modal-details");


// Récupération des favoris sauvegardés
// (le try/catch évite un plantage si les données sont corrompues)
const chargerFavoris = () => {
    try {
        const favorisSauvegardes = JSON.parse(
            localStorage.getItem("favorisPokemon")
        );

        return Array.isArray(favorisSauvegardes)
            ? favorisSauvegardes
            : [];
    } catch (erreur) {
        console.error(erreur);

        return [];
    }
};

let favoris = chargerFavoris();

let afficherSeulementFavoris = false;


// Récupérer les Pokémon depuis l'API
const recupererPokemon = async () => {
    try {
        const reponse = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=151"
        );

        if (!reponse.ok) {
            throw new Error("Erreur pendant le chargement");
        }

        const donnees = await reponse.json();

        const listePokemon = [];

        for (let index = 0; index < donnees.results.length; index++) {
            const pokemon = donnees.results[index];

            const reponseDetails = await fetch(pokemon.url);

            const details = await reponseDetails.json();

            const types = details.types.map(element => {
                return element.type.name;
            });

            listePokemon.push({
                id: index + 1,
                nom: pokemon.name,
                image: details.sprites.front_default,
                types: types
            });
        }

        return listePokemon;
    } catch (erreur) {
        console.error(erreur);

        afficherErreur(
            "Une erreur est survenue pendant le chargement."
        );

        return [];
    }
};


// Vérifier si un Pokémon est un favori
const estFavori = (id) => {
    return favoris.includes(id);
};


// Sauvegarder les favoris
const sauvegarderFavoris = () => {
    localStorage.setItem(
        "favorisPokemon",
        JSON.stringify(favoris)
    );
};


// Mettre à jour le compteur
const mettreAJourCompteur = () => {
    nombreFavoris.textContent = favoris.length;
};


// Ajouter ou retirer un Pokémon des favoris
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

    bouton.setAttribute(
        "aria-label",
        actif ? "Retirer des favoris" : "Ajouter aux favoris"
    );

    appliquerFiltres();
};


// Créer le bouton favori
const creerBoutonFavori = (id) => {
    const bouton = document.createElement("button");

    const actif = estFavori(id);

    bouton.type = "button";

    bouton.classList.add("bouton_favori");

    bouton.classList.toggle("actif", actif);

    bouton.textContent = actif ? "♥" : "♡";

    bouton.setAttribute(
        "aria-label",
        actif ? "Retirer des favoris" : "Ajouter aux favoris"
    );

    bouton.addEventListener("click", event => {
        event.stopPropagation();

        changerFavori(id, bouton);
    });

    return bouton;
};


// Créer toutes les cartes
const creerPokedex = async () => {
    const listePokemon = await recupererPokemon();

    zonePokedex.innerHTML = "";

    listePokemon.forEach(pokemon => {
        const carte = document.createElement("div");

        carte.classList.add("carte");

        carte.dataset.id = pokemon.id;

        carte.dataset.types = pokemon.types.join(" ");

        const typesHTML = pokemon.types
            .map(type => {
                return `
                    <img
                        src="https://raw.githubusercontent.com/partywhale/pokemon-type-icons/main/icons/${type}.svg"
                        alt="${type}"
                        title="${type}"
                        class="icon_type"
                    >
                `;
            })
            .join("");

        carte.innerHTML = `
            <div class="carte_header">

                <div class="case_nom">
                    <h2>${pokemon.nom}</h2>
                </div>

                <div class="affichage_type">
                    ${typesHTML}
                </div>

            </div>

            <div class="image_carte">

                <img
                    src="${pokemon.image}"
                    alt="Image de ${pokemon.nom}"
                >

            </div>
        `;

        const boutonFavori =
            creerBoutonFavori(pokemon.id);

        carte.appendChild(boutonFavori);

        ajouterEvenementDetails(carte, pokemon.nom);

        zonePokedex.appendChild(carte);
    });

    appliquerFiltres();
};


// Appliquer la recherche, le filtre et les favoris
const appliquerFiltres = () => {
    const recherche = champRecherche.value
        .trim()
        .toLowerCase();

    const typeSelectionne = filtreType.value;

    const cartes = document.querySelectorAll(".carte");

    let nombreResultats = 0;

    cartes.forEach(carte => {
        const nomPokemon = carte
            .querySelector("h2")
            .textContent
            .toLowerCase();

        const typesPokemon =
            carte.dataset.types;

        const idPokemon =
            Number(carte.dataset.id);

        const correspondRecherche =
            nomPokemon.includes(recherche);

        const correspondType =
            typeSelectionne === "all" ||
            typesPokemon.includes(typeSelectionne);

        const correspondFavori =
            !afficherSeulementFavoris ||
            estFavori(idPokemon);

        const afficherCarte =
            correspondRecherche &&
            correspondType &&
            correspondFavori;

        carte.classList.toggle(
            "cache",
            !afficherCarte
        );

        if (afficherCarte) {
            nombreResultats++;
        }
    });

    // Pas de message « aucun résultat » si aucune carte n'a été chargée
    messageAucunResultat.classList.toggle(
        "cache",
        cartes.length === 0 || nombreResultats !== 0
    );
};


// Afficher les informations détaillées
const afficherDetails = async (nomPokemon) => {
    try {
        const reponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${nomPokemon}`
        );

        if (!reponse.ok) {
            throw new Error(
                "Impossible de récupérer les informations"
            );
        }

        const details = await reponse.json();

        const types = details.types
            .map(element => {
                return element.type.name;
            })
            .join(", ");

        const statistiques = details.stats
            .map(element => {
                return `
                    <li>
                        ${element.stat.name} :
                        ${element.base_stat}
                    </li>
                `;
            })
            .join("");

        modalDetails.innerHTML = `
            <h2>${details.name}</h2>

            <img
                src="${details.sprites.front_default}"
                alt="${details.name}"
            >

            <p>
                <strong>Type(s) :</strong>
                ${types}
            </p>

            <p>
                <strong>Taille :</strong>
                ${details.height * 10} cm
            </p>

            <p>
                <strong>Poids :</strong>
                ${details.weight / 10} kg
            </p>

            <p>
                <strong>Statistiques :</strong>
            </p>

            <ul>
                ${statistiques}
            </ul>
        `;

        modal.style.display = "flex";
    } catch (erreur) {
        console.error(erreur);

        afficherErreur(
            "Impossible d'afficher les informations."
        );
    }
};


// Afficher les détails après deux secondes
const ajouterEvenementDetails = (carte, nomPokemon) => {
    let tempsOuverture;

    carte.addEventListener("mouseenter", () => {
        tempsOuverture = setTimeout(() => {
            afficherDetails(nomPokemon);
        }, 2000);
    });

    carte.addEventListener("mouseleave", () => {
        clearTimeout(tempsOuverture);
    });
};


// Fermer la fenêtre
document.addEventListener("click", event => {
    if (
        event.target.classList.contains("close-btn") ||
        event.target === modal
    ) {
        modal.style.display = "none";
    }
});


// Rechercher un Pokémon
champRecherche.addEventListener(
    "input",
    appliquerFiltres
);


// Filtrer les Pokémon par type
filtreType.addEventListener(
    "change",
    appliquerFiltres
);


// Afficher uniquement les favoris
boutonAfficherFavoris.addEventListener("click", () => {
    afficherSeulementFavoris =
        !afficherSeulementFavoris;

    if (afficherSeulementFavoris) {
        boutonAfficherFavoris.textContent =
            "Voir tous les Pokémon";

        boutonAfficherFavoris.classList.add("actif");
    } else {
        boutonAfficherFavoris.textContent =
            "Voir mes favoris";

        boutonAfficherFavoris.classList.remove("actif");
    }

    appliquerFiltres();
});


// Lancement du programme
mettreAJourCompteur();

creerPokedex();