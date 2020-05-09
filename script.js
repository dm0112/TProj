console.log("hello");
//sendText("Unul dintre cele mai populare simboluri ale orașului Iași este Palatul Culturii. Opera arhitectului I.D. Berindei a fost realizată în perioada 1906 – 1925, fiind inaugurată de regele Ferdinand al României.Această clădire impresionantă este sediul a numeroase instituții culturale de prestigiu din acest oraș și a fost pusă în valoare prin recenta sa reabilitare.În cadrul Palatului Culturii din Iași vei descoperi patru muzee, care te vor ajuta să înțelegi mai bine istoria și cultura acestor meleaguri: Muzeul de Istorie al Moldovei, Muzeul Etnografic, Muzeul de Artă și Muzeul Științei și Tehnologiei Ștefan Procopiu.");
//sendText("Biserica din cărămidă de la sfârșitul secolului XV-lea, de lângă Palatul Culturii, este Biserica Sf. Nicolae… O plimbare de 5 minute spre nord, pe Bulevardul Ștefan cel Mare, te duce la Biserica Trei Ierarhi (str. Ștefan cel Mare și Sfânt nr. 28)... Biserica Armenească de la începutul secolului XIX-lea se află pe Strada Armenească, o plimbare de 8 minute la nord-est de Piața Palatului, pe Strada Costache Negri… Mergi puțin mai departe spre nord, până pe Strada Cuza Vodă nr. 51, unde se înalță Mănăstirea Golia.");
let textArea = document.getElementById("ourText");
document.getElementById("submitourText").addEventListener("click",function(){
sendText(textArea.value.trim());
 
})
let txtFromLink = "";
// //     var request = new XMLHttpRequest();
// // request.open("GET", "https://bypasscors.herokuapp.com/api/?url=" + encodeURIComponent("https://duckduckgo.com/html/?q=stack+overflow"), true);  // last parameter must be true
// // request.responseType = "document";
// // request.onload = function (e) {
// //   if (request.readyState === 4) {
// //     if (request.status === 200) {
// //       var a = request.responseXML.querySelector("div.result:nth-child(1) > div:nth-child(1) > h2:nth-child(1) > a:nth-child(1)");
// //       console.log(a.href);
// //       document.body.appendChild(a);
// //     } else {
// //       console.error(request.status, request.statusText);
// //     }
// //   }
// // };
// // request.onerror = function (e) {
// //   console.error(request.status, request.statusText);
// // };
// // request.send(null);



