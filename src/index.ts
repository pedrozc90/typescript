import { app } from "./app.ts";
import { config } from "./config.ts";

if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(config.port, () => {
        console.log(`API listening on port ${config.port}`);
    });
}
