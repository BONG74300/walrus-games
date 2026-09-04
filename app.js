async function loadGamesManifest() {
    const res = await fetch("games.json");
    return res.json();
}

function renderGameCards(games) {
    const list = document.getElementById("game-list");
    list.innerHTML = "";

    games.forEach(game => {
        const card = document.createElement("div");
        card.className = "game-card";

        const img = document.createElement("img");
        img.src = game.thumbnail;
        img.alt = game.name;

        const overlay = document.createElement("div");
        overlay.className = "game-overlay";

        const title = document.createElement("h3");
        title.className = "game-title";
        title.textContent = game.name;

        overlay.appendChild(title);
        card.appendChild(img);
        card.appendChild(overlay);

        card.addEventListener("click", () => {
            launchWasmGame(game.wasm, game.bootstrap);
        });

        list.appendChild(card);
    });
}

export async function launchWasmGame(wasmPath, bootstrapPath) {
    const player = document.getElementById("game-player");
    player.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    player.appendChild(canvas);

    try {
        const loaderScript = await import(`./${bootstrapPath}`);

        const Module = {
            canvas,
            locateFile(path) {
                if (path.endsWith(".wasm")) return wasmPath;
                return path;
            }
        };

        if (typeof loaderScript.default === "function") {
            loaderScript.default(Module);
        } else if (typeof loaderScript.Module === "function") {
            loaderScript.Module(Module);
        } else {
            console.error("No valid loader in bootstrap script:", bootstrapPath);
        }
    } catch (err) {
        console.error("Failed to load WASM game:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const games = await loadGamesManifest();
    renderGameCards(games);
});
