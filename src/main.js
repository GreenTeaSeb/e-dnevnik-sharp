

document.querySelector("html").innerHTML = "";

window.onload = () => {
    const tab_icon = document.createElement("link");
    tab_icon.rel = "shortcut icon"
    tab_icon.href = browser.runtime.getURL("icons/icon32.png");
    document.head.appendChild(tab_icon)
    loading_screen()
}

let data = new Map();
let grade_count_for_average = 0;
let average_grade = 0;
let page_end = document.location.href.substr(document.location.href.lastIndexOf('/') + 1)
let username_data = "Unkown";


const loading_screen = async () => {

    const response = await fetch(browser.runtime.getURL("html/loading.html"));
    const html = await response.text();
    document.querySelector("html").innerHTML = html;

    const i = document.querySelector(".custom-logo")
    let icon = browser.runtime.getURL("icons/icon2.svg");
    i.setAttribute('src', icon + " ")


    document.getElementsByTagName("html")[0].style.display = "block";
    loading_data();
    console.log("loading screen");
}

const loading_data = async () => {
    console.log("load data");
    /* courses */

    const courses = await fetch_page("https://ocjene.skole.hr/course");

    data.set("course", courses)
    if (courses.querySelector('.list') !== null) {
        const list = courses.querySelector('.list').children

        username_data = courses.querySelector(".user-name").firstElementChild.innerText;
        /* grades of each course */

        for (const course of list) {
            const name = course.firstElementChild.firstElementChild.innerText;
            const link_to_grades = course.firstElementChild.href;
            const grades_page = await fetch_page(link_to_grades);
            data.set(name, grades_page);
        }
    }

    /* note */
    const notes = await fetch_page("https://ocjene.skole.hr/notes");
    data.set("notes", notes);

    /* schedule */
    const schedule = await fetch_page("https://ocjene.skole.hr/schedule");
    data.set("schedule", schedule);

    /* classes */
    const classes = await fetch_page("https://ocjene.skole.hr/class");
    data.set("classes", classes);

    /* behavior */
    const behavior = await fetch_page("https://ocjene.skole.hr/behavior");
    data.set("behavior", behavior);



    console.log("loaded data");

    main_html();
}



const main_html = async () => {
    console.log("loading main");
    const response = await fetch(browser.runtime.getURL("html/mainpage.html"));
    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, 'text/html');

    document.getElementsByTagName("html")[0].innerHTML = html

    document.body.style.overflowY = 'auto';

    load_sidebar();
    console.log("loaded main");
    document.getElementsByTagName("html")[0].style.display = "block";


}


const load_sidebar = async () => {
    // LOGO
    const i = document.querySelector(".custom-logo");
    const username = document.getElementById("username");
    username.firstElementChild.innerText = username_data;
    let icon = browser.runtime.getURL("icons/icon2.svg");
    i.setAttribute('src', icon + " ")
    //CATEGORIES

    const categories = document.getElementsByClassName("category")
    for (const category of categories) {
        category.addEventListener("click", function () {
            const cur = document.getElementsByClassName("active");
            if (!this.classList.contains("active")) {
                if (cur.length > 0)
                    cur[0].classList.remove('active')
                this.classList.add('active');
                set_content(this.id);
            }
        })
    }

    const search_input = document.getElementById('search-input');
    search_input.addEventListener("keyup", search);

    set_active();
    set_content(document.getElementsByClassName('active')[0].id);

}

const search = () => {
    switch (page_end) {
        case "course":
            hide_and_search(document.getElementsByClassName("course"));
            break;
        case "notes":
            hide_and_search(document.getElementsByClassName("section-text"));
            break;
        case "schedule":
            highlight_and_search(document.getElementsByClassName('table-cell'));
            break;
        default:
            break;
    }


}

const hide_and_search = (list) => {
    const search_term = document.getElementById('search-input').value.toUpperCase();

    for (course of list) {

        if (course.innerText.toUpperCase().indexOf(search_term) > -1) {
            course.style.display = "";
        } else
            course.style.display = "none"
    }
}

const highlight_and_search = (list) => {
    const search_term = document.getElementById('search-input').value.toUpperCase();

    for (course of list) {
        if (course.innerText.toUpperCase().indexOf(search_term) > -1) {
            course.classList.add("active-cell")
        } else
            course.classList.remove("active-cell")

        if (search_term == "")
            course.classList.remove("active-cell")
    }
}

