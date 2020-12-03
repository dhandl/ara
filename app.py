from flask import Flask
from flask import render_template
import logging
from flask_login import login_required, current_user

logger=logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

app = Flask(__name__)
app.config.from_pyfile('config.ini')

# Flask secret key
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


@app.route('/')
#@login_required
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(host='localhost', debug=True)
