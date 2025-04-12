const pokemonGrid = document.getElementById('pokemonGrid');
const pokemonCount = 151; // Primera generación de Pokémon
const modal = document.getElementById('pokemonModal');
const closeBtn = document.querySelector('.close');

// Colores para los tipos de Pokémon
const typeColors = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC'
};

// Cerrar el modal al hacer clic en la X
closeBtn.onclick = function() {
    modal.style.display = "none";
}

// Cerrar el modal al hacer clic fuera de él
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function fetchPokemonData(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        // Obtener la descripción del Pokémon
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        // Buscar la descripción en español
        const spanishEntry = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'es'
        );
        const description = spanishEntry ? spanishEntry.flavor_text : 'Descripción no disponible';

        return {
            id: data.id,
            name: data.name,
            image: data.sprites.other['official-artwork'].front_default,
            types: data.types.map(type => type.type.name),
            description: description,
            stats: {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                speed: data.stats[5].base_stat
            }
        };
    } catch (error) {
        console.error(`Error al cargar el Pokémon ${id}:`, error);
        return null;
    }
}

function showPokemonDetails(pokemon) {
    // Actualizar el contenido del modal
    document.getElementById('modalImage').src = pokemon.image;
    document.getElementById('modalImage').alt = pokemon.name;
    document.getElementById('modalName').textContent = pokemon.name;

    // Actualizar tipos
    const modalTypes = document.getElementById('modalTypes');
    modalTypes.innerHTML = '';
    pokemon.types.forEach(type => {
        const typeSpan = document.createElement('span');
        typeSpan.className = 'type';
        typeSpan.style.backgroundColor = typeColors[type];
        typeSpan.textContent = type;
        modalTypes.appendChild(typeSpan);
    });

    // Actualizar estadísticas
    document.getElementById('hpValue').textContent = pokemon.stats.hp;
    document.getElementById('attackValue').textContent = pokemon.stats.attack;
    document.getElementById('defenseValue').textContent = pokemon.stats.defense;
    document.getElementById('speedValue').textContent = pokemon.stats.speed;

    // Actualizar barras de estadísticas (máximo 255)
    document.getElementById('hpBar').style.width = `${(pokemon.stats.hp / 255) * 100}%`;
    document.getElementById('attackBar').style.width = `${(pokemon.stats.attack / 255) * 100}%`;
    document.getElementById('defenseBar').style.width = `${(pokemon.stats.defense / 255) * 100}%`;
    document.getElementById('speedBar').style.width = `${(pokemon.stats.speed / 255) * 100}%`;

    document.getElementById('modalDescription').textContent = pokemon.description;

    // Mostrar el modal
    modal.style.display = "block";
}

async function loadPokemon() {
    pokemonGrid.innerHTML = '';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Cargando Pokémon...';
    pokemonGrid.appendChild(loadingDiv);

    const pokemonPromises = [];
    for (let i = 1; i <= pokemonCount; i++) {
        pokemonPromises.push(fetchPokemonData(i));
    }

    const pokemonList = await Promise.all(pokemonPromises);
    pokemonGrid.innerHTML = '';

    pokemonList.forEach(pokemon => {
                if (!pokemon) return;

                const card = document.createElement('div');
                card.className = 'pokemon-card';

                card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            <h2 class="pokemon-name">${pokemon.name}</h2>
            <div class="pokemon-types">
                ${pokemon.types.map(type => `
                    <span class="type" style="background-color: ${typeColors[type]}">${type}</span>
                `).join('')}
            </div>
            <p class="pokemon-description">${pokemon.description}</p>
        `;

        // Agregar evento de clic para mostrar detalles
        card.addEventListener('click', () => showPokemonDetails(pokemon));

        pokemonGrid.appendChild(card);
    });
}

loadPokemon();