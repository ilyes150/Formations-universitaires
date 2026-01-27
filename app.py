from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

# Pages
@app.route("/")
@app.route("/index.html")
def index():
    return render_template("index.html")

@app.route("/majors")
@app.route("/majors.html")
def majors():
    return render_template("majors.html")

@app.route("/program")
@app.route("/program.html")
def program():
    return render_template("program.html")

# Static files: local dev uses these; on Vercel, public/src & public/data are served by CDN
@app.route("/src/<path:filename>")
def src_files(filename):
    return send_from_directory("src", filename)

@app.route("/data/<path:filename>")
def data_files(filename):
    return send_from_directory("data", filename)

if __name__ == "__main__":
    app.run(debug=True)
