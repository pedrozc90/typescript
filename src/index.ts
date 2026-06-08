import { createApp } from "./app.ts";
import { settings } from "../settings/index.ts";

const app = createApp();

app.listen(settings.port, () => {
    console.log(`server running on port ${settings.port}`);
});