const set_active = () => {
    const url = document.location.href
    page_end = url.substr(url.lastIndexOf('/') + 1)
    const id = document.getElementById(page_end);
    if (id)
        id.classList.add("active")
    else {
        document.getElementById('course').classList.add("active")
    }
}


const set_content = async (page) => {
    page_end = page;    
    try {
        switch (page) {
            case "course":
                await get_courses();
                break;
            case "notes":
               await get_notes();
                break;
            case "schedule":
                load_schedule();
                break;
            case "class":
                load_class();
                break;
            case "behavior":
               await load_behavior();
                break;
            case "exam":{
                load_exams();
                break;
            }
            case "absent":{
                load_absent();
                break;
            }
            case "logout":
                document.location.href = "/logout"
                break;
            default:
                const content = document.getElementById('display');
                content.innerHTML = ""
                break;
        }
    } catch (error) {
        console.log("missing data catch")
        load_missing_data();
    }
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


const get_average_grade = async (id) => {

    const course_page = data.get(id);
    const sub = document.getElementById(id);

    var final_grade = course_page.getElementsByClassName("final-grade");
    try {
        if (final_grade[0].lastElementChild.innerHTML == "") {

            var grades_table = course_page.getElementsByClassName("grade");
            var average = 0;
            var cur_num_of_grades = 0;

            for (const grade of grades_table) {
                if (grade.children.length > 0) { //get all of the grade slots
                    for (const grade_num of grade.firstElementChild.children) {
                        average = (cur_num_of_grades * average + parseInt(grade_num.innerHTML, 10)) / (cur_num_of_grades + 1)
                        cur_num_of_grades += 1;
                    }
                }
            }

            return Math.round(average * 100) / 100
        }
        return final_grade[0].lastElementChild.innerHTML;
    } catch (error) {
        return "nezaključeno"
    }

}

const display_average = async (subject_id) => {

    const grade = await get_average_grade(subject_id);
    const subject = document.getElementById(subject_id);
    const notes = subject.lastElementChild.lastElementChild;
    const final_grade = subject.getElementsByClassName("final-grade")[0]
    final_grade.innerText = grade;

    const confirmed_grade = document.getElementById('final-grade-average')

    if (typeof (grade) == 'number') {
        const num = Math.round(grade)
        average_grade = (grade_count_for_average * average_grade + num) / (grade_count_for_average + 1);
        grade_count_for_average += 1;
    } else if (grade != 'nezaključeno') {
        subject.classList.add('confirmed');
        const num = parseInt(grade.match(/\d+/)[0], 10)
        average_grade = (grade_count_for_average * average_grade + num) / (grade_count_for_average + 1);
        grade_count_for_average += 1;
    }

    confirmed_grade.innerText = Math.round(average_grade * 100) / 100

    subject.addEventListener("click", function (event) {
        event.stopPropagation();
        if (event.target.className) {
            const cur = document.getElementsByClassName("course");
            for (c of cur) {
                if (c.id != subject_id) {
                    c.classList.remove('active-course')
                    c.lastElementChild.classList.remove("active-grades");
                }
                else {

                }
            }
            this.classList.toggle("active-course")

            if (!this.classList.contains('active-course')) {
                if (this.classList.contains('expanded')) {
                    this.classList.remove('expanded')
                    setTimeout(function () {
                        subject.scrollIntoView({ behavior: "smooth", block: "center", inline: "start" });

                    }, 300)
                } notes.style.display = "none";
                for (c of cur) {
                    c.style.display = "block"
                }


            } else {
                setTimeout(function () {
                    subject.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                })
            }
            this.lastElementChild.classList.toggle("active-grades");

        }
    })

    const expand_button = subject.lastElementChild.children[1];
    expand_button.addEventListener("click", function (event) {
        event.stopPropagation()
        const cur = document.getElementsByClassName("course");


        subject.classList.toggle('expanded');


        if (subject.classList.contains('expanded'))
            for (c of cur) {
                if (c.id != subject_id) {
                    c.style.display = "none"
                    notes.style.display = "block"
                }
            }
        else
            for (c of cur) {
                c.style.display = "block"
                notes.style.display = "none"

                setTimeout(function () {
                    subject.scrollIntoView({ behavior: "smooth", block: "center", inline: "start" });

                }, 300)
            }


    })

}

const load_grades = (course) => {
    const table = course.lastElementChild.firstElementChild;
    const notes = course.lastElementChild.lastElementChild;
    const original = data.get(course.id)

    const original_table = original.getElementsByClassName("grades-table");
    const notes_table = original.getElementsByClassName("notes-table");
    if (original_table.length > 0) {
        const rows = original_table[0].children
        for (const row of rows) {
            if (row.className == "flex-table row") {
                const flexrow = document.createElement('div')
                const row_cells = document.createElement('div')
                const row_name = document.createElement('div')
                flexrow.className = "table-row"
                row_cells.className = "table-row"
                row_name.innerText = row.firstElementChild.innerText
                flexrow.appendChild(row_name)
                table.appendChild(flexrow);
                table.appendChild(row_cells);

                for (const cell of row.children) {
                    if (cell.classList.contains("grade")) {
                        const cell_t = document.createElement('div');
                        if (cell.children.length > 0) {
                            cell_t.innerHTML = cell.children[0].innerHTML
                        }

                        row_cells.appendChild(cell_t)
                    }
                }
            }
        }
    }

    if (notes_table.length > 0) {
        const rows = notes_table[0].children
        for (const row of rows) {

            if (row.classList.contains("row")) {
                const row_cells = document.createElement('div')
                row_cells.className = "table-row"
                notes.appendChild(row_cells)

                for (const cell of row.children) {
                    const cell_t = document.createElement('div');
                    if (cell.children.length > 0) {
                        cell_t.innerHTML = cell.innerHTML
                    }
                    row_cells.appendChild(cell_t)

                }

            }
        }
    }
}

const get_courses = async () => {
    
    const display = document.getElementById("display");
    const courses = await fetch_page(browser.runtime.getURL("html/courses.html"))
    const orignal = data.get("course");


    let list = orignal.querySelector('.list')
    if (list === null)
        throw 'missing courses'
    else
        list = list.children;
    display.innerHTML = courses.body.innerHTML;
    const courses_list = document.getElementById("courses-list")

    for (const course of list) {

        const name = course.firstElementChild.firstElementChild.innerText;
        const teachers_string = course.firstElementChild.children[1].innerText.replace(/\s+/g, ' ').trim();
        const link_to_grades = course.firstElementChild.href;

        const new_course = document.createElement("li")
        new_course.setAttribute("class", "course")
        new_course.classList.add("unselectable")
        new_course.setAttribute("id", name)

        const course_info = document.createElement('div');
        course_info.classList.add("course-info")
        const name_el = document.createElement("span");
        name_el.classList.add("name");
        name_el.innerText = name;
        const teacher = document.createElement("span");
        teacher.classList.add("teacher")
        teacher.innerText = teachers_string;

        const final_grade = document.createElement("span");
        final_grade.classList.add("final-grade")

        const grades_html = await fetch_page(browser.runtime.getURL("html/grades.html"))


        course_info.appendChild(name_el)
        course_info.appendChild(teacher)
        course_info.appendChild(final_grade)


        new_course.appendChild(course_info)
        new_course.appendChild(grades_html.body.firstElementChild)
        load_grades(new_course);
        courses_list.appendChild(new_course)



        display_average(new_course.id)
    }

}

const get_notes = async () => {
    const display = document.getElementById("display");
    const orignal = data.get("notes");

    display.innerHTML = orignal.querySelector(".content-wrapper").innerHTML;
}


const load_schedule = () => {

    const display = document.getElementById('display')
    display.innerHTML = '';
    let schedule_n = 0;


    const table = document.createElement("div");
    table.classList.add("table");
    table.classList.add("schedule");
    const original = data.get("schedule")
    const schedules = original.getElementsByClassName("schedule-table");
    const button_row = document.createElement('div')
    button_row.classList.add("button-row")

    const display_schedule = () => {
        table.innerHTML = "";
        const first_schedule = schedules[schedule_n];
        const rows_list = [];

        //getting the number of rows:
        const header_row = document.createElement("div");
        header_row.classList.add('table-row');
        rows_list.push(header_row);

        for (const rows of first_schedule.firstElementChild.lastElementChild.children) {
            const row = document.createElement("div");
            row.classList.add('table-row');
            const text = document.createElement("div");
            text.innerText = rows.lastElementChild.innerText
            // row.appendChild(text);
            rows_list.push(row)
        }

        // subjects
        for (let i = 0; i < rows_list.length; i++) {
            // 0th row
            for (const val of first_schedule.children) {
                const table_rows = val.children;

                if (table_rows.length > 2) {
                    const text = document.createElement('div');

                    text.innerText = table_rows[i].lastElementChild.innerText

                    let brs = text.getElementsByTagName("br");
                    while (brs.length > 0) {
                        for (const br of brs)
                            br.remove()
                    }

                    if (!text.innerText.trim().length) {
                        text.appendChild(document.createElement('br'));
                    }
                    if (table_rows[i].classList.contains('header')) {
                        text.classList.add('table-header')
                    } else {
                        text.classList.add('table-cell')
                    }
                    text.classList.add('unselectable')
                    rows_list[i].appendChild(text);

                } else {
                    /*
                    const text = document.createElement('div');
                    if (table_rows[i]) {
                        
                        if (table_rows[i].children.length < 2) { // header
                            text.innerText = table_rows[i].innerText
    
                        } else {
                            for (const row of table_rows[i].children) {
                                text.innerText = row.innerText;
                            }
                        }
                        
                    }
                    rows_list[i].appendChild(text);
                    */
                }

            }

            table.appendChild(rows_list[i])
        }
        search();
    }


    for (let i = 0; i < schedules.length; i++) {
        const button = document.createElement('div');
        button.innerText = i + 1;
        button.classList.add('table-selector')
        button.classList.add('unselectable')
        if (i == 0)
            button.classList.add('selected-table')
        button_row.appendChild(button)

        button.addEventListener('click', () => {
            const cur = document.getElementsByClassName("selected-table");
            if (!button.classList.contains("selected-table")) {
                if (cur.length > 0)
                    cur[0].classList.remove('selected-table')
                button.classList.add('selected-table');
                schedule_n = i;
                display_schedule();
            }
        });
    }

    display.appendChild(button_row)
    display_schedule();


    display.appendChild(table)


}

const load_class = () => {
    const display = document.getElementById("display");
    const orignal = data.get("classes");
    display.innerHTML = "";
    display.appendChild(document.createElement("div"))
    display.firstElementChild.setAttribute('id', 'classes-container')
    for (const class_info of orignal.getElementsByClassName('class-info')) {
        const class_template = document.querySelector('#class-template').content.cloneNode(true);
        class_template.firstElementChild.firstElementChild.href = class_info.firstElementChild.href
        class_template.firstElementChild.firstElementChild.innerText = class_info.firstElementChild.firstElementChild.innerText + class_info.firstElementChild.lastElementChild.innerText
        class_template.firstElementChild.lastElementChild.lastElementChild.innerText = class_info.getElementsByClassName("overall-grade")[0].lastElementChild.innerText

        for (const link of class_template.querySelector('.shortcuts').children) {
            link.firstElementChild.href = class_info.firstElementChild.href.substr(0, class_info.firstElementChild.href.lastIndexOf('/')) + link.firstElementChild.href.substr(link.firstElementChild.href.lastIndexOf('/'))
        }
        display.firstElementChild.appendChild(class_template)
    }
}


const load_behavior = async () => {
    const display = document.getElementById("display");
    const orignal = data.get("behavior");

    display.innerHTML = "";
    const container = document.createElement('div');
    container.classList.add('content')
    container.innerHTML = orignal.querySelector(".content").innerHTML
    for (const child of container.children) {
        if (child.classList.contains('table-container')) {
            container.removeChild(child);
            const table = document.createElement('div');
            table.classList.add('table')
            for (const row of child.children) {
                const new_row = document.createElement('div');
                new_row.classList.add('table-row')
                for (const cell of row.children) {
                    const new_cell = document.createElement('div');
                    if (row.classList.contains('header')) {
                        new_cell.classList.add('table-header')
                        new_cell.innerText = cell.innerText
                    } else
                        new_cell.innerHTML = cell.innerHTML

                    new_row.appendChild(new_cell)
                }
                table.appendChild(new_row);
            }

            container.appendChild(table);
        }
    }

    display.appendChild(container);

}

const load_missing_data = async () => {
    const display = document.getElementById("display");
    const template = document.querySelector('#missing-data-template')
    display.innerHTML = template.innerHTML;
}