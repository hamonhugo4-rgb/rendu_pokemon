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
        const stats = details.stats.map(s => `${s.stat.name}: ${s.base_stat}`);
        const types = details.types.map(t => t.type.name);
        const info_carte = {
            nom: details.name,
            taille: `${details.height *10} cm`,
            poids: `${details.weight} kg`,
            stats: stats,
            type:types
        };
        console.log(info_carte);
        return info_carte;
    }
        
    else{
    
        displayError("Une erreur est survenue");
        return;
    
    }};
