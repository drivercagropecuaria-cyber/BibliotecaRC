CREATE TABLE temas_secundarios (
    id SERIAL PRIMARY KEY,
    ordem INT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT
);