console.log("hello");
let textArea = document.getElementById("ourText"); // textarea din html
var globalCounterPara = 0; // counter global fragmente
var alreadyUsed = []; //stocam localitati in mod unic in aceasta lista
document.getElementById("submitourText").addEventListener("click", function () { // butonul din josul paginii
    crawCraw(textArea.value.trim());

})


function crawCraw(textOrLink) { //functie responsabila cu luarea textului din body, apelarea celeilalte functii pentru NLP
    let text = "";
    if ((textOrLink.search("https://") || textOrLink.search("http://")) && textOrLink.split(' ').length == 1) { //// todo daca este URL sa apeleze functia si raspunsul trebuie pus in variabila text
        // text = await crawCraw(textOrLink);
        let parsedText = "";
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const fetchPromise = fetch(proxyurl + textOrLink);
        fetchPromise.then(response => {
            return response.text();
        }).then(contents => {
            let parser = new DOMParser()
            let doc;

            doc = parser.parseFromString(contents, "text/html");
            for (let i = 0; i < doc["body"].getElementsByTagName("p").length; i++) {
                element = doc["body"].getElementsByTagName("p");
                // element = element + doc["body"].getElementsByTagName("p");
                // console.log(element[i].innerHTML);

                if ((element[i].innerHTML.charCodeAt(0) >= 65 && element[i].innerHTML.charCodeAt(0) <= 90) || element[i].innerHTML[0] == "•" 
                || element[i].innerHTML[0]=='"' || element[i].innerHTML[0]=="'") { // luam continutul paragrafelor
                    parsedText = parsedText + element[i].innerHTML + " ";
                }
            }
            // console.log(parsedText);
            // alert("ok");
            parsedText = convertHtmlToText(parsedText); // eliminam elemente html, spre exemplu <br> 
            // console.log(parsedText);
            text = parsedText.trim();
            textArea.value = text; // dupa ce am facut textul citibil, il vom inlocui in HTML
            // console.log(text);
            // alert("ok1");
            let sentecesList = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+/g); //despartim in propozitii intregi
            let oneBigParagraph = "";
            for (let i = 0; i < sentecesList.length; i++) {
                if (oneBigParagraph.length > 200) {         //cate caractere sa trimit cu request-ul, dupa ~500 eroare
                    console.log(oneBigParagraph);
                    sendText(oneBigParagraph);
                    oneBigParagraph = sentecesList[i]; // salvam proprozitia curent
                    globalCounterPara++;
                }
                else {
                    oneBigParagraph = oneBigParagraph + sentecesList[i]; //construim pentru send

                }



            }
            if (oneBigParagraph.length > 5)
                sendText(oneBigParagraph);
            // sendText(text);

        });

    }
    else {
        text = textOrLink;

        let sentecesList = text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+/g); //despartim in propozitii intregi
        let oneBigParagraph = "";
        for (let i = 0; i < sentecesList.length; i++) {
            if (oneBigParagraph.length > 200) {         //cate caractere sa trimit cu request-ul, dupa ~300-500 eroare
                sendText(oneBigParagraph);
                oneBigParagraph = sentecesList[i]; // salvam proprozitia curent
                // console.log(oneBigParagraph);
                globalCounterPara++;
            }
            else {
                oneBigParagraph = oneBigParagraph + sentecesList[i]; //construim pentru send

            }



            // sendText(text);
        }
        if (oneBigParagraph.length > 5)
            sendText(oneBigParagraph);
        // console.log(oneBigParagraph);
    }

    // test
}
function sendText(text) { //functia responsabila de apelul api catre racai si procesarea partiala a textului
    // console.log(retur);
    data = "https://relate.racai.ro/index.php?teprolinws&path=teprolinws&text=" + text + "&&exec=";
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    fetch(proxyurl + data)
        .then(response => response.text())
        .then(function (contents) {
            // console.log(contents);
            var obj = {};
            try {
                obj = JSON.parse(contents);
            } catch (err) {
                errorfn();
                return;
            }
            //var conll=JSON2CONLLU(obj["teprolin-result"]["tokenized"],obj["teprolin-result"]["sentences"]);

            let parsedLocations = [];
            //console.log(words);
            for (let i = 0; i < obj["teprolin-result"]["tokenized"].length; i++)
                parsedLocations = parsedLocations.concat(parseWords(obj["teprolin-result"]["tokenized"][i]));
            // console.log(obj["teprolin-result"]["tokenized"][4]);
            //console.log(parsedLocations);





            parsedLocations = remakeListWithoutOnlyLower(parsedLocations);// functii pentru rafinarea rezultatelor
            parsedLocations = checkLowerWords(parsedLocations);

            // for(let i=0;i<parsedLocations.length;i++)
            // if(includeMoreThenOne(parsedLocations[i],wanted))
            // temp.push(parsedLocations[i]);

            // // console.log(temp);
            // parsedLocations=temp;

            populateWithLocations(parsedLocations); // apelam popularea, doar in lista ! (popularea html se va face dupa ce am terminat fragmentele de procesat)
            console.log(parsedLocations);
            document.getElementById("submitourText").innerHTML = "Remaining requests: " + --globalCounterPara; // afisam cate request-uri mai sunt pana sa se termine fiecare fragment de procesat
            //  console.log(globalCounterPara);
            if (globalCounterPara <= 0)
                document.getElementById("submitourText").innerHTML = "SUBMIT TEXT/ LINK"; // dupa ce am terminat procesarea cu API-ul RACAI, textul de pe buton revine la normal
        })
        .catch(() => console.log("Cannot access " + data + " response. Blocked by browser?"))

}

