CREATE TABLE temas_principais (
    id SERIAL PRIMARY KEY,
    ordem INT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT
);