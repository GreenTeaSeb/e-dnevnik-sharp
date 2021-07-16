document.querySelector('html').innerHTML = ""

window.onload = () => {
    load();
}

const load = async() =>{
    const response = await fetch(browser.runtime.getURL("html/login.html"));
    const html = await response.text();
    document.querySelector('html').innerHTML =  html;

    const form = (await fetch_page("https://ocjene.skole.hr/login")).getElementsByClassName('form-login')[0]
    document.getElementById('container').appendChild(form)

    const i = document.getElementById('logo');
    let icon = browser.runtime.getURL("icons/icon2.svg");
    i.setAttribute('src', icon + " ");

    document.querySelector(`input[name='username']`).setAttribute('placeholder','email');
    document.querySelector(`input[name='password']`).setAttribute('placeholder','lozinka');
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