-- Données initiales pour Transport DanGE

-- Insertion du mot de passe haché pour 'ChangezMoi123!' (bcrypt)
-- Note: Le hash sera généré par le script d'initialisation

-- Insertion de la secrétaire
INSERT INTO utilisateurs (username, password, role) VALUES
('Secretaire', '$2b$10$PLACEHOLDER', 'secretaire');

-- Insertion des chauffeurs
INSERT INTO chauffeurs (username, password, nom) VALUES
('patron', '$2b$10$PLACEHOLDER', 'Patron'),
('franck', '$2b$10$PLACEHOLDER', 'Franck'),
('laurence', '$2b$10$PLACEHOLDER', 'Laurence'),
('autre', '$2b$10$PLACEHOLDER', 'Autre');

-- Exemples de véhicules (optionnel)
INSERT INTO vehicules (immatriculation, modele, chauffeur_id) VALUES
('AA-123-BB', 'Peugeot 508', 1),
('CC-456-DD', 'Renault Talisman', 2),
('EE-789-FF', 'Citroën C5', 3),
('GG-012-HH', 'Skoda Superb', 4);
