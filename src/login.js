document.querySelector('html').innerHTML = ""

load_storage("background").then(res => {
    if (res)
        document.documentElement.style.setProperty("--loading", '#' + res)
})


window.onload = () => {
    const tab_icon = document.createElement("link");
    tab_icon.rel = "shortcut icon"
    tab_icon.href = browser.runtime.getURL("icons/icon32.png");
    document.head.appendChild(tab_icon)
    load();
}

const load = async () => {
    const response = await fetch(browser.runtime.getURL("html/login.html"));
    const html = await response.text();
    document.querySelector('html').innerHTML = html;

    for (let i = 0; i < 200; i++)
        document.getElementById('bg').textContent += Math.random().toString(36);

    document.getElementById('bg').classList.add('unselectable');

    const form = (await fetch_page("https://ocjene.skole.hr/login")).getElementsByClassName('form-login')[0]
    document.getElementById('container').appendChild(form)

    const i = document.getElementById('logo');
    let icon = browser.runtime.getURL("icons/icon2.svg");
    i.setAttribute('src', icon + " ");

    const username = document.querySelector(`input[name='username']`);
    const password = document.querySelector(`input[name='password']`);



    username.setAttribute('placeholder', 'email');
    password.setAttribute('placeholder', 'lozinka');

    document.querySelector(`input[type='submit']`).addEventListener('click', (event) => {
        event.preventDefault();

        if (username.value && password.value) {
            document.getElementById('out').classList.toggle('circle')
            setTimeout(() => {
                form.submit();
            }, 500);

        }
    });
}


const fetch_html = async (link) => {
    const response = await fetch(link);
    const html = await response.text();

    return html;
}

const fetch_page = async (page) => {
    const html = await fetch_html(page)
    return new DOMParser().parseFromString(html, 'text/html');
}

function load_storage(key) {
    return new Promise(resolve => {
        browser.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    }
    )
}
