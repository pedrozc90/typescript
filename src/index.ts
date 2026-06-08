import { app } from "./app.ts";
import { settings } from "./settings/index.ts";

if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(settings.port, () => {
        console.log(`API listening on port ${settings.port}`);
    });
}
