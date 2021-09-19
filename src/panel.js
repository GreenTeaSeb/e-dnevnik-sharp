
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("background-color").addEventListener("input", (event) => {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            if (/^[0-9a-fA-F]{8}$|[0-9a-fA-F]{6}$|[0-9a-fA-F]{4}$|[0-9a-fA-F]{3}$/.test(event.target.value)) {
                browser.tabs.sendMessage(tabs[0].id, { "message": "background", "data": event.target.value });
                browser.storage.local.set({ "background": event.target.value });
                document.documentElement.style.setProperty("--background", "#" + event.target.value);
            }else{
                browser.tabs.sendMessage(tabs[0].id, { "message": "background", "data": "1a1b26"});
                browser.storage.local.set({ "background": "1a1b26"});
                document.documentElement.style.setProperty("--background", "#1a1b26");
            }

            
        });
    })

    document.getElementById("primary-color").addEventListener("input", (event) => {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            if (/^[0-9a-fA-F]{8}$|[0-9a-fA-F]{6}$|[0-9a-fA-F]{4}$|[0-9a-fA-F]{3}$/.test(event.target.value)){
                browser.tabs.sendMessage(tabs[0].id, { "message": "primary", "data": event.target.value });
                browser.storage.local.set({ "primary": event.target.value });     
                document.documentElement.style.setProperty("--primary", "#" + event.target.value);     
            }else{
                browser.tabs.sendMessage(tabs[0].id, { "message": "primary", "data": "25293c"});
                browser.storage.local.set({ "primary": "25293c" });
                document.documentElement.style.setProperty("--primary", "#25293c");
            }
        });
    })

    document.getElementById("accent-color").addEventListener("input", (event) => {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            if (/^[0-9a-fA-F]{8}$|[0-9a-fA-F]{6}$|[0-9a-fA-F]{4}$|[0-9a-fA-F]{3}$/.test(event.target.value)){
                browser.tabs.sendMessage(tabs[0].id, { "message": "accent", "data": event.target.value });
                browser.storage.local.set({ "accent": event.target.value });       
            }else{
                browser.tabs.sendMessage(tabs[0].id, { "message": "accent", "data": "ff3c5e"});
                browser.storage.local.set({ "accent": "ff3c5e" });
            }
        });
    })


    load("background").then(res => {
        if (res){
            document.getElementById('background-color').value = res;
            document.documentElement.style.setProperty("--background", "#" + res)
        }
    })

    load("primary").then(res => {
        if (res){
            document.getElementById('primary-color').value = res;
            document.documentElement.style.setProperty("--primary", "#" + res);
        }
    })
    load("accent").then(res => {
        if (res){
            document.getElementById('accent-color').value = res;
        }
    })


})


function load(key) {
    return new Promise(resolve => {
        browser.storage.local.get(key, (result) => {
            resolve(result[key]);
        });
    }
    )
}