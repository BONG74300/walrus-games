interface GameEntry {
    id: string;
    name: string;
    thumbnail: string;
    wasm: string;
    bootstrap: string;
}

async function loadGamesManifest(): Promise<GameEntry[]> {
    const res = await fetch("games.json");
    if (!res.ok) throw new Error("Failed to load games.json");
    return res.json();
}

function renderGameCards(games: GameEntry[]): void {
    const list = document.getElementById("game-list");
    if (!list) return;

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

async function launchWasmGame(wasmPath: string, bootstrapPath: string): Promise<void> {
    const player = document.getElementById("game-player");
    if (!player) return;

    player.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    player.appendChild(canvas);

    try {
        const loaderScript = await import(`../${bootstrapPath}`);

        const Module: any = {
            canvas,
            locateFile(path: string): string {
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
    try {
        const games = await loadGamesManifest();
        renderGameCards(games);
    } catch (err) {
        console.error(err);
    }
});