function checkLowerWords(parsedLocations) {
    let newList = [];
    let wanted = [
        "raul", "paraul", "izvorul", "marea", "lacul", "cascada", "Raul", "Paraul", "Cascada", "Izvorul", "Marea", "Lacul",
        "strada", "aleea", "calea", "soseaua", "Strada", "Aleea", "Calea", "Soseaua", "str.", "str", "Str", "Bulevardul", "bulevardul", "drum", "Drum", "Muzeul", "muzeul"
        , "Biserica", "Manastirea", "Mitropolia", "Catedrala", "biserica", "manastirea", "mitropolia", "catedrala", "plaja", "Baia", "satul", "judetul", "orasul"
    ]
    let notWanted = ["meu", "mea", "mei", "tau", "tai", "ma", "lor",
        "cu", "in", "la", "pe", "per", "pro", "sub", "lei", "jos"
    ]
    let notWantedBig = ["UE", "UV", "US"]
    for (let j = 0; j < parsedLocations.length; j++) {
        let ffs = parsedLocations[j].trim();        ////parsedLocations este o lista cu de grupari de cuvinte, o locatie va fi pe pozitia j 
        let lowWordsCounter = 0; // un fel de heuristic
        let temp = ffs.split(' ').length - 1;
        for (let i = 1; i < ffs.split(' ').length; i++) {                                                                                 // for 1 - (n-1)
            if (ffs.split(' ')[i].charCodeAt(0) >= 97 && ffs.split(' ')[i].charCodeAt(0) <= 122) {                                                 // daca al doilea cuvant din propozitia ce se vrea a fi o locatie, cel mai probabil nu este o locatie, asa ca il voi penaliza
                lowWordsCounter += 1;
                if (ffs.split(' ')[i].length > 3 && ffs.split(' ')[0] != "sudul" && ffs.split(' ')[0] != "nordul" && ffs.split(' ')[0] != "vestul" && // [0] se refera la primul cuvant, am plecat de la 1 in for-ul de mai sus
                    ffs.split(' ')[0] != "estul" && !wanted.includes(ffs.split(' ')[0]))             // verificam daca cuvintele de la 1 pana la n-1, cu lungimi mai mari de 3 daca sunt sau nu in lista de cuvinte cautate
                    lowWordsCounter += 1;                                /// daca nu sunt, acestea vor primi o penalizare ---- la doua puncte de penalizare grupul de cuvinte va fi sters din lista----
                if (notWanted.includes(ffs.split(' ')[i]))
                    lowWordsCounter += 2; // daca exista un cuvant de lungime mai mare de 3 incepand cu litera mica sau ultimul cuvant incepe cu litera mica, il penalizez
                if (i == temp)
                    lowWordsCounter += 1;
            }
            else {
                if (notWantedBig.includes(ffs.split(' ')[i])) /// daca apare un cuvant din lista notWanted, si incepe cu litera mare, il voi elimina deoarece constituie o ambiguitate
                    lowWordsCounter += 2;
            }
        }
        if (lowWordsCounter < 2)
            newList.push(ffs);
        // console.log(ffs);  
    }
    return newList;
}

