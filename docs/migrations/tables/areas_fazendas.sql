CREATE TABLE areas_fazendas (
    id SERIAL PRIMARY KEY,
    ordem INT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT
);