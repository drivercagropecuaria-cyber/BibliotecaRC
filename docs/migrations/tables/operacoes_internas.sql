CREATE TABLE operacoes_internas (
    id SERIAL PRIMARY KEY,
    ordem INT,
    nucleo VARCHAR(255) NOT NULL,
    subnucleo VARCHAR(255),
    descricao TEXT
);