function remakeListWithoutOnlyLower(parsedLocations) { // daca aveam un sir de cuvinte ce erau formate fara niciun nume de locatie / localitate, le scoteam din lista folosind metoda de mai jos
    pLocTemp = [];
    for (let i = 0; i < parsedLocations.length; i++) {
        if (checkIfAllLower(parsedLocations[i]))
            pLocTemp.push(parsedLocations[i]);
    }
    return pLocTemp;
}

function checkIfAllLower(sen) {
    ffs = sen.trim();
    for (let i = 0; i < ffs.split(' ').length; i++)
        if (ffs.split(' ')[i].charCodeAt(0) >= 65 && ffs.split(' ')[i].charCodeAt(0) <= 90)
            return true;
    return false;
}

function convertHtmlToText(str) //eliminare taguri/ emojis si alte elemente
{
    str = str.toString();
    str = str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    str = str.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ');
    return str;
}

function parseWords(words2) { // am folosit metoda asta, in combinatie cu cea de mai jos pentru a extrage partile de vorbire de tip "Np#" din rezultatul de la API
    let i = 1;
    var words = [];
    while (getAllWhoHaveChunk("Np#" + i, words2) != "") {

        let word = getAllWhoHaveChunk("Np#" + i, words2);
        if (word.split(" ").length > 2) words.push(word);
        i++;
    }
    return words;
}
function getAllWhoHaveChunk(text, list) {
    let word = "";
    for (let i = 0; i < list.length; i++) {
        let chunks = list[i]._chunk.split(",");
        //console.log(chunks);
        if (chunks.indexOf(text) >= 0) {
            word += " " + list[i]._wordform;
        }
    }
    return word;

}
function populateWithLocations(locations) {
    let where = ["start", "end", "waypoints"];

    where.forEach(element => {
        locations.forEach(location => {
            if (!alreadyUsed.includes(location)) {
                // let option1 = document.createElement("option");
                // option1.setAttribute("value",location);
                // // if(element=="waypoints")option1.setAttribute("selected","true");
                // option1.text=location;
                // document.getElementById(element).appendChild(option1);
                alreadyUsed.push(location);
            }
        });
    });
    if (globalCounterPara <= 0)
        populateWithLocationsUnique()
    // calling this method for every fragment that comes from the api
    // in order to fields unique, I'm populating the html after all the calls finished using the method below, globalCounterPara denotes the numbers of calls ongoing

}
function populateWithLocationsUnique() {
    let where = ["start", "end", "waypoints"];
    for (let element = 0; element < where.length; element++)
        for (let i = 0; i < alreadyUsed.length; i++) {
            let option1 = document.createElement("option");
            option1.setAttribute("value", alreadyUsed[i]);
            // if(element=="waypoints")option1.setAttribute("selected","true");
            option1.text = alreadyUsed[i];
            document.getElementById(where[element]).appendChild(option1);
        }
    document.getElementById("end").selectedIndex = document.getElementById("end").options.length - 1;
    alreadyUsed =[];
}



// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}





// function getThemCities(text){ // deprecated
//     let temp2=[];
//     for(let i = 0; i<text.split(" ").length;i++){
//         if(text.split(" ")[i].charCodeAt(0)>=65 &&
//         text.split(" ")[i].charCodeAt(0)<=90)
//         temp2.push(text.split(" ")[i]);
//     }
//     return temp2;
// }
// function allWordsAreInUpper(location){ //deprecated

//     for(let i=1;i<location.split(" ").length;i++){
//         //console.log(location.split(" "));
//         if(!location.split(" ")[i].match(/[A-Z]/)){
//         //console.log(location.split(" ")[i]);
//         return false;
// }}
//     return true;
// }

// function includeMoreThenOne(location,words){ // deprecated
//     let ok = false;

//     for(let i=0;i<words.length;i++)
//             if(location.indexOf(words[i]) >= 0)
//             {ok=true;

//             break;

//     }
//     if(allWordsAreInUpper(location))
//     ok=true;
//     return ok;
// }