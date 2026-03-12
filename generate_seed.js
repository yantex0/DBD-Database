import fs from 'fs'

function escapeSqlString(str) {
    if (!str) return 'NULL';
    // Escape single quotes for SQLite
    return `'${str.replace(/'/g, "''")}'`;
}

function processCharacters(type, filename) {
    const data = JSON.parse(fs.readFileSync(`./data/${filename}`, 'utf8'));
    const records = type === 'killer' ? data.killers : data.survivors;
    let sql = '';

    records.forEach(char => {
        if (type === 'killer') {
            sql += `INSERT INTO Killers (id, name, killer_name, icon_url, wiki_link) VALUES (` +
                `${escapeSqlString(char.URIName)}, ${escapeSqlString(char.name)}, ${escapeSqlString(char.killerName)}, ${escapeSqlString(char.iconURL)}, ${escapeSqlString(char.link)});\n`;
        } else {
            sql += `INSERT INTO Survivors (id, name, icon_url, wiki_link) VALUES (` +
                `${escapeSqlString(char.URIName)}, ${escapeSqlString(char.name)}, ${escapeSqlString(char.iconURL)}, ${escapeSqlString(char.link)});\n`;
        }
    });
    return sql;
}

function processPerks(type, filename) {
    const data = JSON.parse(fs.readFileSync(`./data/${filename}`, 'utf8'));
    const records = data.perks;
    let sql = '';

    records.forEach(perk => {
        let charId = perk.character ? escapeSqlString(perk.character) : 'NULL';

        sql += `INSERT INTO Perks (id, type, name, icon_url, content_html, content_text, character_id) VALUES (` +
            `${escapeSqlString(perk.URIName)}, '${type}', ${escapeSqlString(perk.name)}, ${escapeSqlString(perk.iconURL)}, ` +
            `${escapeSqlString(perk.content)}, ${escapeSqlString(perk.contentText)}, ${charId});\n`;
    });
    return sql;
}

const schemaSql = `
-- D1 Schema Definition (schema.sql)
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS Perks;
DROP TABLE IF EXISTS Survivors;
DROP TABLE IF EXISTS Killers;

-- 1. Characters Tables
CREATE TABLE IF NOT EXISTS Killers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    killer_name TEXT NOT NULL,
    icon_url TEXT,
    wiki_link TEXT
);

CREATE TABLE IF NOT EXISTS Survivors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_url TEXT,
    wiki_link TEXT
);

-- 2. Perks Table
CREATE TABLE IF NOT EXISTS Perks (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    icon_url TEXT,
    content_html TEXT,
    content_text TEXT,
    character_id TEXT,

    FOREIGN KEY(character_id) REFERENCES Killers(id) ON DELETE SET NULL
);

-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_perks_type ON Perks(type);
CREATE INDEX IF NOT EXISTS idx_perks_character ON Perks(character_id);

`;

const finalSql =
    schemaSql +
    "-- Seed Data completely updated from JSON\n\n" +
    processCharacters('killer', 'killers.json') +
    processCharacters('survivor', 'survivors.json') +
    processPerks('killer', 'killer_perks.json') +
    processPerks('survivor', 'survivor_perks.json');

fs.writeFileSync('database_seed.sql', finalSql);
console.log("database_seed.sql generated successfully!");
