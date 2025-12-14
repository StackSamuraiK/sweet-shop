import app from "./app.js";

const port = process.env.BACKEND_PORT || 3000;

app.listen(port, () => {
    console.log(`Your app is listening on ${port}`);
});