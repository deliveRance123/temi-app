import os
import psycopg2
import json

DATABASE_URL = os.getenv("DATABASE_URL", "")

def init_db():
    print("Connecting to Neon PostgreSQL...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    # Create tables
    print("Creating tables...")
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL DEFAULT 'TEMITOPE',
        display_name VARCHAR(100) DEFAULT 'Temitope',
        avatar_url VARCHAR(255) DEFAULT '/assets/temitope-brand.png',
        streak_days INT DEFAULT 1,
        words_learned INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reading_lessons (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'story',
        level VARCHAR(20) NOT NULL DEFAULT 'beginner',
        content TEXT NOT NULL,
        vocab_words JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL DEFAULT 'word',
        title VARCHAR(200),
        content TEXT NOT NULL,
        pronunciation TEXT,
        meaning TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS practice_activities (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL, -- 'read_along', 'dictation', 'shadowing', 'writing'
        score INT DEFAULT 100,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Ensure default user TEMITOPE exists
    print("Ensuring user TEMITOPE exists...")
    cur.execute("""
    INSERT INTO users (username, display_name, streak_days, words_learned)
    VALUES ('TEMITOPE', 'Temitope', 1, 12)
    ON CONFLICT (username) DO NOTHING;
    """)

    # Check reading lessons count
    cur.execute("SELECT COUNT(*) FROM reading_lessons;")
    count = cur.fetchone()[0]
    print(f"Current lessons in database: {count}")

    if count == 0:
        print("Inserting starter reading lessons for Temitope...")
        starter_lessons = [
            (
                "A Bright Morning in Lagos",
                "daily_life",
                "beginner",
                "The sun rises over the city. Temitope wakes up early with a bright smile. She pours a cup of warm tea and opens her window. The breeze is gentle and cool. Today is a great day to learn and grow.",
                json.dumps([
                    {"word": "Bright", "syllables": "Bright", "meaning": "Full of light and happiness", "phonetic": "/braɪt/"},
                    {"word": "Gentle", "syllables": "Gen-tle", "meaning": "Soft, calm, and kind", "phonetic": "/ˈdʒen.təl/"},
                    {"word": "Morning", "syllables": "Mor-ning", "meaning": "The early part of the day", "phonetic": "/ˈmɔː.nɪŋ/"},
                    {"word": "Window", "syllables": "Win-dow", "meaning": "An opening in a wall to let in light and air", "phonetic": "/ˈwɪn.dəʊ/"}
                ])
            ),
            (
                "Visiting the Fresh Food Market",
                "market",
                "beginner",
                "On Saturday, the market is full of life and color. Vendors arrange sweet yellow mangoes, red tomatoes, and fresh green vegetables on wooden tables. People greet each other warmly with respect. Buying good food brings everyone joy.",
                json.dumps([
                    {"word": "Market", "syllables": "Mar-ket", "meaning": "A place where people buy and sell goods", "phonetic": "/ˈmɑː.kɪt/"},
                    {"word": "Fresh", "syllables": "Fresh", "meaning": "Recently made or gathered, not old", "phonetic": "/freʃ/"},
                    {"word": "Respect", "syllables": "Re-spect", "meaning": "Treating people with honour and kindness", "phonetic": "/rɪˈspekt/"},
                    {"word": "Vegetables", "syllables": "Veg-e-ta-bles", "meaning": "Healthy plants we eat like spinach and carrots", "phonetic": "/ˈvedʒ.tə.bəlz/"}
                ])
            ),
            (
                "The Power of Reading Books",
                "story",
                "intermediate",
                "Books are like magical doors. When you open a book, you travel to new places without leaving your chair. Every page teaches you new words and powerful ideas. With patience and daily practice, reading becomes your greatest superpower.",
                json.dumps([
                    {"word": "Magical", "syllables": "Mag-i-cal", "meaning": "Wonderful, special, and full of wonder", "phonetic": "/ˈmædʒ.ɪ.kəl/"},
                    {"word": "Travel", "syllables": "Trav-el", "meaning": "To go from one place to another", "phonetic": "/ˈtræv.əl/"},
                    {"word": "Patience", "syllables": "Pa-tience", "meaning": "The ability to stay calm and keep trying", "phonetic": "/ˈpeɪ.ʃəns/"},
                    {"word": "Superpower", "syllables": "Su-per-pow-er", "meaning": "An extraordinary strength or ability", "phonetic": "/ˈsuː.pəˌpaʊ.ər/"}
                ])
            ),
            (
                "Caring for Others: The Nurse's Dream",
                "health",
                "intermediate",
                "A kind nurse wears clean scrubs and a stethoscope. She checks on patients and listens carefully to their heartbeats. Her gentle words bring peace and hope to everyone in the room. Healing begins with compassion and love.",
                json.dumps([
                    {"word": "Patient", "syllables": "Pa-tient", "meaning": "A person receiving medical care", "phonetic": "/ˈpeɪ.ʃənt/"},
                    {"word": "Stethoscope", "syllables": "Steth-o-scope", "meaning": "A tool doctors and nurses use to listen to the heart", "phonetic": "/ˈsteθ.ə.skəʊp/"},
                    {"word": "Compassion", "syllables": "Com-pas-sion", "meaning": "Deep sympathy and care for others who are hurting", "phonetic": "/kəmˈpæʃ.ən/"},
                    {"word": "Peace", "syllables": "Peace", "meaning": "Calmness, quietness, freedom from worry", "phonetic": "/piːs/"}
                ])
            )
        ]

        for title, category, level, content, vocab in starter_lessons:
            cur.execute("""
            INSERT INTO reading_lessons (title, category, level, content, vocab_words)
            VALUES (%s, %s, %s, %s, %s);
            """, (title, category, level, content, vocab))

    # Also add 2 starter notes for her
    cur.execute("SELECT id FROM users WHERE username = 'TEMITOPE';")
    user_id = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM notes WHERE user_id = %s;", (user_id,))
    notes_count = cur.fetchone()[0]
    if notes_count == 0:
        print("Inserting starter welcoming notes...")
        starter_notes = [
            (
                user_id,
                "word",
                "Beautiful",
                "Beau-ti-ful",
                "/ˈbjuː.tɪ.fʊl/",
                "Very pleasing to look at, listen to, or experience."
            ),
            (
                user_id,
                "sentence",
                "My Reading Journey",
                "I am learning how to read books and write clearly every day.",
                "",
                "A strong, positive sentence to remember and practice writing."
            )
        ]
        for uid, cat, title, content, pron, mean in starter_notes:
            cur.execute("""
            INSERT INTO notes (user_id, category, title, content, pronunciation, meaning)
            VALUES (%s, %s, %s, %s, %s, %s);
            """, (uid, cat, title, content, pron, mean))

    cur.close()
    conn.close()
    print("Database initialization complete! All tables and starter lessons ready.")

if __name__ == "__main__":
    init_db()
