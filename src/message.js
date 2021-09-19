load("background").then(res => {
    if (res) {
        background_color(res)
    }
})


load("primary").then(res => {
    if (res) {
        res = res[0] != '#' ? res : '#' + res;
        primary_colors(res);
    }
})

load("accent").then(res => {
    if (res) {
        res = res[0] != '#' ? res : '#' + res;
        accent_color(res);
    }
})




browser.runtime.onMessage.addListener((req, sender, res) => {
    switch (req.message) {
        case "background":
            background_color(req.data)
            break;
        case "primary":
            primary_colors(req.data)
            break;
        case "accent":
            accent_color(req.data);
            break;
        default:
            break;
    }
})



function load(key) {
    return new Promise(resolve => {
        browser.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    }
    )
}

const primary_colors = (color) => {
    color = color[0] == '#' ? color.substr(1) : color;
    document.documentElement.style.setProperty("--primary", '#' + color)
    document.documentElement.style.setProperty("--primary-dark", edit_color(color, -10))
    document.documentElement.style.setProperty("--primary-light", edit_color(color, 10))
}

const background_color = (color) => {
    color = color[0] == '#' ? color.substr(1) : color;
    document.documentElement.style.setProperty("--background", "#" + color)
}
const accent_color = (color) => {
    color = color[0] == '#' ? color.substr(1) : color;
    document.documentElement.style.setProperty("--text-highlight", "#" + color)

    const i = document.querySelector(".custom-logo")
    const i2 = document.querySelector(".custom-logo-small")
    if (i) {
        i.contentDocument.getElementById('path6110').style.fill = "#" + color;
    }
    if (i2) {
        i2.contentDocument.getElementById('path6110').style.fill = "#" + color;
    }

}

const edit_color = (color, amount) => {
    color = color[0] == '#' ? color.substr(1) : color;
    let rgb = "#";
    for (let i = 0; i < color.length; i += 2) {
        const code = parseInt(color[i] + color[i + 1], 16);
        let edited = code + amount;
        edited = edited > 0 ? edited : "00";
        edited %= 256;
        let fin = edited.toString(16);
        fin = fin == "0" ? "00" : fin;
        rgb += fin;

    }
    return rgb;
}