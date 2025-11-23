function formatMoney(n) {
    return "$" + Math.round(n).toLocaleString();
}

let typeRadios = document.getElementsByName("type");
let slider = document.getElementById("slider");
let input = document.getElementById("amount-input");
let amountLabel = document.getElementById("amount-label");
let saveBtn = document.getElementById("save-btn");
let saveMsg = document.getElementById("save-message");

function updateLabel() {
    let type = document.querySelector("input[name='type']:checked").value;

    if (type === "percent") {
        amountLabel.innerText = "Contribution % per paycheck";
        slider.max = 50;
        slider.step = 0.5;
    } else {
        amountLabel.innerText = "Contribution $ per paycheck";
        slider.max = 5000;
        slider.step = 10;
    }
}

function loadData() {
    fetch("/api/get")
        .then(res => res.json())
        .then(data => {
            let u = data.user;
            let s = data.settings;
            let c = data.computed;

            // Fill UI
            document.getElementById("salary").innerText = formatMoney(u.salary);
            document.getElementById("checks").innerText = u.paychecks_per_year;
            document.getElementById("ytd").innerText = formatMoney(u.ytd_contributions);
            document.getElementById("per").innerText = formatMoney(c.per_paycheck);

            document.getElementById("projected").innerText = formatMoney(c.projected);
            document.getElementById("projected-plus").innerText = formatMoney(c.projected_plus_one);
            document.getElementById("extra").innerText = formatMoney(c.incremental_difference);

            // Set the contribution type (percent/dollar)
            document.querySelector(`input[value="${s.type}"]`).checked = true;

            // FIRST update slider bounds based on type
            updateLabel();

            // THEN apply the actual value from backend
            slider.value = s.value;
            input.value = s.value;
        });
}

slider.oninput = () => {
    input.value = slider.value;
};

input.oninput = () => {
    slider.value = input.value;
};

typeRadios.forEach(r => r.onchange = () => {
    updateLabel();
});

saveBtn.onclick = () => {
    let body = {
        type: document.querySelector("input[name='type']:checked").value,
        value: Number(input.value)
    };

    fetch("/api/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(() => {
        saveMsg.innerText = "Saved!";
        setTimeout(() => saveMsg.innerText = "", 2000);
        loadData();  // refresh values
    });
};

loadData();
