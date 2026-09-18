// Création d'une fonction qui affichera les messages d'erreurs
const displayError = (message) => {
  const error = document.createElement('p')
  error.classList.add('red')
  error.textContent = message
  document.body.appendChild(error)
}
 
// Création d'une fonction qui appelle l'API
const getData = async () => {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    .catch(error => {
      console.error("Error:", error)
      displayError("Une erreur est survenue")
    });
    // On prépare une liste vide et l'index des cartes
        
    let pokedex_list = [];
    let index = 1;

     if(response.status < 300){
        // On récupère le corps de la requête
        const data = await response.json();
        data.results.forEach(element => {
        
        pokedex_list.push([
            index,
            element.name,
            element.url,
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index}.png`
        ]);
        index += 1;
        });
    }else{
    // Status code >= 300
    displayError("Une erreur est survenue")
  }
    return pokedex_list; // retourne la liste pour obtenir les information

  } 


async function creerpokedex(){
    const pokedex_list = await getData();
    let pokedex ="";
    for (let i =0;i<50;i++){
        pokedex += `<div class="carte" name="${pokedex_list[i][0]}">
                        <div class="case_nom">
                            <h2>${pokedex_list[i][1]}</h2>
                        </div>
                        <div class="image_carte">
                            <img src="${pokedex_list[i][3]}" alt="image de ${pokedex_list[i][1]}">
                        </div> 
                    </div>`
    }
    const pokedex_div = document.getElementById("pokedex");
    
    // On injecte le HTML généré à l'intérieur de la div
    pokedex_div.innerHTML = pokedex;
}


creerpokedex();