from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# ----- Mock User Data -----
user = {
    "salary": 100000,
    "paychecks_per_year": 24,
    "age": 30,
    "retire_age": 65,
    "ytd_contributions": 7200
}

# In-memory settings
settings = {
    "type": "percent",   # "percent" or "dollar"
    "value": 10          # default: 10% or $10 (depending on type)
}

# Calculate contribution per paycheck
def calc_per_paycheck(s):
    if s["type"] == "percent":
        return (user["salary"] / user["paychecks_per_year"]) * (s["value"] / 100)
    else:
        return s["value"]

# Simple projection
def project_balance(percent):
    years = user["retire_age"] - user["age"]
    r = 0.07  # 7% annual return
    annual = user["salary"] * (percent / 100)
    fv = annual * ((1 + r)**years - 1) / r
    return fv

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/get")
def get_data():
    per = calc_per_paycheck(settings)

    # Convert dollar → percent when needed
    if settings["type"] == "percent":
        curr_percent = settings["value"]
    else:
        curr_percent = (settings["value"] * user["paychecks_per_year"] / user["salary"]) * 100

    projected = project_balance(curr_percent)
    projected_plus_one = project_balance(curr_percent + 1)

    return jsonify({
        "user": user,
        "settings": settings,
        "computed": {
            "per_paycheck": per,
            "projected": projected,
            "projected_plus_one": projected_plus_one,
            "incremental_difference": projected_plus_one - projected
        }
    })

@app.route("/api/save", methods=["POST"])
def save():
    data = request.json
    settings["type"] = data["type"]
    settings["value"] = data["value"]
    return jsonify({"status": "ok", "settings": settings})

if __name__ == "__main__":
    app.run(debug=True)
