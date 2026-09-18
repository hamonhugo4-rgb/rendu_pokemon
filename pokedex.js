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
        
        // On utilise une boucle for...of pour pouvoir faire des fetch sur chaque pokemon
        for (const element of data.results) {
            // On récupère les détails du pokémon pour avoir ses types
            const resDetails = await fetch(element.url);
            const details = await resDetails.json();
            
            // On extrait les noms des types (ex: ['grass', 'poison'])
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
        
        let typesHtml = pokedex_list[i][4].map(t => `<span class="badge_type">${t}</span>`).join('');

        pokedex += `<div class="carte" name="${pokedex_list[i][0]}">
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
}

creerpokedex();
// Partie Amina : recherche et favoris

const champRecherche = document.getElementById("recherche_pokemon");
const messageAucunResultat = document.getElementById("aucun_resultat");
const nombreFavoris = document.getElementById("nombre_favoris");
const zonePokedex = document.getElementById("pokedex");

let favoris = JSON.parse(localStorage.getItem("favorisPokemon")) || [];

const sauvegarderFavoris = () => {
    localStorage.setItem("favorisPokemon", JSON.stringify(favoris));
};

const mettreAJourCompteur = () => {
    nombreFavoris.textContent = favoris.length;
};

const estFavori = (id) => {
    return favoris.includes(id);
};

const changerFavori = (id, bouton) => {
    if (estFavori(id)) {
        favoris = favoris.filter(favoriId => favoriId !== id);
    } else {
        favoris.push(id);
    }

    sauvegarderFavoris();
    mettreAJourCompteur();

    const actif = estFavori(id);

    bouton.textContent = actif ? "♥" : "♡";
    bouton.classList.toggle("actif", actif);
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
    const recherche = champRecherche.value.trim().toLowerCase();
    const cartes = document.querySelectorAll(".carte");
    let nombreResultats = 0;

    cartes.forEach(carte => {
        const nom = carte.querySelector("h2").textContent.toLowerCase();
        const correspond = nom.includes(recherche);

        carte.classList.toggle("cache", !correspond);

        if (correspond) {
            nombreResultats++;
        }
    });

    messageAucunResultat.classList.toggle(
        "cache",
        nombreResultats !== 0
    );
};

champRecherche.addEventListener("input", rechercherPokemon);

mettreAJourCompteur();

const observateurPokedex = new MutationObserver(() => {
    ajouterBoutonsFavoris();
    rechercherPokemon();
});

observateurPokedex.observe(zonePokedex, {
    childList: true
});