CREATE TABLE event_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE scale (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE teacher (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    post VARCHAR(150) NOT NULL
);

CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL
);

CREATE TABLE participant_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

CREATE TABLE event (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    event_type_id INTEGER NOT NULL REFERENCES event_type(id) ON DELETE RESTRICT,
    scale_id INTEGER NOT NULL REFERENCES scale(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location_id INTEGER NOT NULL REFERENCES location(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'In progress', 'Completed', 'Canceled')),
    responsible_teacher_id INTEGER NOT NULL REFERENCES teacher(id) ON DELETE RESTRICT,
    estimated_budget INTEGER,
    participant_category_id INTEGER NOT NULL REFERENCES participant_category(id) ON DELETE RESTRICT,
    notes TEXT,
    CONSTRAINT dates_check CHECK (end_date >= start_date)
);

CREATE TABLE event_participant_category (
    event_id INTEGER REFERENCES event(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES participant_category(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, category_id)
);

-- Расширяем event_type (20+ записей)
INSERT INTO event_type (name) VALUES
('Conference'),
('Seminar'),
('Workshop'),
('Competition'),
('CTF'),
('Hackathon'),
('Olympiad'),
('Exhibition'),
('Festival'),
('Symposium'),
('Forum'),
('Meetup'),
('Training'),
('Webinar'),
('Master Class'),
('Round Table'),
('Panel Discussion'),
('Brainstorming'),
('Team Building'),
('Networking Event'),
('Career Fair'),
('Science Fair'),
('Open Day'),
('Graduation'),
('Award Ceremony');

-- Расширяем scale (20+ записей)
INSERT INTO scale (name) VALUES
('University'),
('Faculty'),
('Department'),
('Local'),
('City'),
('Regional'),
('National'),
('International'),
('Global'),
('Continental'),
('Federal'),
('District'),
('Corporate'),
('Online'),
('Hybrid'),
('Multi-campus'),
('Inter-university'),
('National-wide'),
('Worldwide'),
('Pan-regional'),
('Cross-border'),
('Multi-national'),
('State-level'),
('Municipal');

-- Расширяем location (20+ записей)
INSERT INTO location (name) VALUES
('Main Campus'),
('Building A'),
('Building B'),
('Conference Hall'),
('Auditorium 101'),
('Computer Lab 1'),
('Library'),
('Student Center'),
('Sports Complex'),
('Online'),
('Moscow'),
('Saint Petersburg'),
('Novosibirsk'),
('Yekaterinburg'),
('Kazan'),
('Nizhny Novgorod'),
('Chelyabinsk'),
('Omsk'),
('Samara'),
('Rostov-on-Don'),
('Ufa'),
('Krasnoyarsk'),
('Voronezh'),
('Perm'),
('Volgograd');

-- Расширяем participant_category (20+ записей)
INSERT INTO participant_category (name) VALUES
('1st Year Students'),
('2nd Year Students'),
('3rd Year Students'),
('4th Year Students'),
('Master Students'),
('PhD Students'),
('School Students'),
('University Teachers'),
('School Teachers'),
('Researchers'),
('IT Professionals'),
('Engineers'),
('Scientists'),
('Administrative Staff'),
('Alumni'),
('International Students'),
('Freshmen'),
('Graduates'),
('Postgraduates'),
('Faculty Members'),
('Industry Experts'),
('Guest Lecturers'),
('Sponsors'),
('Parents'),
('Government Officials');

-- Расширяем teacher (20+ записей)
INSERT INTO teacher (full_name, post) VALUES
('Ivan Petrov', 'Professor'),
('Maria Sidorova', 'Associate Professor'),
('Alexey Kozlov', 'Assistant Professor'),
('Elena Volkova', 'Senior Lecturer'),
('Dmitry Orlov', 'Lecturer'),
('Olga Smirnova', 'Department Head'),
('Sergey Popov', 'Dean'),
('Anna Kuznetsova', 'Research Director'),
('Pavel Lebedev', 'Lab Supervisor'),
('Tatiana Frolova', 'Professor'),
('Viktor Sokolov', 'Associate Professor'),
('Natalia Morozova', 'Assistant Professor'),
('Mikhail Pavlov', 'Senior Lecturer'),
('Yulia Romanova', 'Lecturer'),
('Artem Vorobev', 'Professor'),
('Svetlana Egorova', 'Associate Professor'),
('Konstantin Gusev', 'Assistant Professor'),
('Larisa Tikhonova', 'Senior Lecturer'),
('Vladimir Komarov', 'Lecturer'),
('Galina Belyaeva', 'Professor'),
('Roman Davydov', 'Associate Professor'),
('Irina Krylova', 'Assistant Professor'),
('Denis Medvedev', 'Senior Lecturer'),
('Ekaterina Orlova', 'Professor'),
('Andrey Volkov', 'Department Head');

-- Расширяем event (20+ записей с правильными зависимостями)
INSERT INTO event (title, description, event_type_id, scale_id, start_date, end_date, location_id, status, responsible_teacher_id, estimated_budget, participant_category_id, notes) VALUES
('Annual Science Conference 2024', 'International conference on recent scientific discoveries', 1, 8, '2024-05-15', '2024-05-17', 11, 'planned', 1, 500000, 8, 'Keynote speakers from leading universities'),
('Programming Olympiad 2024', 'Competitive programming contest for students', 4, 6, '2024-03-20', '2024-03-21', 5, 'Completed', 2, 150000, 1, 'Winners receive scholarships'),
('Cybersecurity CTF 2024', 'Capture The Flag cybersecurity competition', 5, 7, '2024-06-10', '2024-06-12', 6, 'planned', 3, 300000, 4, 'Teams of 3-5 participants'),
('AI Hackathon 2024', '48-hour hackathon on artificial intelligence', 6, 5, '2024-04-05', '2024-04-07', 8, 'In progress', 4, 250000, 3, 'Industry partners: Google, Yandex'),
('Career Fair Spring 2024', 'Job fair for graduating students', 21, 4, '2024-02-15', '2024-02-16', 9, 'Completed', 5, 100000, 5, '50+ companies participating'),
('Research Symposium', 'Graduate student research presentations', 10, 3, '2024-07-01', '2024-07-02', 4, 'planned', 6, 80000, 6, 'Peer-reviewed abstracts'),
('Web Development Workshop', 'Hands-on web development training', 3, 2, '2024-03-10', '2024-03-11', 6, 'Completed', 7, 50000, 1, 'Bring your laptop'),
('Data Science Seminar', 'Advanced data analysis techniques', 2, 3, '2024-05-20', '2024-05-20', 3, 'planned', 8, 40000, 7, 'Python and R focus'),
('University Open Day', 'Campus tour for prospective students', 23, 4, '2024-04-12', '2024-04-12', 1, 'planned', 9, 120000, 17, 'All departments participating'),
('International Student Forum', 'Cultural exchange and networking', 11, 8, '2024-08-25', '2024-08-27', 8, 'planned', 10, 350000, 16, 'Students from 20+ countries'),
('Faculty Training 2024', 'Professional development for teachers', 13, 1, '2024-01-20', '2024-01-22', 2, 'Completed', 11, 90000, 8, 'Teaching methodologies update'),
('Robotics Competition', 'Annual robotics design contest', 4, 5, '2024-09-15', '2024-09-17', 9, 'planned', 12, 280000, 2, 'Hardware provided'),
('Mathematics Olympiad', 'Problem solving competition', 7, 6, '2024-11-10', '2024-11-11', 5, 'planned', 13, 110000, 7, 'Individual participation'),
('Chemistry Exhibition', 'Interactive chemistry demonstrations', 8, 3, '2024-10-05', '2024-10-06', 7, 'planned', 14, 75000, 13, 'Safety protocols required'),
('Startup Pitch Festival', 'Student startup presentations', 9, 4, '2024-06-25', '2024-06-26', 4, 'planned', 15, 200000, 5, 'Investors invited'),
('Language Learning Meetup', 'Practice foreign languages', 12, 2, '2024-03-15', '2024-03-15', 8, 'Completed', 16, 25000, 1, 'Multiple languages available'),
('Blockchain Master Class', 'Advanced blockchain development', 15, 3, '2024-07-15', '2024-07-16', 6, 'planned', 17, 60000, 4, 'Hands-on coding session'),
('Environmental Round Table', 'Discussion on sustainability', 16, 4, '2024-08-10', '2024-08-10', 3, 'planned', 18, 45000, 20, 'Industry experts panel'),
('Team Building Retreat', 'Department team building activities', 19, 1, '2024-05-25', '2024-05-26', 9, 'planned', 19, 180000, 14, 'Outdoor activities planned'),
('Alumni Networking Event', 'Connect with university graduates', 20, 4, '2024-09-20', '2024-09-20', 8, 'planned', 20, 95000, 15, 'Class reunions'),
('Quantum Computing Seminar', 'Introduction to quantum algorithms', 2, 3, '2024-12-05', '2024-12-05', 4, 'planned', 21, 55000, 6, 'Theoretical foundations'),
('Mobile App Hackathon', '48-hour mobile development contest', 6, 5, '2024-07-20', '2024-07-22', 6, 'planned', 22, 220000, 3, 'iOS and Android tracks'),
('Annual Graduation Ceremony', 'Graduation ceremony for students', 24, 4, '2024-06-30', '2024-06-30', 9, 'planned', 23, 300000, 18, 'Formal attire required'),
('Research Award Ceremony', 'Awards for outstanding research', 25, 3, '2024-12-15', '2024-12-15', 4, 'planned', 24, 120000, 13, 'By invitation only'),
('Industry Partnership Forum', 'University-industry collaboration', 11, 7, '2024-10-20', '2024-10-21', 11, 'planned', 25, 400000, 21, 'Corporate partners meeting');

-- Расширяем event_participant_category (20+ записей, связи многие-ко-многим)
INSERT INTO event_participant_category (event_id, category_id) VALUES
(1, 8), (1, 6), (1, 13), (1, 20),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 3), (3, 4), (3, 5), (3, 11),
(4, 2), (4, 3), (4, 4), (4, 11),
(5, 4), (5, 5), (5, 15), (5, 22),
(6, 6), (6, 8), (6, 13),
(7, 1), (7, 2), (7, 17),
(8, 1), (8, 2), (8, 3), (8, 7),
(9, 7), (9, 17), (9, 24),
(10, 16), (10, 1), (10, 2), (10, 3),
(11, 8), (11, 20),
(12, 1), (12, 2), (12, 3), (12, 12),
(13, 7), (13, 1), (13, 2),
(14, 7), (14, 13), (14, 8),
(15, 4), (15, 5), (15, 21),
(16, 1), (16, 2), (16, 3), (16, 16),
(17, 3), (17, 4), (17, 11),
(18, 8), (18, 20), (18, 21), (18, 25),
(19, 8), (19, 14), (19, 20),
(20, 15), (20, 18), (20, 8),
(21, 6), (21, 8), (21, 13),
(22, 2), (22, 3), (22, 4), (22, 11),
(23, 18), (23, 8), (23, 14), (23, 24),
(24, 8), (24, 13), (24, 20), (24, 25),
(25, 8), (25, 21), (25, 22), (25, 25);