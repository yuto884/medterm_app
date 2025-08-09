from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import difflib
import sqlite3

app = Flask(__name__)
CORS(app)

DB_PATH = 'medical_terms.db'

def query_terms():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT term FROM terms')
    rows = c.fetchall()
    conn.close()
    return [row[0] for row in rows]

def get_definition(term):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT definition FROM terms WHERE term = ?', (term,))
    row = c.fetchone()
    conn.close()
    if row:
        return row[0]
    else:
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/result', methods=['POST'])
def result():
    term = request.form['term']
    definition = get_definition(term) or "その用語の説明は登録されていません。"
    return render_template('result.html', term=term, definition=definition)

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query', '').lower()

    if not query:
        return jsonify([])

    all_terms = query_terms()
    matches = [term for term in all_terms if query in term.lower()]
    fuzzy_matches = difflib.get_close_matches(query, all_terms, n=5, cutoff=0.4)

    combined = list(dict.fromkeys(matches + fuzzy_matches))

    return jsonify(combined)

@app.route('/api/definition', methods=['POST'])
def api_definition():
    data = request.get_json()
    term = data.get('term', '')
    definition = get_definition(term) or "その用語の説明は登録されていません。"
    return jsonify({'definition': definition})

if __name__ == '__main__':
    app.run(debug=True)