// crawCraw("https://www.adelapopescu.eu/viata-inainte-si-dupa-aparitia-copilului-diminetile/");
// doesn't work
// crawCraw();
// crawCraw("https://www.adelapopescu.eu/viata-inainte-si-dupa-aparitia-copilului-diminetile/");
function sendText(textOrLink){
    let text= "" ;
    if ((textOrLink.search("https://") || textOrLink.search("http://")) && textOrLink.split(' ').length == 1)
       { //// todo daca este URL sa apeleze functia si raspunsul trebuie pus in variabila text
        // text = await crawCraw(textOrLink);
        let parsedText="";
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const fetchPromise = fetch(proxyurl+textOrLink);
        fetchPromise.then(response => {
            return response.text();
        }).then(contents => {
            let parser = new DOMParser()
            let doc;
                doc = parser.parseFromString(contents, "text/html");
            for (let i = 0; i<doc["body"].getElementsByTagName("P").length;i++)
            { element  = doc["body"].getElementsByTagName("P");
            if(element[i].innerHTML.charCodeAt(0) >=65 && element[i].innerHTML.charCodeAt(0)<=88){
                parsedText = parsedText + element[i].innerHTML + " ";
           }
        }
        parsedText = convertHtmlToText(parsedText);
        text=parsedText;
        textArea.innerText=text;
        crawl(text);
        });
        
    }
    else {text = textOrLink;
        crawl(text);
    }
    
 
}
function crawl(text){
    // console.log(retur);
    data = "https://relate.racai.ro/index.php?teprolinws&path=teprolinws&text="+text+"&&exec=";
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    fetch(proxyurl + data)
    .then(response => response.text())
    .then(function(contents){
        // console.log(contents);
        var obj={};
        try{
            obj=JSON.parse(contents) ;
        }catch(err){
            errorfn();
            return;
        }
        //var conll=JSON2CONLLU(obj["teprolin-result"]["tokenized"],obj["teprolin-result"]["sentences"]);
 
        let parsedLocations=[];
        //console.log(words);
        for (let i=0;i<obj["teprolin-result"]["tokenized"].length;i++)
        parsedLocations=parsedLocations.concat(parseWords(obj["teprolin-result"]["tokenized"][i]));
       // console.log(obj["teprolin-result"]["tokenized"][4]);
       //console.log(parsedLocations);
        let wanted = [
            "raul","paraul","izvorul","marea","lacul","cascada","Raul","Paraul","Cascada","Izvorul","Marea","Lacul",
            "strada","aleea","calea","soseaua","Strada","Aleea","Calea","Soseaua","str.","str","Str","Bulevardul","bulevardul","drum","Drum","Muzeul","muzeul"
            ,"Biserica","Manastirea","Mitropolia","Catedrala","biserica","manastirea","mitropolia","catedrala"
        ]
        let temp = [];
        let temp2= getThemCities(textArea.value);    
        // console.log(temp2);
        for(let i=0;i<parsedLocations.length;i++)
        if(includeMoreThenOne(parsedLocations[i],wanted))
        temp.push(parsedLocations[i]);
       
//      console.log(temp);
        parsedLocations=temp;
       
        populateWithLocations(parsedLocations);    
       
        console.log(parsedLocations);
       
    })
    .catch(() => console.log("Cannot access " + data + " response. Blocked by browser?"))
 
}


function convertHtmlToText(str)
{
   str = str.toString();
    str = str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ' ');
    str= str.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, ' ');
    return str;
}
function getThemCities(text){
    let temp2=[];
    for(let i = 0; i<text.split(" ").length;i++){
        if(text.split(" ")[i].charCodeAt(0)>=65 &&
        text.split(" ")[i].charCodeAt(0)<=90)
        temp2.push(text.split(" ")[i]);
    }
    return temp2;
}
function allWordsAreInUpper(location){
 
    for(let i=1;i<location.split(" ").length;i++){
        //console.log(location.split(" "));
        if(!location.split(" ")[i].match(/[A-Z]/)){
        //console.log(location.split(" ")[i]);
        return false;
}
}
    return true;
}
function includeMoreThenOne(location,words){
    let ok = false;
   
    for(let i=0;i<words.length;i++)
            if(location.indexOf(words[i]) >= 0)
            {ok=true;
           
            break;
       
    }
    if(allWordsAreInUpper(location))
    ok=true;
    return ok;
}
function parseWords(words2){
    let i=1;
    var words=[];
    while(getAllWhoHaveChunk("Np#"+i,words2) !=""){
       
        let word =getAllWhoHaveChunk("Np#"+i,words2);
        if(word.split(" ").length>2)words.push(word);
        i++;
    }
    return words;
}
function getAllWhoHaveChunk(text,list){
   let word = "";
   for(let i=0;i<list.length;i++){
       let chunks=list[i]._chunk.split(",");
       //console.log(chunks);
       if (chunks.indexOf(text) >= 0 ){
           word+=" "+list[i]._wordform;
       }
   }
   return word;
 
}
function populateWithLocations(locations){
    let where = ["start","end","waypoints"];
   
        where.forEach(element => {
            locations.forEach(location =>{
                let option1 = document.createElement("option");
                option1.setAttribute("value",location);
                // if(element=="waypoints")option1.setAttribute("selected","true");
                option1.text=location;
                document.getElementById(element).appendChild(option1);
            });
        });
        document.getElementById("end").selectedIndex=document.getElementById("end").options.length-1;
       
}
 
 
 
 
// Get the modal
var modal = document.getElementById("myModal");
 
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
 
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
 
// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}
 
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}
 
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
