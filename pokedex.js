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

        pokedex += `<div class="carte" name="${pokedex_list[i][0]}">
                        <div class="carte_header">
                            <div class="case_nom">
                                <h2>${pokedex_list[i][1]}</h2>git 
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