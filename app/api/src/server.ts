import app from "./main";

const PORT = 3000;

function server() {
  app.listen(PORT, () =>
    console.log(`Server running on PORT: http://localhost:${PORT}`)
  );
}

server();
